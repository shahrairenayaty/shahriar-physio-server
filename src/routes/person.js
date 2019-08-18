const express = require('express')
const router = express.Router()
const type = require("../middleware/typePerson")
const ifExist = require("../middleware/update_permission")
const consts = require("../G/consts")
const myValidator = require("../G/my_validator")
const auth  = require("../middleware/auth")
const access = require('../middleware/access')
// const permission = require("../middleware/")
// const auth = require('../middleware/auth')
// const sharp = require('sharp')

// const {sendWelcomeEmail,sendCanselEmail} = require('../emails/account')
const Person = require('../../models/person')

// const multer = require('multer')
// const upload = multer({
//     // dest:'avatars',
//     limits: {
//         fieldSize: 100000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return cb(new Error('Please upload an image'))
//         }
//         cb(undefined, true)
//     }
// })



router.post('/users',auth,type,access,myValidator.createUser,ifExist,async (req, res) => {
    // req.type;
    try {
        const person = new Person(req.body);
        person.type = req.type
        await person.save()
        // sendWelcomeEmail(user.email,user.name)
        const token = await person.generateAuthToken(req.type)
        res.status(201).send({
            person,
            token
        })
    } catch (error) {
        res.status(400).send(consts.CreateError(req.error,4000002,"an error occur during person creating",error))
    }
})

router.post('/users/login',type,async(req,res)=>{
try{
    if(req.type===consts.Self){
        return res.status(400).send( consts.CreateError(req.error,4000012,"self can not be as type"))
    }
    const number = (req.body.number)
    const user = await Person.findOne({"mobiles.number":number})
    // console.log(user)
    if(!user||(user.password!==req.body.password)||user.Permissions[req.type].status==false){
        return res.status(400).send(consts.CreateError(req.error,4000006,"number or passwrod is wrong",undefined,"شماره موبایل یا پسورد اشتباه است.","phone number or password is wrong."))
    }
    const token = await user.generateAuthToken(req.type)
    // console.log(token)
    await user.updatePhoneModelAndAppVersion(req.body.phoneModel,req.body.appVersion,token);
    
    return res.send({
        user,
        token
    })
}catch(error){
    return res.status(400).send(consts.CreateError(req.error,4000007,"something is happanded during login",error))
}
   
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        console.log(JSON.stringify(req.user,undefined,2))
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        req.user.PhoneModel.forEach(element => {
            if(element.token===req.token){
                element.token=undefined
            }
        });
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000015,"some thing happened durring logout",error))
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        req.user.PhoneModel.forEach(element => {
            element.token=undefined
        });
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})


router.get('/users',auth,async (req,res)=>{
    const match = {}
    if(req.query.idNation){
        match.idNation=req.query.idNation
    }
    if(req.query.phoneNumber){
        match["mobiles.number"]=req.query.phoneNumber
    }
    if(req.query.physio){
        match["Permissions.physio.status"]=req.query.physio==='true'
    }
    if(req.query.patient){
        match["Permissions.patient.status"]=req.query.patient==='true'
    }
    if(req.query.watcher){
        match["Permissions.watcher.status"]=req.query.watcher==='true'
    }
    if(req.query.assistant){
        match["Permissions.assistant.status"]=req.query.assistant==='true'
    }
    if(req.query.name){
        match["name"] = {"$regex":req.query.name,"$options":"i"}
    }
    if(req.query.family){
        match["family"] = {"$regex":req.query.family,"$options":"i"}
    }

    try {
        const result= await Person.find(match) 
        res.send({result,match})
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000052,"some thing happened during get person that match with query",error))
    }
})





module.exports = router