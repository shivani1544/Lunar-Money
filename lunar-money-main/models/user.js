const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// base schema for user
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"], // we can add more later, see ISO 4217 for list of accepted values
        default: "USD"
    }
});

// this plugin adds in username (with non-duplication checks), hash, and salt to store hashed pw and many other QoL features
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);

// for more info on how this file works, see https://github.com/saintedlama/passport-local-mongoose?tab=readme-ov-file#readme
