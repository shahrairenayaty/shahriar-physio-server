const Physio = require("../physio")
class Physios(){
  constructor(){

  }

  getIdByToken(token){
    Physio.findOne({"token.mainToken":token}).select({_id:1})
      .then((p)=>{
  }
}
