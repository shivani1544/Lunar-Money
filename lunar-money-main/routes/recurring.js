const express = require("express");
const router = express.Router();
const Recurring = require("../models/recurring");
const Entry = require("../models/entry");
const { isLoggedIn } = require("../middleware");
const { processRecurringForUser } = require("../processRecurring");

// Helper: compute next date based on frequency
function getNextDate(currentDate, frequency) {
    const d = new Date(currentDate);
    switch (frequency) {
        case "daily":
            d.setDate(d.getDate() + 1);
            break;
        case "weekly":
            d.setDate(d.getDate() + 7);
            break;
        case "monthly":
            d.setMonth(d.getMonth() + 1);
            break;
        case "yearly":
            d.setFullYear(d.getFullYear() + 1);
            break;
        default:
            throw new Error("Invalid frequency");
    }
    return d;
}

function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}/${dd}/${yyyy}`;
}

// GET recurring page
router.get("/", isLoggedIn, async (req, res) => {
    try {
        // Fetch income and expenses separately
        const allRecurring = await Recurring.find({ user: req.user._id }).sort({ nextDate: 1 });

        const recurring = allRecurring.map((r) => ({
            ...r._doc,
            displayDate: formatDate(r.nextDate),
            displayAmount: r.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
        }));

        res.render("pages/recurring", { recurring });
    } catch (err) {
        console.error("Error loading recurring page:", err);
        res.status(500).send("Server error");
    }
});

// // GET a specific recurring rule // pretty sure this isn't used
// router.get("/:id", isLoggedIn, async (req, res) => {
//     try {
//         const rec = await Recurring.findOne({ _id: req.params.id, user: req.user._id });
//         if (!rec) return res.status(404).json({ error: "Recurring rule not found" });
//         res.json(rec);
//     } catch (err) {
//         console.error("Error fetching recurring rule:", err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// POST create a new recurring rule
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const { name, tag, frequency, nextDate, notify, notifyDaysBefore } = req.body;
        const amount = parseFloat(req.body.amount);

        // Basic validation
        if (!name || isNaN(amount) || !frequency || !nextDate) {
            return res.status(400).send("Missing required fields");
        }

        // req.body.nextDate comes as "YYYY-MM-DD"
        const [year, month, day] = nextDate.split("-").map(Number);
        // Create local midnight Date
        fixedNextDate = new Date(year, month - 1, day, 0, 0, 0, 0);

        const rec = new Recurring({
            user: req.user._id,
            name,
            amount,
            tag: tag || null,
            frequency,
            nextDate: new Date(fixedNextDate),
            notify: !!notify,
            notifyDaysBefore: notifyDaysBefore || 0,
            alerted: false
        });

        await rec.save();

        // Redirect to recurring page so it re-renders with the new row
        res.redirect("/recurring");
    } catch (err) {
        console.error("Error creating recurring rule:", err);
        res.redirect("/recurring"); // fallback to page
    }
});

// PUT update an existing recurring rule
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const rec = await Recurring.findOne({ _id: req.params.id, user: req.user._id });
        if (!rec) return res.status(404).json({ error: "Recurring rule not found" });

        const allowed = ["name", "amount", "tag", "frequency", "nextDate", "notify", "notifyDaysBefore"];
        let changed = false;

        for (const field of allowed) {
            if (req.body[field] !== undefined) {
                // Special handling for nextDate
                if (field === "nextDate") {
                    // req.body.nextDate comes as "YYYY-MM-DD"
                    const [year, month, day] = req.body.nextDate.split("-").map(Number);
                    // Create local midnight Date
                    rec.nextDate = new Date(year, month - 1, day, 0, 0, 0, 0);
                } else if (field === "amount") {
                    rec.amount = parseFloat(req.body.amount);
                } else if (field === "notify") {
                    rec.notify = !!req.body.notify;
                } else if (field === "notifyDaysBefore") {
                    rec.notifyDaysBefore = parseInt(req.body.notifyDaysBefore) || 0;
                } else {
                    rec[field] = req.body[field];
                }
                changed = true;
            }
        }

        if (changed) {
            // If schedule fields changed (frequency or nextDate), reset alert
            rec.alerted = false;
        }

        await rec.save();
        res.redirect("/recurring");
    } catch (err) {
        console.error("Error updating recurring rule:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE a recurring rule
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const rec = await Recurring.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!rec) return res.status(404).json({ error: "Recurring rule not found" });
        res.redirect("/recurring");
    } catch (err) {
        console.error("Error deleting recurring rule:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// --- TEST ROUTE: Fire the recurring job manually ---
router.get("/test-fire", isLoggedIn, async (req, res) => {
    try {
        const result = await processRecurringForUser(req.user._id);
        res.send(
            `Test fired! Notifications: ${result.notificationsCreated}, Entries created: ${result.entriesCreated}`
        );
    } catch (err) {
        console.error("Error running test recurring job:", err);
        res.status(500).send("Error running test recurring job");
    }
});

module.exports = router;
