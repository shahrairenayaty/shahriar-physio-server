const mongoose = require("mongoose")
const Schema  = mongoose.Schema

const ExerciseSchema = new Schema({
  movement:{
    type:Schema.Types.ObjectId,
    ref:"movement"
  },
  date:{
    start:{
      type:Date,
      default:Date.now
    },
    end:{
      type:Date,
      default:Date.now()+86400000
    }
  },
  number:{
    type:Number,
    require:[true,"must set number of exterxie in each set"]
    ,default:-1
  },
  set:{
    type:Number,
    require:[true,"must especify number of set"]
    ,default:-1
  },
  setDone:{
    type:Number,
    require:[true,"must especify number of set Done"]
    ,default:0
  },
  isDone:{
    type:Boolean,
    default:false
  },
  isCheck:{
    type:Boolean,
    default:false
  },
  isActive:{
    type:Boolean,
    default:true
  }


});

//const Exercise = mongoose.model("exercise",ExerciseSchema);
//module.exports=Exercise;

module.exports = ExerciseSchema
