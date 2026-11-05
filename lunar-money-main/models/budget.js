const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tag: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    timeFrame: {
        type: String,
        enum: ["Weekly", "Monthly"],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    },
    alertThreshold: {
        type: Number,
        default: 75,
        min: 1,
        max: 100
    },
    alerted: {
        type: Boolean,
        default: false,
        required: true
    }
});

module.exports = mongoose.model("Budget", BudgetSchema);
