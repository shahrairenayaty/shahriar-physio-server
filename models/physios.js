// <editor-fold desc='required'>
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AddressSchema = require("./address");
const NumberSchema = require("./number");
const TokenSchema = require("./token")
// </editor-fold>

// <editor-fold Pysio Schema
const PhysioSchema = new Schema({
  name: {
    type: String,
    validate: {
      validator: (user) => {
        /*TODO: must be in persian*/ },
      message: "name must be in persian"
    },
    require: [true, "name is required"]
  },
  family: {
    type: String,
    validate: {
      validator: (user) => {
        /*TODO: must be in persian*/ },
      message: "family must be in persian"
    },
    require: [true, "family is required"]
  },
  address: [AddressSchema],
  number: [NumberSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  registryDate: {
    type: Date,
    default: Date.now
  },
  token: {
    type: TokenSchema,
    default: {},
    require: [true, "token is must be set"]
  },
  password: {
    type: String,
    validate: {
      validator: (pass) => {
        /*TODO: must be in persian*/ },
      message: "pass not accsepted"
    },
    require: [true, "pass is required"]
  },
  patients: [{
    patient: {
      type: Schema.Types.ObjectId,
      ref: "patient"
    },
    condition: {
      type: Boolean,
      default: true
    }
  }],
  idNation: {
    type: String,
    require: [true, "idNation is require"]
  }
});
// </editor-fold>

/*
how to save data in mongodb
timeStamp
defult
*/

// <editor-fold desc='Methods'>
//#region Static
PhysioSchema.statics.getPhysioIdByToken = function (token) {
  return Physio.findOne({
    "token.mainToken": token
  }).select({
    _id: 1
  })
};
PhysioSchema.statics.getPhysioByToken = function (token) {
  return Physio.findOne({
    "token.mainToken": token
  })
};
PhysioSchema.statics.updateByToken = function (token, physioInfo) {
  return Physio.findOneAndUpdate({
    "token.mainToken": token
  }, physioInfo, {
    runValidators: true,
    new: true
  })
};

PhysioSchema.statics.findPhysioByWorkNumber = function (number) {
  return Physio.findOne({
    "number.title": "مطب",
    "number.mainNumber": number
  }) //.select({password:1})
};
PhysioSchema.statics.totalUpdateById = function (id, physioInfo) {
  return Physio.findOneAndUpdate(id, physioInfo, {
    runValidators: true,
    new: true
  })
};
PhysioSchema.methods.addPatient = function (patient) {
  const newPatient = {
    patient: patient._id
  }
  return this.model('physio').findByIdAndUpdate(this._id, {
      $push: {
        "patients": newPatient
      }
    }, {
      new: true,
      upsert: true,
      runValidators: true
    })
    .populate({
      path: "patients.patient",
      model: "patient"
    })
};
PhysioSchema.statics.getPhysioInfosByIdForSelf = function (id) {
  return Physio.findOne({
      "_id": id
    }).select({
      password: 0
    })
    .populate({
      path: "patients.patient",
      model: "patient"
    })
};

PhysioSchema.statics.updatePatientCondition = function (physioId, patientId, condition) {
  return Physio.findOneAndUpdate({
    _id: physioId,
    "patients.patient": patientId
  }, {
    $set: {
      "patients.$.condition": condition
    }
  }, {
    new: true,
    upsert: true,
    runValidators: true
  })

}




//#endregion
// </editor-fold>

const Physio = mongoose.model("physio", PhysioSchema);
module.exports = Physio;