const mongoose = require("mongoose");
const assert = require("assert");
const request = require("supertest");
const Physio = require ("../../models/physios.js");
const Patient   = require("../../models/patient");
const Visit = require("../../models/visit");
const Movement = require("../../models/movement");
const app = require("../../app");
const crypto = require("crypto")

describe("testing physios modeld",()=>{
  let physio
  let patient
  let visit;
  beforeEach((done)=>{
    movement = new Movement({
      name:"testMove",
      organ:"organTest",//enum works
      joint:"joint1",
      desForPatient:"hello to the new Movement",
      desForPhysio:"it is good for most of the thing",
      pic:["pic1","pic2"]
    });
    visit = new Visit({});
    visit.physio = physio;
    visit.patient = patient;
    patient = new Patient({
      name:"patientName",
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
      ,idNation:"0670621854"
    });
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
        title:"مطب",
        mainNumber:"09037693614"
      }],
      password:"123",
      idNation:"0670621854"
    });
    Promise.all([patient.save(),physio.save(),visit.save(),movement.save()])
      .then(()=>
        //console.log(physio);
        //assert(!physio.isNew)
        done()
      )
      .catch(()=>done());
  });
  it.only("login physio successful",(done)=>{
    request(app)
    .post("/api/physio/login")
    .send({
      "myInfo":{
      "auth":["545346","07152d234b70","09037693614","3","4","202cb962ac59075b964b"]
    }
    })
    .end((err,res)=>{
      console.log(res.body.myServer.id)
      assert(res.body.myServer.id[0]===10025)
      assert(res.body.myServer.id[1]===10006);
      assert(res.body.myServer.id[2]===10007);
      assert(res.body.myServer.id[3]===10010);
      //done();
    })
      done();

  });
  it("login physio wrong number",(done)=>{
    request(app)
    .post("/api/physio/login")
    .send({
      "myInfo":{
          "auth":["545346","07152d234b70","9037693614","3","4","202cb962ac59075b964b"]
      }
    })
    .end((err,res)=>{
      //console.log(res.body.id);
      assert(res.body.myServer.id[0]===99923);
      done();
    })
  });
  it("login physio wrong password",(done)=>{
    request(app)
    .post("/api/physio/login")
    .send({
      "myInfo":{
        "auth":["545346","07152d234b70","09037693614","3","4","02cb962ac59075b964b"]
      }
    })
    .end((err,res)=>{
      //console.log(res.body);
      assert(res.body.myServer.id[0]===10006);
      assert(res.body.myServer.id[1]===99926);
      done();
    })
  });
  it("validatePhysioToken successful",(done)=>{
    request(app)
      .put("/api/physio/"+physio.token.mainToken)
      .send({
          	"physio":{
          		"name":"ali",
          		"family":"khoshdel",
          		"number":[{
                  	"title":"خانه",
                  	"mainNumber":"09037693614"
              	}]
          	}
      })
      .end((err,res)=>{
        console.log(res.body);
        // console.log(physio._id);
        // console.log(res.body.myServer.physio._id)
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.physio._id==physio._id);
        done();
      })

  });
  it("validatePhysioToken wrong tokken",(done)=>{
    request(app)
      .put("/api/physio/"+physio.token.mainToken+"W")
      .send({
          	"physio":{
          		"name":"ali",
          		"family":"khoshdel",
          		"number":[{
                  	"title":"خانه",
                  	"mainNumber":"09037693614"
              	}]
          	}
      })
      .end((err,res)=>{
        // console.log(res.body);
        // console.log(physio._id);
        // console.log(res.body.myServer.physio._id)
        assert(res.body.myServer.id[0]===99900);
        done();
      })

  });
  it("updatePhysioPersonalInfo successful",(done)=>{
    request(app)
      .put("/api/physio/"+physio.token.mainToken)
      .send({
        "myInfo":{
          	"physio":{
          		"name":"ali",
          		"number":[{
                  	"title":"خانه",
                  	"mainNumber":"05832226198"
              	},
                {
                  "title":"مطب",
                  "mainNumber":"09037693614"
                }],
                "test":"456"
          	}
          }
      })
      .end((err,res)=>{
        //console.log(res.body);
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===10008);
        assert(res.body.myServer.id[2]===10009);
        assert(res.body.myServer.id[3]===10017);
        assert(res.body.myServer.id[4]===10010);
        assert(res.body.myServer.physio!=undefined);
        assert(res.body.myServer.visits!=undefined);
        done();
      })


  })
  it("updatePhysioPersonalInfo fail",(done)=>{
    request(app)
      .put("/api/physio/"+physio.token.mainToken)
      .send({
        "myInfo":{
          	"hysio":{
          		"name":"ali",
          		"number":[{
                  	"title":"خانه",
                  	"mainNumber":"05832226198"
              	},
                {
                  "title":"مطب",
                  "mainNumber":"09037693614"
                }],
                "test":"456"
          	}
          }
      })
      .end((err,res)=>{
        //console.log(res.body);
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===99928);
        done();
      })

  })
  it("get visits of physio successful",(done)=>{
    request(app)
      .get("/api/physio/"+physio.token.mainToken)
      .end((err,res)=>{
        // console.log(res.body);
        assert(res.body.myServer.id[0]===10000)
        assert(res.body.myServer.id[1]===10010)
        assert(res.body.myServer.visits!=undefined)
        done();
      })
  })
  it("createPatientByPhysio successful",(done)=>{
    request(app)
      .post("/api/physio/createPatient/"+physio.token.mainToken)
      .send({
        "myInfo":{
        		"patient":{
          			"name":"patientName",
              	"family":"patientFamily",
              	"number":[{
                  	"title":"خانه",
                  	"mainNumber":"09037693614"
              	}],
              	"password":"123",
              	"idNation":"06706218556"
          	}
          }
        })
      .end((err,res)=>{
        //console.log(JSON.stringify(res.body,undefined,2));
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===10015);
        assert(res.body.myServer.id[2]===10016);
        assert(res.body.myServer.physio.patients[0].patient.name==="patientName");
        assert(res.body.myServer.physio.patients[0].patient.family==="patientFamily");
        assert(res.body.myServer.physio.patients[0].patient._id===res.body.myServer.patient._id);
        // assert(res.body.myServer.id[3]===10017);
        // assert(res.body.myServer.id[4]===10010);
        // assert(res.body.myServer.physio!=undefined);
        // assert(res.body.myServer.visits!=undefined);
        done();
      })


  })
  it("createPatientByPhysio fail",(done)=>{
    request(app)
      .post("/api/physio/createPatient/"+physio.token.mainToken)
      .send({
        "myInfo":{
        		"atient":{
          			"name":"patientName",
              	"family":"patientFamily",
              	"number":[{
                  	"title":"خانه",
                  	"mainNumber":"09037693614"
              	}],
              	"password":"123",
              	"idNation":"06706218556"
          	}
          }
        })
      .end((err,res)=>{
        //console.log(JSON.stringify(res.body,undefined,2));
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===77728);
        done();
      })



  })
  it("searchPatientByIdNation",(done)=>{
    request(app)
      .post("/api/physio/searchPatient/"+physio.token.mainToken)
      .send({
            "myInfo":{
    		        "patient":{
    			           "idNation":"0670621854"
    		        }
    	      }
        })
      .end((err,res)=>{
        console.log(JSON.stringify(res.body,undefined,2));
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===20018);
        assert(res.body.myServer.id[2]===8585);
        assert(res.body.myServer.patient.name==patient.name)
        assert(res.body.myServer.patient.family==patient.family)
        done();
      })



  })
  it("searchPatientByFullname",(done)=>{
    request(app)
      .post("/api/physio/searchPatient/"+physio.token.mainToken)
      .send({
          "myInfo":{
            "patient":{
              "name":"patientName",
              "family":"patientFamily"
            }
          }
        })
      .end((err,res)=>{
        console.log(JSON.stringify(res.body,undefined,2));
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===20019);
        assert(res.body.myServer.id[2]===8585);
        assert(res.body.myServer.patients[0].name==patient.name)
        assert(res.body.myServer.patients[0].family==patient.family)
        assert(res.body.myServer.patients[0].idNation===patient.idNation)
        done();
      })




  })
  it("searchPatientByNumber",(done)=>{
    request(app)
      .post("/api/physio/searchPatient/"+physio.token.mainToken)
      .send({
        "myInfo":{
          "patient":{
            "title":"خانه",
            "number":"09037693614"
          }
        }
        })
      .end((err,res)=>{
        //console.log(JSON.stringify(res.body,undefined,2));
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===20020);
        assert(res.body.myServer.id[2]===8585);
        assert(res.body.myServer.patients.name==patient.name)
        assert(res.body.myServer.patients.family==patient.family)
        assert(res.body.myServer.patients.idNation===patient.idNation)
        assert(res.body.myServer.patients.number[0].title===patient.number[0].title)
        assert(res.body.myServer.patients.number[0].mainNumber===patient.number[0].mainNumber
        )
        done();
      })




  })
  it("createVisitByPhysio",(done)=>{
    request(app)
      .post("/api/physio/createVisit/"+physio.token.mainToken)
      .send({
        "myInfo":{
          "patient":{
            "id":patient._id
          }
        }
        })
      .end((err,res)=>{
        //console.log(JSON.stringify(res.body,undefined,2));
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===20012);
        assert(res.body.myServer.id[2]===10013);
        assert(res.body.myServer.id[3]===10014);
        assert(res.body.myServer.visit.patient.name==patient.name)
        assert(res.body.myServer.visit.patient.family==patient.family)
        assert(res.body.myServer.visit.patient.idNation===patient.idNation)
        assert(res.body.myServer.visit.patient.number[0].title===patient.number[0].title)
        assert(res.body.myServer.visit.patient.number[0].mainNumber===patient.number[0].mainNumber
        )
        done();
      })




  })
  it("updateExercisesOfVisit",(done)=>{
    request(app)
      .post("/api/physio/visits/exercise/"+physio.token.mainToken)
      .send({
        "myInfo":{
		"visitId":visit._id,
		"exercises":[
			{
			"priority":0,
			"movementId":movement._id,
			"exerciseNumber":5,
			"exerciseSet":4
			},
			{
			"priority":1,
			"movementId":movement._id,
			"exerciseStartDate":1542725571168,
			"exerciseEndDate":1542725571168,
			"exerciseNumber":20,
			"exerciseSet":"5sd"
			},
			{
			"priority":2,
			"movementId":movement._id,
			"exerciseStartDate":1542725571168,
			"exerciseEndDate":1542725571168,
			"exerciseNumber":21,
			"exerciseSet":4
			},
			{
			"priority":3,
			"movementId":movement._id,
			"exerciseStartDate":1542725571168,
			"exerciseEndDate":1542725571168,
			"exerciseNumber":5,
			"exerciseSet":4
			},
			{
			"priority":4,
			"movementId":movement._id,
			"exerciseStartDate":1542725571168,
			"exerciseEndDate":1542725571168,
			"exerciseNumber":5,
			"exerciseSet":4
			}


		]

	}
        })
      .end((err,res)=>{
        //console.log(JSON.stringify(res.body,undefined,2));
        assert(res.body.myServer.id[0]===10000);
        assert(res.body.myServer.id[1]===10001);
        assert(res.body.myServer.id[2]===10004);
        assert(res.body.myServer.id[3]===10004);
        assert(res.body.myServer.id[4]===10004);
        assert(res.body.myServer.id[5]===10004);
        assert(res.body.myServer.id[6]===10004);
        assert(res.body.myServer.id[7]===10005);
        assert(res.body.myServer.id[8]===10015);
        assert(res.body.myServer.id[9]===10025);
        assert(res.body.myServer.id[10]===10035);
        assert(res.body.myServer.id[11]===10045);
        assert(res.body.myServer.id[12]===10010);
        done();
      })
  })


  // it("createPatientByPhysio fail",(done)=>{
  //   request(app)
  //     .post("/api/physio/createPatient/"+physio.token.mainToken)
  //     .send({
  //       "myInfo":{
  //       		"atient":{
  //         			"name":"patientName",
  //             	"family":"patientFamily",
  //             	"number":[{
  //                 	"title":"خانه",
  //                 	"mainNumber":"09037693614"
  //             	}],
  //             	"password":"123",
  //             	"idNation":"06706218556"
  //         	}
  //         }
  //       })
  //     .end((err,res)=>{
  //       //console.log(JSON.stringify(res.body,undefined,2));
  //       assert(res.body.myServer.id[0]===10000);
  //       assert(res.body.myServer.id[1]===77728);
  //       // assert(res.body.myServer.id[3]===10017);
  //       // assert(res.body.myServer.id[4]===10010);
  //       // assert(res.body.myServer.physio!=undefined);
  //       // assert(res.body.myServer.visits!=undefined);
  //       done();
  //     })
  //
  //
  // })
  // it("update physio successful",(done)=>{
  //   request(app)
  //     .put("/api/physio/"+physio.token.mainToken)
  //     .send({
  //         	"physio":{
  //         		"name":"ali",
  //         		"family":"khoshdel",
  //         		"number":[{
  //                 	"title":"خانه",
  //                 	"mainNumber":"09037693614"
  //             	}]
  //         	}
  //     })
  //     .end((err,res)=>{
  //       //console.log(res.body);
  //       assert(res.body.id===21054);
  //       assert(res.body.physio.name==="ali");
  //       done();
  //     })
  // });
  // it("update info of Physio",(done)=>{
  //   request(app)
  //     .put("/api/physio/"+physio.token.mainToken)
  //     .send({})
  //     .end((err,res)=>{
  //       //console.log(res.body.visits.length);
  //       assert(res.body.id===21057);
  //       assert(res.body.visits.length===0);
  //       done();
  //     })
  // })

});
