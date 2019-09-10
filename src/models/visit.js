const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const exerciseSchema = require("./exercise");

const VisitSchema = new Schema({
  physio: {
    type: Schema.Types.ObjectId,
    ref: "Person"
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Person",
    required: true
  },
  dateOfVisit: {
    type: Date,
    default: Date.now
  },
  timeLength: {
    type: Number,
    default: 30
  },
  condition: {
    type: String,
    enum: ["done", "doing", "will", "canceled", "move"],
    default: "doing"
  },
  result: {
    exercises: [{
      type: exerciseSchema,
      default: {}
    }]
  }

});


// #region Method
VisitSchema.statics.getVisitForPhysioById = function (id) {
  return Visit.find({
      physio: id
    }).select({
      physio: 0
    })
    /*.populate({path:"result.exercise",model:"exercise",
                populate:{path:"movement",model:"movement"}
              })
    */
    .populate({
      path: "patient"
    })
};
VisitSchema.statics.getVisitForPatientById = function (id) {
  return Visit.find({
      patient: id
    }).select({
      patient: 0,
      patients: 0
    })
    /*.populate({path:"result.exercise",model:"exercise",
                populate:{path:"movement",model:"movement"}
              })
    */
    .populate({
      path: "exercises.movement",
      model: "movement"
    })
    .populate({
      path: "physio"
    })
};
VisitSchema.statics.getVisitById = function (id) {
  return Visit.findOne({
    _id: id
  })
}
VisitSchema.statics.updateExercises = function (id, visit) {
  //console.log("id= "+id);
  //console.log("visit= "+visit);
  return Visit.findOneAndUpdate({
    "_id": id
  }, visit, {
    runValidators: true,
    new: true,
    context: "query",
    upsert: true
  })
};
VisitSchema.statics.getResultOfVisitById = function (id) {
  return Visit.findOne({
    _id: id
  }).select({
    result: 1
  })
}

VisitSchema.statics.updateIsDoneExerciseByPatient = function (visitId, exerciseId, condition) {
  return Visit.updateOne({
    _id: visitId,
    "result.exercises._id": exerciseId
  }, {
    $set: {
      "result.exercises.$.isDone": condition
    }
  })
}
VisitSchema.statics.updateSetDoneExerciseByPatient = function (visitId, exerciseId, number) {
  return Visit.updateOne({
    _id: visitId,
    "result.exercises._id": exerciseId
  }, {
    $set: {
      "result.exercises.$.setDone": number
    }
  })
}

VisitSchema.methods.toJSON = function () {
  const visit = this
  const visitObject = visit.toObject();
  visitObject.result.exercises.forEach(exercise => {
    // console.log("exercise movement.video= " + JSON.stringify(exercise, null, 2))
    const recordvoices=[]
    
    exercise.voices.forEach(element => {
      if (element.status == true) {
        console.log("1= "+JSON.stringify(element,null,2))
        recordvoices.push(element.name)
      }
    });
    delete exercise.voices
    exercise.voices = recordvoices
    if (exercise.movement.name===undefined) {
      console.log("2= "+JSON.stringify(element,null,2))
      return visitObject
    }
    const videos = []
    const voices = []
    const pics = []
    exercise.movement.videos.forEach(element => {
      if (element.status == true) {
        console.log("3= "+JSON.stringify(element,null,2))
        videos.push(element.name)
      }
    });
    exercise.movement.pics.forEach(element => {
      if (element.status == true) {
        console.log("4= "+JSON.stringify(element,null,2))
        pics.push(element.name)
      }
    });
    exercise.movement.voices.forEach(element => {
      if (element.status == true) {
        console.log("5= "+JSON.stringify(element,null,2))
        voices.push(element.name)
      }
    });

    delete exercise.movement.videos
    delete exercise.movement.pics
    delete exercise.movement.voices

    exercise.movement.videos = videos
    exercise.movement.pics = pics
    exercise.movement.voices = voices
    // console.log("exercise movement.video= " + JSON.stringify(exercise.movement, null, 2))
    // finalResult.push(resultObject)


  });
  return visitObject
}


// #endregion Method
const Visit = mongoose.model("visitN", VisitSchema);
module.exports = Visit