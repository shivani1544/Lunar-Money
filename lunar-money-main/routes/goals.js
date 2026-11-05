const express = require("express");
const router = express.Router();
const Goal = require("../models/goal");
const { isLoggedIn } = require("../middleware");

// Get all goals for logged-in user
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id }).sort({ dueDate: 1 }) || [];
        res.json(goals);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to fetch goals" });
    }
});

// Create a new goal
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const { name, targetAmount, currentlySaved, dueDate, category } = req.body;
        
        const goal = new Goal({
            userId: req.user._id,
            name,
            targetAmount,
            currentlySaved: currentlySaved || 0,
            dueDate,
            category
        });
        
        await goal.save();
        res.status(201).json(goal);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to create goal" });
    }
});

// Update a goal
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const { name, targetAmount, currentlySaved, dueDate, category } = req.body;
        
        const goal = await Goal.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!goal) {
            return res.status(404).json({ error: "Goal not found" });
        }
        
        if (name) goal.name = name;
        if (targetAmount) goal.targetAmount = targetAmount;
        if (currentlySaved !== undefined) goal.currentlySaved = currentlySaved;
        if (dueDate) goal.dueDate = dueDate;
        if (category !== undefined) goal.category = category;
        
        await goal.save();
        res.json(goal);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to update goal" });
    }
});

// Delete a goal
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const deleted = await Goal.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!deleted) {
            return res.status(404).json({ error: "Goal not found" });
        }
        
        res.json({ message: "Goal deleted successfully" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to delete goal" });
    }
});

module.exports = router;