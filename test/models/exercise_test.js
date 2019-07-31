const mongoose = require("mongoose")
const assert = require("assert")
const Exercise = require("../../models/exercise")
const Movement = require("../../models/movement")

describe("testing exercise model",()=>{
let movement,exercise
beforeEach((done)=>{
  exercise = new Exercise({
    date:{
      start:new Date().getTime(),
      end:new Date().getTime()+86400000
    },

    number:5,
    set:4
  });
  movement = new Movement({
    name:"testMove",
    organ:"organTest",//enum works
    joint:"joint1",
    desForPatient:"hello to the new Movement",
    desForPhysio:"it is good for most of the thing",
    pic:["pic1","pic2"]
  });

  Promise.all([movement.save(),exercise.save()])
    .then((a)=>{
      console.log(a[1]);
      assert(!exercise.isNew);
      done()
    });
});

});
