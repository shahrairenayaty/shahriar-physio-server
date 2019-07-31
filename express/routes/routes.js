const PhysioController = require("../controllers/physios_controller");
const PatientController = require("../controllers/patient_controller");
const TotalUserController = require("../controllers/total_user_controller")
const { check, validationResult } = require('express-validator/check');
const multer    = require("multer");
const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./profilePic/")
  },
  filename: function(req,file,cb){
    cb(null, file.originalname)
  }
});
const fileFilter = (req,file,cb)=>{
  //rejact file
  if(file.mimetype==="image/jpeg"||file.mimetype==="iamage/png"){
    //accsepted file
    cb(null,true);
  }else {
    cb(null,false);
  }



};
const upload    = multer({
  storage:storage,
  limits:{
    fileSize:1024*1024*4
  },
  fileFilter:fileFilter

});// we should make ths folder static
module.exports = (app)=> {

  // <editor-fold desc='physio'>


  // #region upload profilePic
  // #endregion

  app.post("/api/physio/uploadPic",upload.single("productImage"),PhysioController.parseOneFile)
  // #region login physio
  // #endregion
  app.post("/api/physio/login",TotalUserController.validateMyInfo
                              ,PhysioController.getAllMovement
                              ,PhysioController.checkUserName
                              ,PhysioController.checkPassword
                              ,PhysioController.getVisitForPhysio
                              );
  //#region get visits of physio
  //#endregion
  app.get("/api/physio/:mainToken",PhysioController.validatePhysioToken
                                  ,PhysioController.getAllMovement
                                  ,PhysioController.getVisitForPhysio
                                  );
  //#region update Personal info of physio
                                  //#endregion
  app.put("/api/physio/:mainToken",PhysioController.validatePhysioToken
                                  ,PhysioController.validatePhysioUpdatePersonalInfo
                                  ,PhysioController.updatePhysioPersonalInfo
                                  ,PhysioController.getPhysioInfosById
                                  ,PhysioController.getVisitForPhysio
                                  );

  //#region create new visit
  //#endregion
  app.post("/api/physio/createVisit/:mainToken",PhysioController.validatePhysioToken
                                               ,PatientController.validatePatienById
                                               ,PhysioController.createVisit
                                               ,PhysioController.populateOneNewVisit
                                              );
  app.post("/api/physio/visits/exercise/:mainToken" ,PhysioController.validatePhysioToken
                                                    ,PhysioController.validateVisitId
                                                    ,PhysioController.validateMovementIdInArray
                                                    ,PhysioController.createExercise
                                                    ,PhysioController.updateExercisesOfVisit
                                                    )
  //#region create new Patient for physio
  //#endregion
  app.post("/api/physio/createPatient/:mainToken",TotalUserController.validateMyInfo
                                                 ,PhysioController.validatePhysioToken
                                                 ,PhysioController.validateCreatePatientInfo
                                                 ,PhysioController.createPatientByPhysio
                                                 ,PhysioController.addPatientToPhysio
                                                 // ,PhysioController.getPhysioInfosById
                                               );
  //#region search by idNation or fullname or number
  //#endregion
  app.post("/api/physio/searchPatient/:mainToken",TotalUserController.validateMyInfo
                                                 ,PhysioController.validatePhysioToken
                                                 ,PhysioController.searchPatient
                                                 ,TotalUserController.sendResToUser
                                               );
  //#region
  //#endregion
  app.post("/api/physio/updatePatients/:mainToken",TotalUserController.validateMyInfo
                                                  ,PhysioController.validatePhysioToken
                                                  ,PatientController.validatePatienById
                                                  ,PhysioController.updatePatientCondition
                                                  ,TotalUserController.sendResToUser)

// </editor-fold>

  // <editor-fold desc='patient'>

  app.post("/api/patient/login",TotalUserController.validateMyInfo
                               ,TotalUserController.getAllMovement
                               ,PatientController.checkUserName
                               ,PatientController.checkPassword
                               ,PatientController.getVisitsForPatient
                               ,TotalUserController.sendResToUser
                              );
  //#region update visits of patient
  //#endregion
  app.get("/api/patient/:mainToken"//,TotalUserController.validateMyInfo
                                   ,PatientController.validatePatientToken
                                   ,PatientController.getVisitsForPatient
                                   ,TotalUserController.sendResToUser
                                    );
  //#region update Pesonal inofo of Patient
  //#endregion
  app.put("/api/patient/:mainToken",TotalUserController.validateMyInfo
                                   ,PatientController.validatePatientToken
                                   ,PatientController.validatePatientUpdatePersonalInfo
                                   ,PatientController.updatePatientPersonalInfo
                                   ,PatientController.getPatientInfoById
                                   ,PatientController.getVisitsForPatient
                                   ,TotalUserController.sendResToUser
              )

  //#region increase number of done set
  //#endregion
  app.post("/api/patient/DoneSet/:mainToken",TotalUserController.validateMyInfo
                                                ,PatientController.validatePatientToken
                                                ,PatientController.getResultOfVisitById
                                                ,PatientController.exerciseIdBelongToVisitId
                                                ,PatientController.updateNumberDoneSet
                                                ,PatientController.changeIsdoneOfExercise
                                                ,PatientController.getVisitsForPatient
                                                ,TotalUserController.sendResToUser)

  //#region change isDone of exercise
  //#endregion
  app.post("/api/patient/exercis/:mainToken",TotalUserController.validateMyInfo
                                                ,PatientController.validatePatientToken
                                                ,PatientController.getResultOfVisitById
                                                ,PatientController.exerciseIdBelongToVisitId
                                                ,PatientController.changeIsdoneOfExercise
                                                ,PatientController.getVisitsForPatient
                                                ,TotalUserController.sendResToUser)


// </editor-fold>
}
