const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require ("body-parser");
const expressValidator = require('express-validator')
const routes = require ( "./express/routes/routes");

const app = express();
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);

if(process.env.NODE_ENV!=="test"){
  const mongodbUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/physioDB"
  mongoose.connect(mongodbUrl,{ useNewUrlParser: true });
}
try {
  app.use(bodyParser.json());
  // app.use(expressValidator());
  app.use("/profilePic",express.static("profilePic"))
  routes(app);
  app.use((err,req,res,next)=>{
    //console.log(err);
    const send ={};
    send.message="some thing goes wrong";
    //console.log(JSON.stringify(req,undefined,2));
    console.log(req.myServer);
    if(req.myServer){
      if(req.myServer.physio){
        if(req.myServer.physio.password){
          req.myServer.physio.password = undefined;
        }
        if(req.myServer.physio.token){
          req.myServer.physio.token = undefined;
        }
      }
      if(req.myServer.patient){
        if(req.myServer.patient.password){
          req.myServer.patient.password = undefined;
        }
        if(req.myServer.patient.token){
          req.myServer.patient.token = undefined;
        }
      }
    send.myServer= req.myServer;
    send.error=req.err;
    if(req.myServer.id)
      send.id=req.myServer.id[(req.myServer.id.length)-1]
    }
    res
      // .status(422)
      .send(send);
  });
} catch (e) {
console.log("error"+e);
}


module.exports= app;
