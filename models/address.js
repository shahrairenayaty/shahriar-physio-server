const mongoose = require("mongoose")
const Schema  = mongoose.Schema

const AddressSchema = new Schema({
  title:{
    type:String,
    default:"مطب",
    enum:["خانه","مطب"]
  },
  country:{
    type:String,
    default:"ایران",
    enum:["ایران"]
  },
  state:{
    type:String,
    default:"تهران",
    enum:["تهران"]
  },
  city:{
    type:String,
    default:"تهران",
    enum:["تهران"]
  },
  mainStreet:{
    type:String,
    required:[true,"شما باید حتما این فیلد را پر کنید."]
  },
  secondStreet:{
    type:String
  },
  koche:{
    type:String
  },
  pelak:{
    type:Number,
  },
  vahed:{
    type:Number,
    description : "همکف برابر با صفر می باشد."
  },
  isActive:{
    type:Boolean,
    defult:true
  }
});

//const Address = mongoose.model("address",AddressSchema)
//module.exports=Address

module.exports = AddressSchema
