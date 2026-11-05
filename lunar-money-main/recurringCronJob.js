const cron = require("node-cron");
const mongoose = require("mongoose");
const Recurring = require("./models/recurring");
const Entry = require("./models/entry");
const Notification = require("./models/notification");
const { processRecurringForUser } = require("./processRecurring");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
    try {
        const result = await processRecurringForUser(req.user._id);
        res.send(`Test fired! Notifications: ${result.notificationsCreated}, Entries: ${result.entriesCreated}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error running test recurring job");
    }
});
