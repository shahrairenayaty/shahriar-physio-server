const Person = require("../../models/person")
const jwt = require("jsonwebtoken")
const consts = require('../G/consts')

const createAccess = (user)=>{
    user.access = 0b0
    if(user.Permissions.physio.status===true){
        user.access+=0b01000
    }
    if(user.Permissions.patient.status===true){
        user.access+=0b00010
    }
    if(user.Permissions.assistant.status===true){
        user.access+=0b00100
    }
    if(user.Permissions.watcher.status===true){
        user.access+=0b00001
    }
}

const auth = async (req,res,next)=>{    
    try {
        // console.log(req.header('Authorization'))
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await Person.findOne({_id:decoded._id,"tokens.token":token})
        
        if(!user){
            return res.status(401).send(consts.CreateError(req.error,4000009,undefined,"token is unvalid","لطفا از حساب کاربری خود خارج شده و دوباره وارد برنامه شوید.","please sing out and login again."))
        }
        // console.log("type= "+decoded.type)
        user.type=decoded.type
        createAccess(user)
        req.token = token
        req.user = user
        next()
        // console.log(token)
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error,4000010,"something is happanded during auth",error,"لطفا از حساب کاربری خود خارج شده و دوباره وارد برنامه شوید.","please sing out and login again."))
    }
}

module.exports = auth;