const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MovementSchema = new Schema({
  name:{
    type:String,
    validate:{
      validator:(user)=>{/*TODO: must be in persian*/},
      message:"name must be in persian"
    },
    require:[true,"name is required"]
    //,eunm:["movementTest1","movementTest2"]
  },
  organ:{
      type:String,
      enum:["organTest","organTest2"],
      require:[true,"organ is required"]
  },
  joint:{
    type:String,
    enum:["joint1","joint2"]
  },
  desForPatient:{
    type:String
  },
  desForPhysio:{
    type:String
  },
  film:{
    type:String
  },
  anim:{
    type:String
  },
  pic:[String],
  complete:{
    type:Boolean,
    default:false
  }
});

// <editor-fold desc='Method'>
MovementSchema.statics.getMovementIdById = function(id){
  return Movement.findOne({_id:id}).select({_id:1})
}

MovementSchema.statics.getAllMovement = function(){
  return Movement.find({})
}

MovementSchema.methods.getId = function () {
    var returnObject = {
        _id: this._id
    };
    return returnObject;
};

// </editor-fold>
const Movement = mongoose.model("movement",MovementSchema)
module.exports = Movement;
