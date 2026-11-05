const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");
const { isLoggedIn } = require("../middleware");

// Get all notifications for logged-in user
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }); // newest first
        res.json(notifications);
    } catch (e) {
        console.error("Failed to fetch notifications:", e);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// Get unread notifications count (for badge)
router.get("/unread-count", isLoggedIn, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            read: false
        });
        res.json({ count });
    } catch (e) {
        console.error("Failed to get unread count:", e);
        res.status(500).json({ error: "Failed to get unread count" });
    }
});

// Mark a notification as read
router.put("/:id/read", isLoggedIn, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ error: "Notification not found" });
        res.json(notification);
    } catch (e) {
        console.error("Failed to mark notification as read:", e);
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
});

// PUT /api/notifications/mark-all-read
router.put("/mark-all-read", isLoggedIn, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (e) {
        console.error("Failed to mark all notifications as read:", e);
        res.status(500).json({ error: "Failed to mark all as read" });
    }
});

router.get("/test-notifications", isLoggedIn, async (req, res) => {
    const Notification = require("../models/notification");

    await Notification.insertMany([
        {
            user: req.user._id,
            title: "Test Reminder A",
            message: "This is a test notification"
        },
        {
            user: req.user._id,
            title: "Test Reminder B",
            message: "Another test notification"
        }
    ]);

    res.send("Test notifications created!");
});

module.exports = router;
