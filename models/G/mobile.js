const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MobileSchema = new Schema({
    title: {
        type: String,
        default: "mobiles"
    },
    number: {
        type: Number,
        required: true,
        unique: true

    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = MobileSchema
// const Number = mongoose.model("number",NumberSchema);
// module.exports = Number;