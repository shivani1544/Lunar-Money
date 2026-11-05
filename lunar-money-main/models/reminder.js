const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReminderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    notificationDaysBefore: {
        type: Number,
        default: 1
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrenceInterval: {
        type: String,
        enum: ["Monthly", "Weekly", "Yearly", null],
        default: null
    },
    notificationType: {
        type: String,
        enum: ["InApp", "Email"],
        default: "InApp"
    },
    hasFiredForThisCycle: {
        type: Boolean,
        default: false // prevents duplicate reminders
    }
});

module.exports = mongoose.model("Reminder", ReminderSchema);
