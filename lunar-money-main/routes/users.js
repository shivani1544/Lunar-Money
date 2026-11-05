const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { isLoggedIn } = require("../middleware");
const { storeReturnTo } = require("../middleware");

// debugging route
router.use((req, res, next) => {
    console.log(req.method, req.originalUrl);
    next();
});

router.get("/register", (req, res) => {
    res.render("pages/register", {
        layout: "auth_layout",
        title: "Lunar Money - Register"
    });
});

// password validation
function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

// this is async because we have to wait on the db
router.post("/register", async (req, res) => {
    try {
        // destructure req.body
        const { email, username, password, currency } = req.body;
        // validate password
        if (!validatePassword(password)) {
            return res.status(400).render("pages/register", {
                layout: "auth_layout",
                title: "Lunar Money - Register",
                error: "Password must be at least 8 characters and include at least one number and one letter."
            });
        }
        const user = new User({ email, username, currency });
        const registeredUser = await User.register(user, password);
        // automatically log the user in with the new user info
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
    } catch (e) {
        console.log(e);
        res.redirect("/register");
    }
});

router.get("/login", (req, res) => {
    res.render("pages/login", {
        layout: "auth_layout",
        title: "Lunar Money - Login"
    });
});

router.post("/login", storeReturnTo, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            // User not found or password incorrect
            return res.status(400).render("pages/login", {
                layout: "auth_layout",
                title: "Lunar Money - Login",
                error: info.message // info contains the message from passport
            });
        }
        req.login(user, (err) => {
            if (err) return next(err);
            const redirectUrl = res.locals.returnTo || "/";
            delete req.session.returnTo;
            return res.redirect(redirectUrl);
        });
    })(req, res, next);
});

router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

router.get("/account", isLoggedIn, (req, res) => {
    res.render("pages/account", {
        title: "Your Account",
        user: req.user,
        success: req.session.success,
        error: req.session.error
    });

    // Clear the messages so they don't persist
    req.session.success = null;
    req.session.error = null;
});

// update non password account fields
router.post("/account/update", isLoggedIn, async (req, res) => {
    try {
        const { email, currency, username } = req.body;

        // Update simple fields
        const user = await User.findById(req.user._id);
        user.username = username;
        user.email = email;
        user.currency = currency;

        await user.save();

        res.redirect("/account");
    } catch (err) {
        console.error(err);
        res.redirect("/account");
    }
});

// update password
router.post("/account/change-password", isLoggedIn, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!validatePassword(newPassword)) {
            req.session.error =
                "Password must be at least 8 characters and include at least one number and one letter.";
            return res.redirect("/account");
        }

        await req.user.changePassword(currentPassword, newPassword);
        req.session.success = "Password changed successfully!";
        res.redirect("/account");
    } catch (err) {
        console.error(err);
        req.session.error = "An error occurred while changing your password.";
        res.redirect("/account");
    }
});

// delete account
router.post("/account/delete", isLoggedIn, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        req.logout(() => {
            res.redirect("/");
        });
    } catch (err) {
        console.error(err);
        res.redirect("/account");
    }
});

module.exports = router;
