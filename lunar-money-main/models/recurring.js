const mongoose = require("mongoose");

const recurringSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    tag: { type: String },

    // schedule
    frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
    nextDate: { type: Date, required: true },

    // notifications
    notify: { type: Boolean, default: false },
    notifyDaysBefore: { type: Number, default: 1 }, // like “notify me 3 days before”
    alerted: { type: Boolean, default: false } // like budgets — prevents re-sending notifications
});

module.exports = mongoose.model("Recurring", recurringSchema);