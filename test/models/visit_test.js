const mongoose = require("mongoose")
const assert = require("assert")
const request = require("supertest")
const Visit = require("../../models/visit")
const Physio = require("../../models/physios")
const Patient = require("../../models/patient")
const Exercise = require("../../models/exercise")
const Movement = require("../../models/movement")
const app = require("../../app")

describe("testing visit model",()=>{
  let physio,patient,exercise,movement,visit,exercise2

  beforeEach((done)=>{
    physio = new Physio({
      name:"shahriar",
      family:"enyaty",
      address:[{
        mainStreet:"صیاد شیرازی",
        koche:"صیاد شیرازی 8",
        pelak:17,
        vahed:4
      }],
      number:[{
        title:"خانه",
        mainNumber:"09037693614"
      }],
      password:"123"
    });
    patient = new Patient({
      name:"kosar",
      family:"patientFamily",
      address:[{
        mainStreet:"صیاد شیرازی",
        koche:"صیاد شیرازی 8",
        pelak:17,
        vahed:4
      }],
      number:[{
        title:"خانه",
        mainNumber:"09037693614"
      }],
      password:"123"
    });
    exercise = new Exercise({
      date:{
        start:new Date().getTime(),
        end:new Date().getTime()+86400000
      },
      number:5,
      set:4
    });
    exercise2 = new Exercise({
      date:{
        start:new Date().getTime(),
        end:new Date().getTime()+86400000
      },
      number:20,
      set:60
    });
    movement = new Movement({
      name:"testMove",
      organ:"organTest",//enum works
      joint:"joint1",
      desForPatient:"hello to the new Movement",
      desForPhysio:"it is good for most of the thing",
      pic:["pic1","pic2"]
    });
    exercise.movement = movement;
    exercise2.movement = movement;
    visit = new Visit({});
    visit.physio = physio;
    visit.patient = patient;
    visit.result.exercise.push(exercise);
    visit.result.exercise.push(exercise2);
    //visit.movement = movement;
    Promise.all([physio.save(),patient.save(),exercise.save(),movement.save(),visit.save(),exercise2.save()])
      .then((a)=>{
        //console.log("pass");
        assert(!visit.isNew)
        done();
      })
      .catch(()=>{
        console.log("err");
        done();
      })
  });
  it("update info for physio",(done)=>{
    request(app)
      .put("/api/physio/"+physio.token.mainToken)
      .send()
      .end((err,res)=>{
        //console.log(res.body.visits[0].patient);
        assert(res.body.visits[0].patient.name==="kosar");
        //assert(res.body.physio.name==="ali");
        done();
      })
  });
  it("update info for patient",(done)=>{
    request(app)
      .get("/api/patient/"+patient.token.mainToken)
      .send()
      .end((err,res)=>{
        //console.log(res.body.visits);
        assert(res.body.visits[0].physio.name==="shahriar");
        //assert(res.body.physio.name==="ali");
        done();
      })
  });
  it("create visit by physio",(done)=>{
    request(app)
      .post("/api/physio/visits/"+physio.token.mainToken)
      .send({
        	"patient":
        		{
        		"id":patient._id
        		}
      })
      .end((err,res)=>{
        //console.log(res);
        assert(res.body.id===210510);
        //assert(res.body.physio.name==="ali");
        done();
      })
  })


});
