const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AddressSchema = require("./address");
const NumberSchema = require("./number");
const TokenSchema = require("./token");

const PatientSchema = new Schema({
  name:{
    type:String,
    validate:{
      validator:(user)=>{/*TODO: must be in persian*/},
      message:"name must be in persian"
    },
    require:[true,"name is required"]
  },
  family:{
    type:String,
    validate:{
      validator:(user)=>{/*TODO: must be in persian*/},
      message:"family must be in persian"
    },
    require:[true,"family is required"]
  },
  address:[AddressSchema],
  number:[NumberSchema],
  registryDate:{
    type:Date,
    default:Date.now
  },
  token:{
    type:TokenSchema,
    default:{},
    require:[true,"token is must be set"]
  },
  password:{
    type:String,
    validate:{
      validator:(pass)=>{/*TODO: must be in persian*/},
      message:"pass not accsepted"
    },
    require:[true,"pass is required"]
  },
  registerBy:{
    type:String,
    default:"self",
    enum:["self","physio","monshi"]
  },
  idNation:{
    type:String,
    unique: true,
    validate:{
      validator:(id)=>{id.length==10},
      message:"nation id must be 10 char",
    },
    required:[true,"nation id is require"]
  }
});
// <editor-fold desc='Method'>
// #region Static
PatientSchema.statics.findById = function(id){
  return Patient.findOne({_id:id}).select({password:0})
}
PatientSchema.statics.getPatientIdById = function(id){
  return Patient.findOne({_id:id}).select({_id:1})
}
PatientSchema.statics.getPatientIdByToken = function(token){
  return Patient.findOne({"token.mainToken":token}).select({_id:1})
}
PatientSchema.statics.searchPatientByIdNation = function(id){
  return Patient.find({idNation:id}).select({password:0,token:0})
}
PatientSchema.statics.searchPatientByFullname = function(name,family){
  return Patient.find({name:name,family:family}).select({password:0,token:0})
}
PatientSchema.statics.updatePatientCondition = function(number,title){
  return Patient.find({"number.title":title,"number.mainNumber":number}).select({password:0,token:0})
}
PatientSchema.statics.totalUpdateById = function(id,PatientInfo){
  return Patient.findOneAndUpdate(id,PatientInfo,{runValidators:true,new:true})
}
PatientSchema.statics.findPatientByMobileNumber = function(number) {
    return Patient.findOne({"number.title": "موبایل","number.mainNumber": number})
};
PatientSchema.statics.searchPatientByNumber = function(number,title) {
    return Patient.find({"number.title": title,"number.mainNumber": number}).select({password:0,tokken:0})
};

// #endregion
// </editor-fold>
const Patient = mongoose.model("patient",PatientSchema);
module.exports = Patient
