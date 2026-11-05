const express = require("express");
const router = express.Router();
const Entry = require("../models/entry");
const { updateBudgetsForTags } = require("../routes/budgets");
const { isLoggedIn } = require("../middleware");

// post route to create an entry
router.post("/", isLoggedIn, async (req, res) => {
    try {
        console.log("post route hit");
        // destructure req.body
        const { date, name, amount, tag } = req.body;
        // split up the comma separated tags
        let tags = [];
        if (tag) {
            tags = tag
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0);
        }
        const entry = new Entry({ date, name, amount, tags, user: req.user._id });
        await entry.save();
        await updateBudgetsForTags(req.user._id, entry.tags);
        res.redirect("/transactions");
    } catch (e) {
        console.log(e);
        res.redirect("/transactions"); // TODO probably should send the user to an error page of some sort
    }
});

// get route to get all entries for a user
router.get("/", isLoggedIn, async (req, res) => {
    try {
        // get all entries belonging to the current user and sort them by date and time, recent first (or make entries an empty array)
        const entries = (await Entry.find({ user: req.user._id }).sort({ date: -1 })) || [];
        // render them on the index page
        res.render("pages/entries", {
            title: "Lunar Money - Transactions",
            currentUser: req.user,
            entries,
            isSearching: false,
            searchParams: { name: "", date: "", tag: "" }
        });
    } catch (e) {
        console.log(e);
        res.render("pages/entries", {
            title: "Lunar Money - Transactions",
            currentUser: req.user,
            entries,
            isSearching: false,
            searchParams: { name: "", date: "", tag: "" }
        });
    }
});

// get route for searching entries
router.get("/search", isLoggedIn, async (req, res) => {
    const { name, date, tag } = req.query;
    console.log(name + " " + date + " " + tag);
    const userId = req.user._id;

    const query = { user: userId };

    // search by name
    if (name && name.trim() !== "") {
        query.name = new RegExp(name.trim(), "i");
    }

    // search by date
    if (date && date.trim() !== "") {
        query.date = date;
    }

    // search by tag (tags are csv)
    if (tag && tag.trim() !== "") {
        const tagRegex = new RegExp(tag.trim(), "i"); // the "i" flag makes the search case insensitive
        query.tags = { $elemMatch: { $regex: tagRegex } };
    }

    const entries = await Entry.find(query).sort({ date: -1 });

    // set isSearching to true if there is at least one search term
    const isSearching = Boolean(name || date || tag);

    res.render("pages/entries", {
        title: "Lunar Money - Transactions",
        currentUser: req.user,
        entries,
        isSearching,
        searchParams: { name, date, tag }
    });
});

// update an entry
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        // destructure req.body
        const { date, name, amount, tag } = req.body;
        // split up the comma separated tags
        let tags = [];
        if (tag) {
            tags = tag
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0);
        }
        // make sure the entry belongs to the logged in user
        const entry = await Entry.findOne({ _id: req.params.id, user: req.user._id });
        if (!entry) {
            return res.status(404).send("Entry not found");
        }
        // update the fields of the entry
        entry.date = date;
        entry.name = name;
        entry.amount = amount;
        entry.tags = tags;
        // save the new version to the db
        await entry.save();
        await updateBudgetsForTags(req.user._id, entry.tags);

        // check if this triggered a notification

        res.redirect("/transactions");
    } catch (e) {
        console.log(e);
        res.redirect("/transactions"); // TODO probably should send the user to an error page of some sort
    }
});

// delete an entry
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const deleted = await Entry.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        // if the Entry wasn't found
        if (!deleted) {
            return res.status(404).send("Entry not found");
        }
        await updateBudgetsForTags(req.user._id, deleted.tags);

        res.redirect("/transactions");
    } catch (e) {
        console.log(e);
        res.redirect("/transactions"); // TODO probably should send the user to an error page of some sort
    }
});

router.get("/tags", isLoggedIn, async (req, res) => {
    try {
        const result = await Entry.aggregate([
            { $match: { user: req.user._id } }, // find all entries for this user
            { $unwind: "$tags" }, // flatten the tag arrays
            { $group: { _id: "$tags" } }, // remove duplicates
            { $sort: { _id: 1 } } // sort the tags alphabetically
        ]);

        const tags = result.map((t) => t._id);
        console.log(tags);
        res.json(tags);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching tags");
    }
});

module.exports = router;
