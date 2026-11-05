const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GoalSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentlySaved: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date
    },
    category: {
        type: String
    }
});

module.exports = mongoose.model("Goal", GoalSchema);