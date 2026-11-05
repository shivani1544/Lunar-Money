const express = require("express");
const router = express.Router();
const Entry = require("../models/entry");
const { isLoggedIn } = require("../middleware");

// Helper function to get date range for weekly reports
function getWeekRange(offset = 0) {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);

    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// Helper function to get date range for monthly reports
function getMonthRange(offset = 0) {
    const now = new Date();
    now.setMonth(now.getMonth() + offset);

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// Helper function to convert Date to YYYY-MM-DD string
function toDateString(date) {
    return date.toISOString().split("T")[0];
}

// Get spending report by category/tag for a date range
router.get("/spending-report", isLoggedIn, async (req, res) => {
    try {
        const { type, offset } = req.query; // type: 'weekly' or 'monthly', offset: number

        let range;
        const offsetNum = parseInt(offset) || 0;

        if (type === "weekly") {
            range = getWeekRange(offsetNum);
        } else {
            range = getMonthRange(offsetNum);
        }

        const startStr = toDateString(range.start);
        const endStr = toDateString(range.end);

        // Get all entries for user in this date range
        const entries = await Entry.find({
            user: req.user._id,
            date: { $gte: startStr, $lte: endStr }
        });

        // Group by tags and sum amounts (only negative amounts = expenses)
        const byTag = {};
        entries.forEach(entry => {
            if (entry.amount < 0) {
                // It's an expense
                entry.tags.forEach(tag => {
                    if (!byTag[tag]) {
                        byTag[tag] = 0;
                    }
                    byTag[tag] += Math.abs(entry.amount);
                });
            }
        });

        res.json({
            startDate: startStr,
            endDate: endStr,
            byTag,
            totalExpenses: Object.values(byTag).reduce((sum, val) => sum + val, 0)
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to fetch spending report" });
    }
});

// Get net worth (total income - total expenses)
router.get("/net-worth", isLoggedIn, async (req, res) => {
    try {
        // Get all entries for user
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

        res.json({
            totalIncome,
            totalExpenses,
            netWorth
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to calculate net worth" });
    }
});

module.exports = router;