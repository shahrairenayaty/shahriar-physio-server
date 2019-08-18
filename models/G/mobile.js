const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MobileSchema = new Schema({
    title: {
        type: String,
        default: "personal",
        unique: true
    },
    number: {
        type: Number,
        required: true,
        unique: true
        //description:{"شماره مویل را به صورت 09..و شماره خانه و مطب را با پیش شماره شهر وارد نمایید."}
        //description:{"hello"}
    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = MobileSchema
// const Number = mongoose.model("number",NumberSchema);
// module.exports = Number;