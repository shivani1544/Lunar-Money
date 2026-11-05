// with node, requires are similar to imports
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const { isLoggedIn } = require("./middleware");
const userRoutes = require("./routes/users");
const entryRoutes = require("./routes/entries");
const budgetRoutes = require("./routes/budgets");
const notificationRoutes = require("./routes/notifications");
const goalRoutes = require("./routes/goals");
const recurringRouter = require("./routes/recurring");
const insightsRoutes = require("./routes/insights");
const Entry = require("./models/entry");
const Goal = require("./models/goal");
const Recurring = require("./models/recurring");
const expressLayouts = require("express-ejs-layouts");

require("dotenv").config();

const app = express();

// set up configuration for session
const sessionConfig = {
    secret: process.env.SESSION_SECRET, // this is in the .env
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // one week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

// set up ejs
app.set("view engine", "ejs");
// serve ejs files from views folder
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts); // set up layouts
app.set("layout", "layout"); // default layout file: views/layout.ejs

// set up sessions (kind of like server side cookies)
app.use(session(sessionConfig));

// set up passport
app.use(passport.initialize());
// allow persistent login sessions
app.use(passport.session());

// use passport's local strategy for user auth
passport.use(new localStrategy(User.authenticate()));

// set passport to serialize and deserialize user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set up bodyparser middleware
app.use(express.json()); // Add JSON parsing
app.use(bodyParser.urlencoded({ extended: true }));

// set up method-override so we can have routes like DELETE etc, must go after bodyParser!
app.use(methodOverride("_method"));

// static files are still in public
app.use(express.static(path.join(__dirname, "public")));

// set local for req.user
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// connect to MongoDB using env var stored on render
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error: ", err));

// routes --------------------------------------------------------
app.use("/api/budgets", budgetRoutes.router); // set up budget routes
app.use("/api/notifications", notificationRoutes); // set up notifications routes
app.use("/transactions", entryRoutes); // set up transactions routes
app.use("/recurring", recurringRouter); // set up recurring routes
app.use("/", userRoutes); // set up user routes
app.use("/api/goals", goalRoutes); // set up goal routes
app.use("/api/insights", insightsRoutes); // set up insights routes

// Helper function to format dates
function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString();
}

// get route for main page (Dashboard)
app.get("/", isLoggedIn, async (req, res) => {
    try {
        // Calculate Savings (Net Worth)
        const entries = await Entry.find({ user: req.user._id });
        let totalIncome = 0;
        let totalExpenses = 0;

        entries.forEach(entry => {
            if (entry.amount > 0) {
                totalIncome += entry.amount;
            } else {
                totalExpenses += Math.abs(entry.amount);
            }
        });

        const netWorth = totalIncome - totalExpenses;

        const savings = {
            current: netWorth,
            goal: 10000, // Default goal - could make this user-configurable later
            lastUpdated: new Date().toLocaleDateString()
        };

        // Get Upcoming Recurring Transactions (next 5, sorted by date)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingRecurring = await Recurring.find({
            user: req.user._id,
            nextDate: { $gte: today }
        })
            .sort({ nextDate: 1 })
            .limit(5);

        const recurring = upcomingRecurring.map(r => ({
            name: r.name,
            date: formatDate(r.nextDate),
            amount: r.amount >= 0 ? `+$${r.amount.toFixed(2)}` : `-$${Math.abs(r.amount).toFixed(2)}`
        }));

        // Get Insights (top 3 spending categories from last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
        const todayStr = new Date().toISOString().split("T")[0];

        const recentEntries = await Entry.find({
            user: req.user._id,
            date: { $gte: thirtyDaysAgoStr, $lte: todayStr }
        });

        // Group by tag and sum expenses
        const byTag = {};
        recentEntries.forEach(entry => {
            if (entry.amount < 0) {
                entry.tags.forEach(tag => {
                    if (!byTag[tag]) byTag[tag] = 0;
                    byTag[tag] += Math.abs(entry.amount);
                });
            }
        });

        // Convert to array and sort by amount
        const topSpending = Object.entries(byTag)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        const insights = topSpending.map(([tag, amount]) => ({
            title: tag,
            description: `$${amount.toFixed(2)} spent in the last 30 days`
        }));

        // Add a suggestion if we have data
        if (topSpending.length > 0) {
            insights.push({
                title: "Tip",
                description: `Your highest spending is in ${topSpending[0][0]}. Consider setting a budget!`
            });
        }

        // Get Active Goals (top 5, sorted by due date)
        const activeGoals = await Goal.find({ userId: req.user._id })
            .sort({ dueDate: 1 })
            .limit(5);

        const goals = activeGoals.map(g => ({
            name: g.name,
            progress: Math.min(Math.floor((g.currentlySaved / g.targetAmount) * 100), 100)
        }));

        res.render("pages/index", {
            title: "Lunar Money - Dashboard",
            currentUser: req.user,
            savings,
            recurring,
            insights,
            goals
        });
    } catch (e) {
        console.log(e);
        res.render("pages/index", {
            title: "Lunar Money - Dashboard",
            currentUser: req.user,
            savings: undefined,
            recurring: undefined,
            insights: undefined,
            goals: undefined
        });
    }
});

// get route for budgeting page
app.get("/budgeting", isLoggedIn, async (req, res) => {
    res.render("pages/budgeting", {
        title: "Lunar Money - Budgeting",
        currentUser: req.user
    });
});

// get route for goals page
app.get("/goals", isLoggedIn, async (req, res) => {
    res.render("pages/goals", {
        title: "Lunar Money - Goals",
        currentUser: req.user
    });
});

// get route for insights page
app.get("/insights", isLoggedIn, async (req, res) => {
    res.render("pages/insights", {
        title: "Lunar Money - Insights",
        currentUser: req.user
    });
});

// port from render, default to 3000 if not provided
const port = process.env.PORT || 3000;

// start server
app.listen(port, "0.0.0.0", () => console.log(`Server started! Running on ${port}`));