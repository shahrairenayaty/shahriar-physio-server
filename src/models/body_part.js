const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const BodyPartSchema = new Schema({
    joint:{
        type:String,
        required:true
    },
    persianJoint:{
        type:String
    },
    organ:{
        type:String,
        required:true
    },
    persianOrgan:{
        type:String
    }
})

module.exports = BodyPartSchema