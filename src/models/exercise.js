const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ExerciseSchema = new Schema({
  movementId: {
    type: Schema.Types.ObjectId,
    ref: "movementN",
    required: true
  },
  date: {
    start: {
      type: Date,
      default: Date.now
    },
    end: {
      type: Date,
      default: Date.now() + 86400000
    }
  },
  number: {
    type: Number,
    require: [true, "must set number of exterxie in each set"]
  },
  set: {
    type: Number,
    require: [true, "must especify number of set"]
  },
  setDone: {
    type: Number,
    default: 0
  },
  isCheck: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  customDes: {
    type: String
  },
  voices: {
    type: [{
      name: {
        type: String
      },
      status: {
        type: Boolean,
        default: true
      }

    }],
    default: []
  }


});

//const Exercise = mongoose.model("exercise",ExerciseSchema);
//module.exports=Exercise;

module.exports = ExerciseSchema