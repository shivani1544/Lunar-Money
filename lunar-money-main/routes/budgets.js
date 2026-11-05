const express = require("express");
const router = express.Router();
const Budget = require("../models/budget");
const Entry = require("../models/entry");
const Notification = require("../models/notification");
const { isLoggedIn } = require("../middleware");

// Helper function to calculate spending
async function calculateSpending(userId, budget) {
    const now = new Date();

    // small date helper function, date obj to "YYYY-MM-DD"
    function toDateString(dateObj) {
        return dateObj.toISOString().split("T")[0];
    }

    let startDate = new Date(budget.startDate);

    // Calculate the current period start date
    if (budget.timeFrame === "Weekly") {
        const weeksPassed = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        startDate = new Date(startDate.getTime() + weeksPassed * 7 * 24 * 60 * 60 * 1000);
    } else if (budget.timeFrame === "Monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // convert dates to dateStrings to compare with entries
    const startStr = toDateString(startDate);
    const nowStr = toDateString(now);

    // Find all entries matching this budget's tag in the current period
    const entries = await Entry.find({
        user: userId,
        tags: { $in: [new RegExp(`^${budget.tag}$`, "i")] },
        date: { $gte: startStr, $lte: nowStr }
    });

    // Sum up the amounts
    const total = entries.reduce((sum, entry) => {
        return entry.amount < 0 ? sum + Math.abs(entry.amount) : sum;
    }, 0);

    return total;
}

async function updateBudgetsForTags(userId, tags) {
    if (!tags || tags.length === 0) return;
    console.log("checking: " + tags);
    // find budgets whose tag matches any of the modified entry's tags
    const budgets = await Budget.find({
        userId,
        tag: { $in: tags.map((t) => t.toLowerCase()) }
    });

    for (const budget of budgets) {
        const spent = await calculateSpending(userId, budget);
        budget._doc.spent = spent;

        const percent = (spent / budget.amount) * 100;

        if (percent >= budget.alertThreshold && !budget.alerted) {
            await Notification.create({
                user: userId,
                title: `Budget Alert: ${budget.tag}`,
                message: `You’ve reached ${Math.round(percent)}% of your ${budget.tag} budget.`
            });

            budget.alerted = true;
            await budget.save();
        }

        // RESET alerted if the user goes back under threshold
        if (percent < budget.alertThreshold && budget.alerted) {
            budget.alerted = false;
            await budget.save();
        }
    }

    console.log("budgets checked: " + budgets);
    return budgets;
}

// Get all budgets for logged-in user with spending calculated
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const budgets = (await Budget.find({ userId: req.user._id })) || [];

        // Calculate spending for each budget
        for (let budget of budgets) {
            const spent = await calculateSpending(req.user._id, budget);
            budget._doc.spent = spent;
        }

        res.json(budgets);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to fetch budgets" });
    }
});

// Create a new budget
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const { tag, amount, timeFrame, startDate, notes, alertThreshold } = req.body;

        const budget = new Budget({
            userId: req.user._id,
            tag,
            amount,
            timeFrame,
            startDate: startDate || new Date(),
            notes,
            alertThreshold: alertThreshold || 75
        });

        await budget.save();
        res.status(201).json(budget);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to create budget" });
    }
});

// Update a budget
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const { amount, alertThreshold, notes } = req.body;

        const budget = await Budget.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!budget) {
            return res.status(404).json({ error: "Budget not found" });
        }

        if (amount) budget.amount = amount;
        if (alertThreshold) budget.alertThreshold = alertThreshold;
        if (notes !== undefined) budget.notes = notes;

        // After editing, recalc spending + threshold logic
        const spent = await calculateSpending(req.user._id, budget);
        const percent = (spent / budget.amount) * 100;

        // Reset alert if needed
        if (percent < budget.alertThreshold && budget.alerted) {
            console.log("update budget reset");
            budget.alerted = false;
        }

        if (percent >= budget.alertThreshold && !budget.alerted) {
            console.log("update budget notify");
            await Notification.create({
                user: req.user._id,
                title: `Budget Alert: ${budget.tag}`,
                message: `You’ve reached ${Math.round(percent)}% of your ${budget.tag} budget.`
            });

            budget.alerted = true;
        }

        await budget.save();
        res.json(budget);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to update budget" });
    }
});

// Delete a budget
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const deleted = await Budget.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!deleted) {
            return res.status(404).json({ error: "Budget not found" });
        }

        res.json({ message: "Budget deleted successfully" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to delete budget" });
    }
});

module.exports = {
    router,
    updateBudgetsForTags
};

// module.exports = router;
// module.exports.updateBudgetsForTags = updateBudgetsForTags;
