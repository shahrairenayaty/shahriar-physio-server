//require("../../models/exercise");
//require("../../models/movement");
const MyLog = require("../../myLog")
const Physio    = require("../../models/physios");
const Patient   = require("../../models/patient");
const Visit     = require("../../models/visit")
const Movement  = require("../../models/movement");
const Exercise  = require("../../models/exercise");
const crypto    = require("crypto");
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
    // console.log("no");
    // console.log("myServer "+JSON.stringify(req.myServer,undefined,2));
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
          req.myServer.patient=returnedObject;
          break;
        case "patients":
          req.myServer.patients=returnedObject;
          break;
        case "movements":
            // console.log("switch movement");
            req.myServer.movements=returnedObject;
            // console.log(JSON.stringify(req.myServer.movements,null,2));
          break;
        default:
      }}
    else
    {
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
        default:
          console.log("wrong name in name object of handelThenSuccess");
          break;
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
  console.log(req.myServer);
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
  const myServer =req.myServer
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

  checkUserName(req,res,next){  //userName in req.body.myInfo.auth[2] is in DB and is it valid? if yes put password and _id of it in body.myServer.physio
    logMessage="checkUserName";
    myLog.startLog(logMessage,'=')
    // console.log(JSON.stringify(req.myServer)+"shh");
    const {auth} = req.body.myInfo
    if(auth){
      const PhysioNumber = req.body.myInfo.auth[2];
      if(PhysioNumber){
        // console.log(JSON.stringify(req.myServer)+"shh");
        Physio.findPhysioByWorkNumber(PhysioNumber)
          .then((returnedPhysio)=>{
            if(returnedPhysio){
              console.log('userName is valid')
              req=handelThenSuccess(req,'physio',returnedPhysio,10006,next,logMessage)
            }else{
              passedMessageToHandelMethod = "work number is unvalid!"
              hendelElseCantFind(req,passedMessageToHandelMethod,null,99923,next,logMessage)
            }
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "something happand after we find physio or after we find that there isn't any physio with this number"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,99924,next,logMessage)
          })
      }else{
        passedMessageToHandelMethod = 'myInfo.auth[userName] key does not exist in req.body.myInfo'
        hendelElseCantFind(req,passedMessageToHandelMethod,null,99922,next,logMessage)
      }
    }
    else{
      passedMessageToHandelMethod = "myInfo.auth key does not exist in req.body"
      hendelElseCantFind(req,passedMessageToHandelMethod,null,99925,next,logMessage)
    }
    // #region
    //#endregion
  }
  ,checkPassword(req,res,next){  // compare the hash of pass in req.myServer.physio.password to req.body.myInfo.auth[5]+[1]? if true send full info of physio (except password) in body.myServer.physio to next controller
    logMessage="checkPassword";
    myLog.startLog(logMessage,'=')
    // console.log(JSON.stringify(req.myServer));
    const physioPassword = req.body.myInfo.auth[5]+req.body.myInfo.auth[1].trim();
    //console.log(physioPassword);
    if(physioPassword){
      //console.log(crypto.createHash('md5').update(req.myServer.physio.password).digest("hex"));
        if(crypto.createHash('md5').update(req.myServer.physio.password).digest("hex")===physioPassword){
          req.myServer.physio.password=undefined;
          req.myServer.controllerBeforeGetVisits = "checkPassword"
          const returnedObject =req.myServer.physio;
          console.log('login was seccessfull')
          req=handelThenSuccess(req,'physio',returnedObject,10007,next,logMessage)
        }
        else
        {
          passedMessageToHandelMethod = "this password is unvalid!"
          hendelElseCantFind(req,passedMessageToHandelMethod,null,99926,next,logMessage)
        }

    }
    else{
      passedMessageToHandelMethod = 'myInfo.auth[password] key does not exist in req.body.myInfo'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,99927,next,logMessage)
    }
    //#region
    //#endregion
  }
  ,validatePhysioUpdatePersonalInfo(req,res,next){ //check is there any physio key in req.body.myInfo if yes send to next controller and if no send error
    logMessage="validate Physio Update Personal Info"
    myLog.startLog(logMessage,'=')
    const {myInfo} = req.body
    if(myInfo){
      const {physio} = myInfo;
      if(physio){
        console.log('all update infos are valid')
        req=handelThenSuccess(req,'updatePhysio',null,10008,next,logMessage)
      }
      else{
        passedMessageToHandelMethod = 'physio key does not exist in req.body'
        hendelElseCantFind(req,passedMessageToHandelMethod,null,99928,next,logMessage)
      }
    }else {
      passedMessageToHandelMethod = 'myInfo key does not exist in req.body'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,99904,next,logMessage)
    }
    // <editor-fold desc=''>
    // </editor-fold>
  }
  ,validateCreatePatientInfo(req,res,next){ //check is there any physio key in req.body.myInfo if yes send to next controller and if no send error
    logMessage="validate Create Patient Info"
    myLog.startLog(logMessage,'=')
    const {myInfo} = req.body
    if(myInfo){
      const {patient} = myInfo;
      if(patient){
        console.log('info for create patient is valid')
        req=handelThenSuccess(req,'updatePhysio',null,10022,next,logMessage)
      }
      else{
        passedMessageToHandelMethod = 'patient key does not exist in req.body'
        hendelElseCantFind(req,passedMessageToHandelMethod,null,77728,next,logMessage)
      }
    }else {
      passedMessageToHandelMethod = 'myInfo key does not exist in req.body'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,99904,next,logMessage)
    }
    // <editor-fold desc=''>
    // </editor-fold>
  }
  ,updatePhysioPersonalInfo(req,res,next){ // update physio with info in req.body.myInfo.physio if done put new physio in body.myServer.physio to next controller
    logMessage="updatePhysioPersonalInfo";
    myLog.startLog(logMessage,'=')
      Physio.totalUpdateById(req.myServer.physio._id,req.body.myInfo.physio)
        .then((returnedPhysio)=>{
          if(returnedPhysio){
            console.log('update Info was successfull')
            console.log(req.myServer);
            req.myServer.controllerBeforeGetVisits = "updatePhysioPersonalInfo"
            req=handelThenSuccess(req,'physio',returnedPhysio,10009,next,logMessage)
          }
          else{
            passedMessageToHandelMethod = 'update faild'
            hendelElseCantFind(req,passedMessageToHandelMethod,null,99931,next,logMessage)
          }
        })
        .catch((error)=>{
          passedMessageToHandelMethod = 'update faild'
          hendelElseCantFind(req,passedMessageToHandelMethod,error,99931,next,logMessage)
        })
        //#region
        //#endregion
  }
  ,getVisitForPhysio(req,res,next){ //get visits of physio by id in req.myServer.physio and hide token and password of patient and put it in req.myServer.visits and in the end send myServer to user
    logMessage="getVisitForPhysio";
    myLog.startLog(logMessage,'=')
    const id = req.myServer.physio._id
    if(id){
      Visit.getVisitForPhysioById(id)
        .then((returnedVisits)=>{
          if(returnedVisits){
            for(var i=0;i<returnedVisits.length;i++){
              if(returnedVisits[i].patient!=null){
              returnedVisits[i].patient.password=undefined;
              returnedVisits[i].patient.token=undefined;
              }
            }
            let message="";
            if(req.myServer.controllerBeforeGetVisits=="updatePhysioPersonalInfo"){
              message='update and return visits were successfull';
            }
            else if(req.myServer.controllerBeforeGetVisits=="checkPassword"){
              message="login and return visits were successfull"
            }
            else{
              message="return visits was successfull"
            }
              handelResSuccess(req,res,'visits',returnedVisits,10010,message,logMessage)
          }
          else
          {
            const message='this physio has 0 visits';
            handelResSuccess(req,res,'visits',undefined,99952,message,logMessage)
          }
        })
        .catch((error)=>{
          passedMessageToHandelMethod = 'some something goes wrong in populate'
          hendelElseCantFind(req,passedMessageToHandelMethod,error,99933,next,logMessage)
        })
    }
    else{
      passedMessageToHandelMethod = '_id does not exist in req.myServer.physio'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,99932,next,logMessage)
    }
    //#region
    //#endregion
  }
  ,createVisit(req,res,next){ //create a visit for Patient id and physio id and then send to
    logMessage="createVist"
    myLog.startLog(logMessage,'=')
    const visit = new Visit({})
    visit.patient=req.myServer.patient
    visit.physio =req.myServer.physio
    visit.save()//populate({path:"patient"})//.populate("patient").populate("physio")
      .then((returnedVisit)=>{
        console.log("create visit was successful")
        req=handelThenSuccess(req,'visit',returnedVisit,10013,next,logMessage)
      })
      .catch((error)=>{
        passedMessageToHandelMethod = 'cant create new Visit'
        hendelElseCantFind(req,passedMessageToHandelMethod,error,99936,next,logMessage)
      });

      //#region
      //#endregion
  }
  ,populateOneNewVisit(req,res,next){
    logMessage="populateVisit"
    myLog.startLog(logMessage,'=')
    Visit.populate(req.myServer.visit,[{path:"patient"}])
      .then((returnedVisit)=>{
        if(returnedVisit){
        returnedVisit.patient.password=undefined;
        returnedVisit.patient.token=undefined;
        const message='create and populateVisit were successful';
        handelResSuccess(req,res,'visit',returnedVisit,10014,message,logMessage)
      }
      else{
        const visitId = req.myServer.visit._id
        passedMessageToHandelMethod = "this visitId: {"+visitId+"} is unvalid!"
        hendelElseCantFind(req,passedMessageToHandelMethod,null,99906,next,logMessage)
      }
      })
      .catch((error)=>{
        passedMessageToHandelMethod = "something happand after we find visit or after we find that there isn't any visit with this id"
        hendelElseCantFind(req,passedMessageToHandelMethod,error,99905,next,logMessage)
      })
  }
  ,validate(req,res,next){
    console.log(hello);
  }
  ,validatePhysioToken(req,res,next){ //is there any physio with this token? if yes => send just id of physio to the next controller in req.myServer.physio
    logMessage = "validate physio token"
    myLog.startLog(logMessage,"=")
        const token = req.params.mainToken;
        //console.log("physio token= "+token);
        Physio.getPhysioIdByToken(token)
        // #region handel getPhysioIdByToken
          .then((returnedPhysio)=>{
            if(returnedPhysio){
              console.log("physio find");
              req=handelThenSuccess(req,"physio",returnedPhysio,10000,next,logMessage)
            }
            else
            {
              passedMessageToHandelMethod = "this token: {"+token+"} is unvalid!"
              hendelElseCantFind(req,passedMessageToHandelMethod,null,99900,next,logMessage)
            }
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "something happand after we find physio or after we find that there isn't any physio with this token";
            hendelElseCantFind(req,passedMessageToHandelMethod,error,99901,next,logMessage)
          })
      // #endregion handel getPhysioIdByToken
      }
  
  ,validateVisitId(req,res,next){     //is there any visit with this id ? if yes  => send total of that visit to the next controller
      logMessage = "validateVisitId"
      myLog.startLog(logMessage,"=")
      const {myInfo}  = req.body;
      if (myInfo) {
        const {visitId} = req.body.myInfo //if token was not be in body , it get undefined value
        if(visitId){
              Visit.getVisitById(visitId)
              // #region handel of getVisitById
                .then((returnedVisit)=>{
                  if(returnedVisit)
                  {
                  console.log('visit find')
                  //console.log("visit= "+returnedVisit);
                  req=handelThenSuccess(req,'visit',returnedVisit,10001,next,logMessage)
                  }
                  else
                  {
                  passedMessageToHandelMethod = "this visitId: {"+visitId+"} is unvalid!"
                  hendelElseCantFind(req,passedMessageToHandelMethod,null,99906,next,logMessage)
                  }
                })
                .catch((error)=>{
                  passedMessageToHandelMethod = "something happand after we find visit or after we find that there isn't any visit with this id"
                  hendelElseCantFind(req,passedMessageToHandelMethod,error,99905,next,logMessage)
                })
              //  #endregion handel of getVisitById
        }
        // #region handel check existion of visitId
        else{
          passedMessageToHandelMethod = 'visitId key does not exist in req.body'
          hendelElseCantFind(req,passedMessageToHandelMethod,null,99903,next,logMessage)
        }
      }
      else
      {
        passedMessageToHandelMethod = 'myInfo key does not exist in req.body'
        hendelElseCantFind(req,passedMessageToHandelMethod,null,99904,next,logMessage)
      }
      // #endregion handel check exist of visitId
  }
  ,validateMovementId(req,res,next){ //has movementId ? =>{yes:validate it =>send id of the movement to next controller}
                                                        //{no:move to createMovement controller  }
    console.log("move in validateMovementId");
    //console.log("in validateMovementId visit= "+req.myServer.visit);
    //console.log("in validateMovementId physio= "+req.myServer.physio);
    const {movementId} = req.body.myInfo
    if(movementId){
      Movement.getMovementIdById(movementId)
      // #region handel of getMovementIdById
        .then((returnedMovement)=>{
          console.log("returned Movement= "+returnedMovement);
          if (returnedMovement) {
            //console.log("visit with "+returnedVisit+" find!");
            if(!req.myServer)
              req.myServer = {};
            req.myServer.movement = returnedMovement
            if(!req.myServer.id)
              req.myServer.id = [];
            req.myServer.id.push(10002)
            //="shahriar"
            next()//next method in controller
          }
          else
          {
            console.log("can't find movement with "+movementId);
            if(!req.myServer)
              req.myServer = {};
            req.myServer.customError = "there isn't any movement with this id";
            if(!req.myServer.id)
              req.myServer.id = [];
            req.myServer.id.push(99907)
            next(req) // next middelware in router
          }
        })
        .catch((error)=>{
          console.log(error);
          console.log("customError: something happand after we find movement or after we find that there isn't any movement with this id");
          console.log("error: "+error);
          if(!req.myServer)
            req.myServer = {};
          req.myServer.customError = "something happand after we find movement or after we find that there isn't any movement with this id";
          req.myServer.error = error;
          if(!req.myServer.id)
            req.myServer.id = [];
          req.myServer.id.push(99908)
          next(req)
        })
      //  #endregion handel of getVisitById
      }else{
        console.log("does not have movementId");
        if(!req.myServer)
          req.myServer = {};
        req.myServer.customError = "does not have movementId";
        if(!req.myServer.id)
          req.myServer.id = [];
        req.myServer.id.push(99909)
        next()
      }

  }
  ,validateMovementIdInArray(req,res,next){ //has exercise ? =>{yes:validate of all movementId Of its exercise =>send id of the movement to next controller in req.myServer.exercises[i].movementId}
    logMessage="validateMovementIdInArray"
    myLog.startLog(logMessage,'=')
    const {exercises} = req.body.myInfo
    if(exercises){
      //console.log("exercises length is "+exercises.length);
      if(exercises.length>0){
        // <editor-fold desc='start of map'>
        // </editor-fold>
        const promises = exercises.map((exercise,index)=>{
          const {movementId} = exercise
          if(movementId)
          {
            //console.log(movementId);
            return Movement.getMovementIdById(movementId)
          }
          else
          {
            passedMessageToHandelMethod = "does not have movementId in exercise:"+(index+1)
            hendelElseCantFind(req,passedMessageToHandelMethod,null,99918,next,logMessage)
          }
        })
        //console.log(promises);
        Promise.all(promises)
          .then(totalPromise=>{
              totalPromise.map((eachReturnedExercise,index)=>{
              if(eachReturnedExercise){
                console.log('exercise '+index+" that id= "+eachReturnedExercise._id+" find!")
                req=handelThenSuccess(req,'exercises',eachReturnedExercise,10004,next,logMessage,true,index,(totalPromise.length-1))
              }
              else
              {
                passedMessageToHandelMethod = "this movementId: {"+exercises[index].movementId+"} is unvalid!"
                hendelElseCantFind(req,passedMessageToHandelMethod,null,99907,next,logMessage,true,index,(totalPromise.length-1))
              }
            })
          })
          .catch(error=>{
            passedMessageToHandelMethod = "something happand after we find movement or after we find that there isn't any movement with this id in "+error+" exercise"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,99919,next,logMessage)
            //console.log("error= "+error.message);
          })
      }
      // #region validation requset body
      else
      {
        passedMessageToHandelMethod = 'exercises is empty'
        hendelElseCantFind(req,passedMessageToHandelMethod,null,99919,next,logMessage)
      }
    }

    else
    {
      passedMessageToHandelMethod = 'exercise key does not exist in req.body'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,99917,next,logMessage)
    }
    // #endregion validation requset body

  }
  ,createMovement(req,res,next){    // has movementName and movementOrgan =>{yes:create One,send id of movement to next controller }
    console.log("move in createMovement");
    console.log("in createMovement visit= "+req.myServer.visit);
    console.log("in createMovement physio= "+req.myServer.physio);
    console.log("in createMovement id= "+req.myServer.id);
    console.log("move in validateMovementId");
    //console.log("in validateMovementId visit= "+req.myServer.visit);
    //console.log("in validateMovementId physio= "+req.myServer.physio);
    const {movementId} = req.body.myInfo
    if(!movementId){
      const {movementName} = req.body.myInfo
      if(movementName){
        const {movementOrgan} = req.body.myInfo
        if(movementOrgan){
            const {movementJoint} = req.body.myInfo
            const {movementDesForPhysio} = req.body.myInfo
            const movement = new Movement({
              name:movementName,
              organ:movementOrgan,
              joint:movementJoint,
              desForPhysio:movementDesForPhysio
            })
            movement.save()
              .then((returnedMovement)=>{
                  console.log(returnedMovement);
                  if(!req.myServer)
                    req.myServer = {};
                  req.myServer.movement = returnedMovement.getId()
                  if(!req.myServer.id)
                    req.myServer.id = [];
                  req.myServer.id.push(10003)
                  next()//next method in controller
              })
              .catch((error)=>{
                console.log(error);
                console.log("customError: something goes wrong in saving movement e.g validation of movement model goes wrong ");
                console.log("error: "+error);
                if(!req.myServer)
                  req.myServer = {};
                req.myServer.customError = "customError: validation of movement model goes wrong";
                req.myServer.error = error;
                if(!req.myServer.id)
                  req.myServer.id = [];
                req.myServer.id.push(99912)
                next(req)
              })
      // #region validate params in body
        }else{
          console.log("does not have movementOrgan");
          if(!req.myServer)
            req.myServer = {};
          req.myServer.customError = "does not have movementOrgan";
          if(!req.myServer.id)
            req.myServer.id = [];
          req.myServer.id.push(99911)
          next(req)
        }
      }else{
        console.log("does not have movementName");
        if(!req.myServer)
          req.myServer = {};
        req.myServer.customError = "does not have movementName";
        if(!req.myServer.id)
          req.myServer.id = [];
        req.myServer.id.push(99910)
        next(req)
      }
      // #endregion validate params in body
    }
    else{
      next()
    }
  }
  ,createExercise(req,res,next){// validate each exercise for start,end,number,set =>if validattion was ok => add to req.myServer.exercises[i]
    logMessage="createExercise";
    myLog.startLog(logMessage,'=');

    //exercise exist check in validateMovementIdInArray
    const {exercises} = req.body.myInfo
    // console.log(exercises);
    let index = 0
    let visit = new Visit({});
    exercises.forEach(exercise=>{
          const {exerciseNumber} = exercise
          let valid = true
          if(!exerciseNumber)
          {
            valid=false
            passedMessageToHandelMethod = "exerciseNumber key does not exist in req.body.exercise index= "+index+" id= "+exercise.movementId
            const id = 99905+(index*10)
            hendelElseCantFind(req,passedMessageToHandelMethod,null,id,next,logMessage,true,index,(exercises.length-1),false)
          }

          const {exerciseSet} = exercise
          if(!exerciseSet)
          {
            valid = false;
            passedMessageToHandelMethod = "exerciseSet key does not exist in req.body.exercise index= "+index+" id= "+exercise.movementId
            const id = 99906+(index*10)
            hendelElseCantFind(req,passedMessageToHandelMethod,null,id,next,logMessage,true,index,(exercises.length-1))
          }
          if(valid){
            if(!req.myServer.exercises[index].date)
              req.myServer.exercises[index].date={}
            // console.log("start date= "+exercise.exerciseStartDate);
            // console.log("end date= "+exercise.exerciseEndDate);
            // console.log("number= "+exercise.exerciseNumber);
            // console.log("set= "+exercise.exerciseSet);
            req.myServer.exercises[index].date.start = exercise.exerciseStartDate;
            req.myServer.exercises[index].date.end = exercise.exerciseEndDate;
            req.myServer.exercises[index].number = exercise.exerciseNumber;
            req.myServer.exercises[index].set = exercise.exerciseSet;
            //console.log();
            if(!req.myServer.id)
              req.myServer.id = [];
              const id = 10005+(index*10)
              req.myServer.id.push(id)
            if(index==exercises.length-1){
              let allIsGood = true;
              req.myServer.id.forEach(eachId=>{
                //console.log("id for each= "+Math.floor(eachId/10000));
                  if(Math.floor(eachId/10000)!=1){
                    allIsGood=false
                  }
              })
              if(allIsGood)
              {
                console.log("all exercise was valid");
                myLog.endLog(logMessage,"=");
                next();
              }else
              {
                myLog.endErrorLog(logMessage);
                next(req)
              }
            }
          }
          index++;



    })
    //#region
    //#endregion
}
  ,addResultsToVisit(req,res,next){
    req
      .then(()=>{
        const {visitId} = rq.body
        const {movementId} = req.boy
        // <editor-fold desc='search movement'>
        if(movementId){
          console.log(movementId);
          Movement.getMovementIdById(movementId)
          // #region desc='find movement'
            .then((returnedMovement)=>{
              if(returnedMovement){
                console.log(returnedMovement);

              }
              // #endregion find movement
              // #region desc='wrong movement ID'
              else
              {

              }
            })
            // #endregion wrong movement ID
            // #region desc='bad error for getMovementIdById'
            .catch(()=>{

            })
            // #endregion bad error for getMovementIdById
        }
        // </editor-fold> search movement
        // <editor-fold desc='create movement'>
        else
        {

        }
        // </editor-fold> create movement
      })
      .catch(()=>{

      })
}
  ,updateExercisesOfVisit(req,res,next){
    logMessage="updateVisit"
    myLog.startLog(logMessage,'=')
    //console.log(JSON.stringify(req.myServer,null,2));
    try {
      req.myServer.visit.result.exercises = req.myServer.exercises.slice()
    } catch (error) {
      passedMessageToHandelMethod = 'cant cast exercise in exercise to visit.result'
      hendelElseCantFind(req,passedMessageToHandelMethod,error,99920,next,logMessage)
    }
      Visit.updateExercises(req.myServer.visit._id,req.myServer.visit)
        .then((returnedVisit)=>{
          //console.log(visit);
          const message="exercises are added successfully";
          handelResSuccess(req,res,"visit",returnedVisit,10010,message,logMessage)
        })
        .catch((error)=>{
          console.log("error for update the visit:\n"+error);
        })

  }
  ,createPatientByPhysio(req,res,next){
    logMessage="create Patient By Physio";
    myLog.startLog(logMessage,'=');
    const {patient} = req.body.myInfo
    if(patient){
      let newPatient = new Patient(patient)
      newPatient.registerBy = "physio"
        newPatient.save()
          .then((returnedPatient)=>{
            //console.log(JSON.stringify(returnedPatient,null,2));
            console.log('create patient was successfull')
            req=handelThenSuccess(req,'patient',returnedPatient,10015,next,logMessage)
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "can't create new Patient"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,99938,next,logMessage)
          })
    }
    else{
      passedMessageToHandelMethod = 'patient does not exist in req.body'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,99937,next,logMessage)
    }
  }
  ,addPatientToPhysio(req,res,next){
    logMessage="add Patient To Physio"
    myLog.startLog(logMessage,'=')
    req.myServer.physio.addPatient(req.myServer.patient)
      .then((returnedPhysio)=>{
        if(returnedPhysio){
          for(var i=0;i<returnedPhysio.patients.length;i++){
            returnedPhysio.patients[i].patient.password=undefined;
            returnedPhysio.patients[i].patient.token=undefined;
          }
        const message='patient added to physio successfully';
        handelResSuccess(req,res,'physio',returnedPhysio,10016,message,logMessage)
      }
      })
      .catch((error)=>{
        passedMessageToHandelMethod = 'cant add this patient to physio patients'
        hendelElseCantFind(req,passedMessageToHandelMethod,error,99939,next,logMessage)
      })
  }
  ,getPhysioInfosById(req,res,next){
    logMessage="getPhysioInfosById"
    myLog.startLog(logMessage,'=')
      const {_id} = req.myServer.physio
      if(_id){
          Physio.getPhysioInfosByIdForSelf(_id)
            .then((returnedPhysio)=>{
              if(returnedPhysio){
                console.log("personal info of physio fetched")
                req=handelThenSuccess(req,'physio',returnedPhysio,10017,next,logMessage)
              }
              else{
                passedMessageToHandelMethod = "this id for patient  {"+id+"} is unvalid!"
                hendelElseCantFind(req,passedMessageToHandelMethod,null,99934,next,logMessage)
              }
            })
            .catch((error)=>{
              passedMessageToHandelMethod = "something happand after we find physio or after we find that there isn't any physio with this id"
              hendelElseCantFind(req,passedMessageToHandelMethod,error,99935,next,logMessage)
            })
      }
      else{
        passedMessageToHandelMethod = '_id does not exist in req.myServer.physio'
        hendelElseCantFind(req,passedMessageToHandelMethod,null,99932,next,logMessage)
      }
  }
  ,searchPatient(req,res,next){
    logMessage="searchPatient"
    myLog.startLog(logMessage,'=')
    let isSearch = false
    const {patient} = req.body.myInfo
    if(patient){
      // <editor-fold desc='serarch By idNation'>
      const {idNation} = patient
      if(idNation){
        isSearch=true
        req.myServer.searchMethod = "idNation"
        try {
          Patient.searchPatientByIdNation(idNation)
            .then((returnedPatient)=>{
              //console.log("returnedPatient= "+JSON.stringify(returnedPatient,null,2));
              if(returnedPatient){
                console.log('find patient by id Nation')
                req=handelThenSuccess(req,'patients',returnedPatient,20018,next,logMessage)
              }
              else{
                passedMessageToHandelMethod = 'this idNation for patient is unvalid!'
                hendelElseCantFind(req,passedMessageToHandelMethod,null,77740,next,logMessage)
              }
            })
            .catch((error)=>{
              passedMessageToHandelMethod = "something happand after we find patient or after we find that there isn't any patient with this idNation"
              hendelElseCantFind(req,passedMessageToHandelMethod,error,77741,next,logMessage)
            })
        } catch (e) {
          console.log(e);
        }

      }
      // </editor-fold>
      // <editor-fold desc='search By fullName'>
      const {name} = patient
      const {family} = patient
      if(name && family&&!isSearch){
        isSearch=true
        req.myServer.searchMethod = "fullName"
        Patient.searchPatientByFullname(name,family)
          .then((returnedPatient)=>{
            //console.log("returnedPatient= "+JSON.stringify(returnedPatient,null,2));
            if(returnedPatient){
              console.log('find patient by full name')
              req=handelThenSuccess(req,'patients',returnedPatient,20019,next,logMessage)
            }
            else{
              passedMessageToHandelMethod = 'this fullname for patient is unvalid!'
              hendelElseCantFind(req,passedMessageToHandelMethod,null,77742,next,logMessage)
            }
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "something happand after we find patient or after we find that there isn't any patient with this fullName"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,77743,next,logMessage)
          })
        }
      // </editor-fold>
      // <editor-fold desc='search by Number'>
      const {number} = patient
      const {title} = patient
      //console.log("numer= "+number+" title= "+title);
      if(number&&title&&!isSearch){
        isSearch=true
        req.myServer.searchMethod = "number"
        //console.log("try to find");
        try {
          Patient.searchPatientByNumber(number,title)
            .then((returnedPatient)=>{
              //console.log("returnedPatient= "+JSON.stringify(returnedPatient,null,2));
              if(returnedPatient){
                console.log('find patient by number')
                req=handelThenSuccess(req,'patients',returnedPatient,20020,next,logMessage)
              }
              else{
                passedMessageToHandelMethod = 'this number for patient is unvalid!'
                hendelElseCantFind(req,passedMessageToHandelMethod,null,77744,next,logMessage)
              }
            })
            .catch((error)=>{
              passedMessageToHandelMethod = "something happand after we find patient or after we find that there isn't any patient with this fullName"
              hendelElseCantFind(req,passedMessageToHandelMethod,error,77745,next,logMessage)
            })
        } catch (e) {
          console.log(e);
        }

        }
      // </editor-fold>
      if(!isSearch){
        passedMessageToHandelMethod = "there isn't any params to search with it"
        hendelElseCantFind(req,passedMessageToHandelMethod,null,77746,next,logMessage)
      }
    }
    else{
      passedMessageToHandelMethod = 'patient does not exist in req.body'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,77728,next,logMessage)
    }
  }
  ,updatePatientCondition(req,res,next){
    logMessage="updatePatientCondition"
    myLog.startLog(logMessage,'=')
    const {condition} = req.body.myInfo
    console.log("condition="+condition);
    if(condition!=undefined){
      try {
        Physio.updatePatientCondition(req.myServer.physio._id,req.myServer.patient._id,condition)
          .then((returnedPhysio)=>{
            if(returnedPhysio){
              console.log('update condition of patient was successful')
              req=handelThenSuccess(req,'physio',returnedPhysio,10021,next,logMessage)
            }
            else{
              passedMessageToHandelMethod = 'this patient is not in patients of physio'
              hendelElseCantFind(req,passedMessageToHandelMethod,null,99947,next,logMessage)
            }
          })
          .catch((error)=>{
            passedMessageToHandelMethod = "something happand after we find physio and patient in patients or after we find that there isn't any thind like this"
            hendelElseCantFind(req,passedMessageToHandelMethod,error,99948,next,logMessage)
          })
      }
      catch (e) {
        console.log(e);
      }

    }
    else {
      passedMessageToHandelMethod = 'condition key does not exist in req.body'
      hendelElseCantFind(req,passedMessageToHandelMethod,null,99949,next,logMessage)
    }

  }
  ,getAllMovement(req,res,next){//get visits of physio by id in req.myServer.physio and hide token and password of patient and put it in req.myServer.visits and in the end send myServer to user
    logMessage="getAllMovement";
    myLog.startLog(logMessage,'=')
      Movement.getAllMovement()
        .then((returnedMovements)=>{
          if(returnedMovements){
            console.log('get all movements')
            req=handelThenSuccess(req,'movements',returnedMovements,10025,next,logMessage)
          }
          else
          {
            passedMessageToHandelMethod = 'cant get all movement'
            hendelElseCantFind(req,passedMessageToHandelMethod,null,99960,next,logMessage)
          }
        })
        .catch((error)=>{
          passedMessageToHandelMethod = 'some something goes wrong'
          hendelElseCantFind(req,passedMessageToHandelMethod,error,99961,next,logMessage)
        })
    //#region
    //#endregion

  }
  ,parseOneFile(req,res,next){
    console.log("hello");
    let name = req.body.name
    let id = req.body.id
    console.log("name= "+name+"id= "+id);
    console.log(req.file);
  }
};
