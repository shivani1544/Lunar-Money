const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// base schema for an entry
const EntrySchema = new Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    amount: {
        type: Number,
        required: true
        // ensuring max 2 decimal places will be accomplished in the form, which should not allow for 3+ decimal places
        // (someone could potentially submit a POST request with extra decimals,
        //  but worrying about that is out of scope for this project)
    },
    name: {
        type: String,
        default: "unnamed transaction"
    },
    tags: {
        type: [String]
        // TODO: this is a departure from the SRS and SDS, those should be updated to reflect this change
        // the reasoning is that the user can just add tags on the fly instead of creating then choosing tags,
        // which kinda seems too cumbersome to me now that I think about it
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

// export the model for an entry
module.exports = mongoose.model("Entry", EntrySchema);
