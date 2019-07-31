require("../../models/exercise");
require("../../models/movement");
const MyLog = require("../../myLog")
const Patient = require("../../models/patient");
const Visit = require("../../models/visit");
const crypto = require("crypto");
const Physio    = require("../../models/physios");

// <editor-fold desc='method'>
const myLog = new MyLog(100);
const validationHandler = next => result => {
  if (result.isEmpty()) return
  if (!next)
    throw new Error(
      result.array().map(i => `'${i.param}' has ${i.msg}`).join(' ')
    )
else
  return next(
    new Error(
     result.array().map(i => `'${i.param}' has ${i.msg}`).join('')
    )
  )
}
let passedMessageToHandelMethod = "";
let titleMessageForLog = "";
let logMessage = "";

function handelThenSuccess(req,nameObject,returnedObject,id,next,logMessage,isArray=false,index=0,arrayLength=0){

  if(!req.myServer)
    req.myServer = {};
    if(!isArray){
      switch (nameObject) {
        case "visit":
        //console.log("visit= "+returnedObject);
          req.myServer.visit = returnedObject;
          break;
        case "physio":
          req.myServer.physio = returnedObject;
          break;
        case "updatePhysio":
          req.myServer.updatePhysio = returnedObject;
          break;
        case "patient":
          req.myServer.patient = returnedObject;
          break;
        case "visits":
          req.myServer.visits = returnedObject
          break;
        case "visit":
          req.myServer.visit = returnedObject
        case "exercise":
          req.myServer.exercise = returnedObject
        default:
      }
    }
    else{
      switch (nameObject) {
        case "exercises":
          if(!req.myServer.exercises)
            req.myServer.exercises = [];
          if(!req.myServer.exercises[index])
            req.myServer.exercises[index]={}
          req.myServer.exercises[index].movement = returnedObject
          break;
        case "physio":
          req.myServer.physio = returnedObject;
          break;
        case "patient":
          req.myServer.patient = returnedObject;
          break;
        default:
      }
    }

  if(!req.myServer.id)
    req.myServer.id = [];
  req.myServer.id.push(id)
  // console.log(req.myServer);
  if(index == arrayLength){
    let allIsGood = true;
    req.myServer.id.forEach(eachId=>{
      //console.log("id for each= "+Math.floor(eachId/10000));
        if(Math.floor(eachId/10000)==9||Math.floor(eachId/10000)==7){
          allIsGood=false
        }
    })
    //console.log("allIsGood= "+allIsGood);
    if(allIsGood)
    {
      myLog.endLog(logMessage,"=");
      next();
    }else
    {
      myLog.endErrorLog(logMessage);
      next(req)
    }

  }
  return req;

}
function hendelElseCantFind(req,customError,error,id,next,logMessage,isArray=false,index=0,arrayLength=0,isLastInIndex=true){
  console.log("custom Error= "+customError);
  console.log("id= "+id);
  // console.log(nameObject);
  // console.log(returnedObject);
  // console.log(id);
  if(!req.myServer)
    req.myServer = {};
 // console.log(req.myServer);
  if (error) {
    if (error.message) {
      console.error(error.message);
      req.myServer.error = error.message;
    }
    else
    {
      console.error(error);
      req.myServer.error = error;
    }
  }
  if(!req.myServer.customError)
      req.myServer.customError = [];
  req.myServer.customError.push(customError)
  if(!req.myServer.id)
    req.myServer.id = [];
  req.myServer.id.push(id)
  if(index == arrayLength && isLastInIndex){
    myLog.endErrorLog(logMessage);
    next(req)
  }
  // console.log(req.myServer);
  return req;
}
function handelResSuccess(req,res,nameObject,returnedObject,id,message){
  if(!req.myServer)
    req.myServer = {};
  if(!req.myServer.id)
    req.myServer.id = [];
  req.myServer.id.push(id)
  const myServer ={}
  switch (nameObject) {
    case "visit":
      myServer.visit=returnedObject
      break;
    case "physio":
      myServer.physio=returnedObject
      break;
    case "visits":
      myServer.visits=returnedObject
      break
    default:

  }
  myServer.id=req.myServer.id
  myServer.message=message
  res.send({
    myServer:myServer,
    condition:true,
    id:id
  })
  console.log(message);
  myLog.endLog(logMessage,"=")
}
// </editor-fold>
module.exports = {
  checkUserName(req,res,next){  //userName in req.body.myInfo.auth[2] is in DB and is it valid? if yes put password and _id of it in body.patient
    logMessage="checkUserName";
    myLog.startLog(logMessage,'=')
    const {auth} = req.body.myInfo
    if(auth){

      const PatientNumber = req.body.myInfo.auth[2];
      if(PatientNumber){
        //console.log("patient number= "+PatientNumber);
        try {
        Patient.findPatientByMobileNumber(PatientNumber)
          .then((returnedPatient)=>{
            if(returnedPatient){
              console.log('userName is valid')
              req=handelThenSuccess(req,'patient',returnedPatient,20006,next,logMessage)
            }
            else{
              passedMessageToHandelMethod = "this mobile number : {"+PatientNumber+"} is unvalid!"
              hendelElseCantFind(req,passedMessageToHandelMethod,null,77750,next,logMessage)
            }
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "something happand after we find patient or after we find that there isn't any patient with this number"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,77724,next,logMessage)
          })
        }catch (e) {
            console.log(e);
         }
      }else{
        passedMessageToHandelMethod = 'myInfo.auth[userName] key does not exist in body.myInfo'
        hendelElseCantFind(req,passedMessageToHandelMethod,null,77751,next,logMessage)
      }
    }
    else{
      passedMessageToHandelMethod = "myInfo.auth key does not exist in req.body"
      hendelElseCantFind(req,passedMessageToHandelMethod,null,77725,next,logMessage)
    }
    // #region
    //#endregion
  }
  ,checkPassword(req,res,next){  // compare the hash of pass in req.myServer.physio.password to req.body.myInfo.auth[5]+[1]? if true send full info of physio (except password) in body.myServer.physio to next controller
    logMessage="checkPassword";
    myLog.startLog(logMessage,'=')
    const patientPassword = req.body.myInfo.auth[5]+req.body.myInfo.auth[1]
    //console.log(patientPassword);
    if(patientPassword){
        if(crypto.createHash('md5').update(req.myServer.patient.password).digest("hex")===patientPassword){
          req.myServer.patient.password=undefined;
          req.myServer.controllerBeforeGetVisits = "checkPassword"
          const returnedObject =req.myServer.patient;
          console.log('login was seccessfull')
          req=handelThenSuccess(req,'patient',returnedObject,20007,next,logMessage)
        }
        else
        {
          passedMessageToHandelMethod = "this password is unvalid!"
          hendelElseCantFind(req,passedMessageToHandelMethod,null,77726,next,logMessage)
        }

    }
    else{
      passedMessageToHandelMethod = 'myInfo.auth[password] key does not exist in body.myInfo'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,77727,next,logMessage)
    }
    //#region
    //#endregion
  }
  ,getVisitsForPatient(req,res,next){//get visits of patient by id in req.myServer.patient and hide token and password of physio and put it in req.myServer.visits and in the end send myServer to user
    logMessage="getVisitsForPatient";
    myLog.startLog(logMessage,'=')
    const id = req.myServer.patient._id
    if(id){
      try {
      Visit.getVisitForPatientById(id)
        .then((returnedVisits)=>{
          //console.log("returnedVisits=" +JSON.stringify(returnedVisits,null,1));
          if(returnedVisits){
            for(var i=0;i<returnedVisits.length;i++){
              if(returnedVisits[i].physio){
              returnedVisits[i].physio.password=undefined;
              returnedVisits[i].physio.token=undefined;
              returnedVisits[i].physio.patients=undefined;
            }else{
              passedMessageToHandelMethod = 'id of physio in visits is not valid! index= '+i
              hendelElseCantFind(req,passedMessageToHandelMethod,null,77753,next,logMessage,true,i,returnedVisits.length)
            }
            }
            let message="";
            if(req.myServer.controllerBeforeGetVisits=="updatePatientPersonalInfo"){
              message='update and return visits were successfull';
            }
            else if(req.myServer.controllerBeforeGetVisits=="checkPassword"){
              message="login and return visits were successfull"
            }
            else{
              message="return visits was successfull"
            }
              console.log(message)
              req=handelThenSuccess(req,'visits',returnedVisits,20010,next,logMessage)
              //handelResSuccess(req,res,'',returnedVisits,20010,message,logMessage)
          }
          else
          {
            const message='this patient has 0 visits';
            console.log(message)
            req=handelThenSuccess(req,'visits',undefined,77752,next,logMessage)
            //handelResSuccess(req,res,'visits',undefined,77752,message,logMessage)
          }
        })
        .catch((error)=>{
          passedMessageToHandelMethod = 'some something goes wrong in populate'
          hendelElseCantFind(req,passedMessageToHandelMethod,error,77733,next,logMessage)
        })
      } catch (e) {
          console.log(e);
      }
    }
    else{
      passedMessageToHandelMethod = 'id does not exist in req.myServer.physio'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,77732,next,logMessage)
    }
    //#region
    //#endregion

  }
  ,getPatientInfoById(req,res,next){//get personl info of patinet by patient id in req.myServer
    logMessage = "getPatientInfoById"
    myLog.startLog(logMessage,'=')
    const id = req.myServer.patient._id
    Patient.findById(id)
      .then((returnedObject)=>{
        if(returnedObject){
            console.log('personal info of patient fetched')
            req=handelThenSuccess(req,'patient',returnedObject,20017,next,logMessage)
        }else{
            passedMessageToHandelMethod = "this id for patient  {"+id+"} is unvalid!"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,77734,next,logMessage)
        }
      })
      .catch((error)=>{
          passedMessageToHandelMethod = "something happand after we find patient or after we find that there isn't any patient with this id"
          hendelElseCantFind(req,passedMessageToHandelMethod,error,77735,next,logMessage)
      })
      //#region
      //#endregion
  }
  ,update(req,res,next){ //update personal info
    //console.log("update");
    const {mainToken} = req.params;
    //console.log(mainToken);
    const patient = req.body.patient;
    //console.log(patient);
    if(patient!=undefined){ //update patient => put
      console.log("body is not empty");
      Patient.findOneAndUpdate({"token.mainToken":mainToken},patient,{runValidators:true,new:true})
        .then((patient)=>{
          if(patient){
            //upadte was successfull:
            //find visit:
            Patient.findOne({"token.mainToken":mainToken}).select({_id:1})
              .then((p)=>{
                if(p){
                  //right token
                  //console.log(p);
                  const id = p._id;
                  Visit.find({patient:id}).select({patient:0})
                    .populate({path:"result.exercise",model:"exercise",
                        populate:{path:"movement",model:"movement"}
                    })
                    .populate({path:"physio",select:["name","family","address","number","registryDate"]})
                    .then((visits)=>{
                      //console.log(visits);

                      for(var i=0;i<visits.length;i++){
                        for (var j = 0; j < visits[i].result.exercise.length; j++) {
                          visits[i].result.exercise[j].movement.desForPhysio=undefined;
                        }
                        //console.log(visits[i].physio.address);
                        for (var j = 0; j < visits[i].physio.address.length; j++) {
                          console.log(visits[i].physio.address[j].pelak);
                          if(visits[i].physio.address[j].title!="مطب"){
                            visits[i].physio.address[j]=undefined;
                          }
                        }
                        for (var j = 0; j < visits[i].physio.number.length; j++) {
                          if(visits[i].physio.number[j].title!="مطب"){
                              visits[i].physio.number[j]=undefined;
                          }
                        }
                      }
                      patient.password=undefined

                      res.send({
                        patient:patient,
                        visits:visits,
                        condition:true,
                        message:"با موفقیت انجام شد.",
                        id:21054
                      });
                    })
                    .catch((error)=>{
                      //wrong populate
                      req.err={
                        id:21058,
                        err:"problem with populate or filtering",
                        properties:error
                      }
                      console.log("e: "+req.err);
                      next(req);
                      })
                }else{
                  //wrong token
                  req.err={id:21055,err:"wrong token"}
                  console.log(req.err);
                  next(req);
                }

              })
              .catch((err)=>{
                res.send({address:"patient_controller/findOne fot get info / holy shit",properties:err});
                req.err = err
                next(req)
              });
          }
          else{
            //wrong token
            req.err={id:21055,err:"wrong token"}
            next(req);
          }})
        .catch((error)=>{
          //wong proms
          req.err={
            id:21056,
            err:"wrong proms",
            properties:error.errors
          }
          next(req);
        })
    }else{ //update info for physio about patient and ... =>get
      console.log("body is empty");
      Patient.findOne({"token.mainToken":mainToken}).select({_id:1})
        .then((p)=>{
          if(p){
            //right token
            const id = p._id;
            Visit.find({patient:id}).select({patient:0})
              .populate({path:"result.exercise",model:"exercise",
                  populate:{path:"movement",model:"movement"}
              })
              .populate({path:"physio",select:["name","family","address","number","registryDate"]})
              .then((visits)=>{
                //console.log(visits);

                for(var i=0;i<visits.length;i++){
                  for (var j = 0; j < visits[i].result.exercise.length; j++) {
                    visits[i].result.exercise[j].movement.desForPhysio=undefined;
                  }
                  //console.log(visits[i].physio.address);
                  for (var j = 0; j < visits[i].physio.address.length; j++) {
                    if(visits[i].physio.address[j].title!="مطب"){
                      visits[i].physio.address[j]=undefined;
                    }
                  }
                  for (var j = 0; j < visits[i].physio.number.length; j++) {
                    if(visits[i].physio.number[j].title!="مطب"){
                      visits[i].physio.number[j]=undefined;
                    }
                  }
                }


                res.send({
                  visits:visits,
                  condition:true,
                  message:"با موفقیت انجام شد.",
                  id:21057
                })
              })
              .catch((error)=>{
                //wrong populate
                req.err={
                  id:21058,
                  err:"problem with populate",
                }
                console.log(error);
                next(req);
              })
          }else{
            //wrong token
            req.err={id:21055,err:"wrong token"}
            next(req);
          }

        })
        .catch((err)=>{
          res.send({address:"patient_controller/findOne for get info / holy shit",properties:err});
        });

    }
  }
  ,updatePatientPersonalInfo(req,res,next){
    logMessage = "updatePatientPersonalInfo"
    myLog.startLog(logMessage,'=')
    // console.log(req.myServer);
    Patient.totalUpdateById(req.myServer.patient._id,req.body.myInfo.patient)
      .then((returnedPatient)=>{
        if(returnedPatient){
          console.log('update Info was successfull')
          console.log(req.myServer);
          req.myServer.controllerBeforeGetVisits = "updatePatientPersonalInfo"
          req=handelThenSuccess(req,'patient',returnedPatient,20009,next,logMessage)
        }
        else{
          passedMessageToHandelMethod = 'update personal info failed'
          hendelElseCantFind(req,passedMessageToHandelMethod,null,77731,next,logMessage)
        }
      })
      .catch((error)=>{
        passedMessageToHandelMethod = 'update personal info failed'
        hendelElseCantFind(req,passedMessageToHandelMethod,error,77731,next,logMessage)
      })
      //#region
      //#endregion

  }
  ,validatePatienById(req,res,next){
    logMessage = "validatePatienById"
    myLog.startLog(logMessage,'=')
    const {patient}= req.body.myInfo
    if(patient)
    {
      req.myServer.patientValidation="byId";
      const {id}=patient;
      if(id){
        Patient.getPatientIdById(id)
          .then((returnedPatient)=>{
            if(returnedPatient){
              console.log('id for patient is valid!');
              req=handelThenSuccess(req,'patient',returnedPatient,20012,next,logMessage)
            }
            else{
              passedMessageToHandelMethod = "this id for patient  {"+id+"} is unvalid!"
              hendelElseCantFind(req,passedMessageToHandelMethod,null,77734,next,logMessage)
            }
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "something happand after we find patient or after we find that there isn't any patient with this id"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,77735,next,logMessage)
          })
      }
      else{
        passedMessageToHandelMethod = "id does not exist in req.myServer.patient"
        hendelElseCantFind(req,passedMessageToHandelMethod,null,77733,next,logMessage)
      }

    }
    else
    {
      passedMessageToHandelMethod = 'patient does not exist in req.body'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,77728,next,logMessage)
    }
  }
  ,getResultOfVisitById(req,res,next){
    logMessage = "getResultOfVisitById"
    myLog.startLog(logMessage,'=')
    const {visit}= req.body.myInfo
    if(visit)
    {
      const {_id}=visit;
      if(_id){
        Visit.getResultOfVisitById(_id)
          .then((returnedObject)=>{
            if(returnedObject){
              console.log("visit with this" +_id+"found");
              req=handelThenSuccess(req,'visit',returnedObject,20001,next,logMessage)
            }
            else{
              passedMessageToHandelMethod = "this visitId: {"+_id+"} is unvalid!"
              hendelElseCantFind(req,passedMessageToHandelMethod,null,77706,next,logMessage)
            }
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "something happand after we find visit or after we find that there isn't any visit with this id"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,77705,next,logMessage)
          })
      }
      else{
        passedMessageToHandelMethod = "visitId key does not exist in req.body"
        hendelElseCantFind(req,passedMessageToHandelMethod,null,77703,next,logMessage)
      }
    }
    else
    {
      passedMessageToHandelMethod = 'visit key dose not exist in req.body'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,77754,next,logMessage)
    }
  }
  ,validatePatientToken(req,res,next){//is there any patient with this token? if yes => send just id of patient to the next controller in req.myServer.patient
    logMessage = "validate patient token"
    myLog.startLog(logMessage,"=")
        const token = req.params.mainToken;
        //console.log("physio token= "+token);
        try {


        Patient.getPatientIdByToken(token)
          .then((returnedPatient)=>{
            if(returnedPatient){
              console.log("patient find");
              req=handelThenSuccess(req,"patient",returnedPatient,20000,next,logMessage)
            }
            else
            {
              passedMessageToHandelMethod = "this token: {"+token+"} is unvalid!"
              hendelElseCantFind(req,passedMessageToHandelMethod,null,77700,next,logMessage)
            }
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "something happand after we find patient or after we find that there isn't any patient with this token";
            hendelElseCantFind(req,passedMessageToHandelMethod,error,77701,next,logMessage)
          })
        } catch (e) {
            console.log(e);
        }
        //#region
        //#endregion
    }
  ,validatePatientUpdatePersonalInfo(req,res,next){ //check is there any patient key in req.body.myInfo if yes send to next controller and if no send error
      logMessage="validate Patient Update Personal Info"
      myLog.startLog(logMessage,'=')
      const {myInfo} = req.body
      if(myInfo){
        const {patient} = myInfo;
        if(patient){
          console.log('all update infos are valid')
          req=handelThenSuccess(req,'updatePatient',null,20008,next,logMessage)
        }
        else{
          passedMessageToHandelMethod = 'patient key does not exist in req.body'
          hendelElseCantFind(req,passedMessageToHandelMethod,null,77728,next,logMessage)
        }
      }else {
        passedMessageToHandelMethod = 'myInfo key does not exist in req.body'
        hendelElseCantFind(req,passedMessageToHandelMethod,null,77704,next,logMessage)
      }
      // <editor-fold desc=''>
      // </editor-fold>
    }
  ,exerciseIdBelongToVisitId(req,res,next){
    logMessage = "exerciseIdBelongToVisitId"
    myLog.startLog(logMessage,'=')
    var {exercises} =req.myServer.visit.result;
    if(exercises)
    {
      var exercise  = exercises.filter(function(exercise){
        return exercise._id == req.body.myInfo.exercise._id
      });
      if(exercise)
      {
      console.log("exercise id belong to visit id")
      req=handelThenSuccess(req,'exercise',exercise[0],20023,next,logMessage)
      //console.log(req.myServer);
      }
      else
      {
      passedMessageToHandelMethod = "exercise id dose not belong to visit id"
      hendelElseCantFind(req,passedMessageToHandelMethod,null,77756,next,logMessage)
      }
    }
    else
    {
      passedMessageToHandelMethod = 'exercises key dose not exist in myServer'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,77755,next,logMessage)
    }
    //console.log(exercise[0]);
  }
  ,changeIsdoneOfExercise(req,res,next){
    logMessage="change Isdone Of Exercise"
    myLog.startLog(logMessage,'=')
    const visitId = req.body.myInfo.visit._id;
    const exercise = req.myServer.exercise
    //console.log(exercise);
    const exerciseId = exercise._id;
    const sett = exercise.set
    const setDone = exercise.setDone
    console.log("setDone= "+setDone+" set= "+sett);
    const {condition} = req.body.myInfo;
    console.log(condition);
    Visit.updateIsDoneExerciseByPatient(visitId,exerciseId,condition)
      .then((returnedObject)=>{
        console.log(JSON.stringify(returnedObject,undefined,2));
        if(returnedObject){
          if(returnedObject.n==1){
            //console.log('isDone change successful')
            req=handelThenSuccess(req,'nothing',returnedObject,20024,next,logMessage)
          }
  else {
            passedMessageToHandelMethod = "this visitId: {"+visitId+"} is unvalid!"
            hendelElseCantFind(req,passedMessageToHandelMethod,null,77706,next,logMessage)
          }
        }
        else
        {
          passedMessageToHandelMethod = "something happend"
          hendelElseCantFind(req,passedMessageToHandelMethod,null,77757,next,logMessage)
        }

      })
      .catch((error)=>{
        passedMessageToHandelMethod = 'something happend during changing isDone'
        hendelElseCantFind(req,passedMessageToHandelMethod,error,77758,next,logMessage)
      })
  }

  ,updateNumberDoneSet(req,res,next){
    logMessage="update Number Done Set"
    myLog.startLog(logMessage,'=')
    const visitId = req.body.myInfo.visit._id;
    const exerciseId = req.body.myInfo.exercise._id;
    const number = req.body.myInfo.number
    Visit.updateSetDoneExerciseByPatient(visitId,exerciseId,number)
      .then((returnedObject)=>{
        console.log(JSON.stringify(returnedObject,undefined,2));
        if(returnedObject){
          if(returnedObject.nModified==1){
            //console.log('setDone chagen sucessful')
            req=handelThenSuccess(req,'nothing',returnedObject,20026,next,logMessage)
          }
          else if (returnedObject.n==1){
            passedMessageToHandelMethod = 'visit finded but cant change setDone'
            hendelElseCantFind(req,passedMessageToHandelMethod,null,77762,next,logMessage)
          }else {
            passedMessageToHandelMethod = "this visitId: {"+visitId+"} is unvalid!"
            hendelElseCantFind(req,passedMessageToHandelMethod,null,77706,next,logMessage)
          }
        }
        else
        {
          passedMessageToHandelMethod = "something happend"
          hendelElseCantFind(req,passedMessageToHandelMethod,null,77757,next,logMessage)
        }

      })
      .catch((error)=>{
        passedMessageToHandelMethod = 'something happend during changing setDone'
        hendelElseCantFind(req,passedMessageToHandelMethod,error,77763,next,logMessage)
      })
  }
}
