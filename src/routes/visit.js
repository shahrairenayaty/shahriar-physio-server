const express = require('express')
const router = express.Router()
const type = require("../middleware/typePerson")
const path = require('path');

const consts = require("../G/consts")
const myValidator = require("../G/my_validator")
const auth = require("../middleware/auth")
const access = require('../middleware/access_argument')
const Person = require('../../models/person')
const Movement = require('../models/movement')
const Visits = require('../models/visit')
const upload = require('../middleware/video')
const uploadPic = require('../middleware/pic')
const uploadVoice = require('../middleware/voice')



router.post('/visits',auth,access(0b01100),async (req,res)=>{
    try {
        const visit = new Visits()
        visit.physio = req.user._id;
        visit.patient = req.body.patientId;
        await visit.save() 
        res.send(visit)
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000037,'something happened during creating new visit',error))
    }
    
})

router.delete('/visits/:id',auth,access(0b01100),myValidator.visitId,async(req,res)=>{
    try {
        const visit = await Visits.findByIdAndUpdate(req.params.id,{condition:"canceled"},{new:true})
        res.send();
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,400037,"something happened during deleting visit",error))
    }
})

router.get('/visits',auth,async(req,res)=>{
    const match = {}
    const date={}
    if(req.query.physio){
        match.physio=req.query.physio
    }
    if(req.query.patient){
        match.patient = req.query.patient
    }
    if(req.query.self){
        if(req.type===consts.Patient){
            match.patient = req.user._id
        }
        if(req.type===consts.Physio){
            match.physio = req.user._id
        }
    }
    if(req.query.condition){
        match.condition= req.query.condition
    }
    
    try {
        if(req.query.startDate){
            date["$gte"] = req.query.startDate
            match.dateOfVisit = date
        }
        if(req.query.endDate){
            date["$lt"] = req.query.endDate
            match.dateOfVisit = date
        }
        const visits = await Visits.find(match)
        res.send({visits,match})

    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000040,"some thing happened during get visits",error))
    }
    
    
})

router.patch('/visits/:id',auth,access(0b01100),myValidator.visitId,async(req,res)=>{
    try {
        req.visit.condition = req.body.condition
        await req.visit.save();
        res.send()
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000041,'some thing happened during change condition of visit',error))
    }
  
})

module.exports = router