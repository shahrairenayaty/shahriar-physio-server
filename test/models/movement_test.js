const mongoose  = require("mongoose");
const assert = require("assert");
const Movement = require("../../models/movement");

describe("testnig movement model",()=>{
  let movement;
  beforeEach((done)=>{
     movement = new Movement({
      name:"testMove",
      organ:"organTest",//enum works
      joint:"joint1",
      desForPatient:"hello to the new Movement",
      desForPhysio:"it is good for most of the thing",
      pic:["pic1","pic2"]
    });
    movement.save()
      .then((move)=>{
        //console.log(move);
        assert(!move.isNew);
        done();
      });
  });
  

});
