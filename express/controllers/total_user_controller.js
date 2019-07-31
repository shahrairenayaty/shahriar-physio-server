const MyLog = require("../../mylog")
const Movement  = require("../../models/movement");

const myLog = new MyLog(100);
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
          req.myServer.patient=returnedObject;
          break;
        case "movements":
          req.myServer.movements = returnedObject;
          break;
        default:
      }
    }else
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
  //const myServer ={}
  switch (nameObject) {
    case "visit":
      req.myServer.visit=returnedObject
      break;
    case "physio":
      req.myServer.physio=returnedObject
      break;
    case "visits":
      req.myServer.visits=returnedObject
      break;
    case "res":
      req.myServer.EndOfReq=true;
        break;
    default:

  }
  //myServer.id=req.myServer.id
  //myServer.message=message
  res.send({
    myServer:req.myServer,
    condition:true,
    //console.log();
    id:req.myServer.id[req.myServer.id.length-2]
  })
  console.log(message);
  myLog.endLog(logMessage,"=")
}
module.exports = {
  sendResToUser(req,res,next){
    logMessage="sendResToUser"
    myLog.startLog(logMessage,'=')
    const message='req responce successfully';
    //console.log("req= "+JSON.stringify(req.myServer,null,2));
    handelResSuccess(req,res,'res',null,8585,message,logMessage)
  }
  ,validateMyInfo(req,res,next){ //is myInfo in req.body =>if yes continue other controllers
    logMessage="validateMyInfo"
    myLog.startLog(logMessage,'=')
    console.log(JSON.stringify(req.body,null,2))
    
        const {myInfo} = req.body
        if(myInfo){
          console.log('myInfo is okey')
          myLog.endLog(logMessage,"=");
          next();
        }
        else{
          passedMessageToHandelMethod = 'myInfo key does not exist in req.body'
          hendelElseCantFind(req,passedMessageToHandelMethod,null,99904,next,logMessage)
        }
     
      //#region
      //#endregion
  }
  ,getAllMovement(req,res,next){//get all movement in database
    logMessage="getAllMovement";
    myLog.startLog(logMessage,'=')
      Movement.getAllMovement()
        .then((returnedMovements)=>{
          if(returnedMovements){
            console.log(JSON.stringify(returnedMovements,undefined,2));
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
}
