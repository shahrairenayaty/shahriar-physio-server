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
const Visit = require('../models/visit')
const upload = require('../middleware/video')
const uploadPic = require('../middleware/pic')
const uploadVoice = require('../middleware/voice_exercise')

router.post('/exercises/:id', auth, access(0b01100), myValidator.visitId, myValidator.checkDate, myValidator.exercises, async (req, res) => {
    try {
        const totalExercise = req.visit.result.exercises.concat(req.exercises)
        req.visit.result.exercises = totalExercise;
        // console.log(JSON.stringify(req.visit, undefined, 2))
        await req.visit.save();
        // req.visit.result.exercises.forEach(element => {
        //     element.date = undefined
        //     element.setDone = undefined
        //     element.isCheck = undefined
        //     element.
        // });
        res.send(req.visit);
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error, 4000043, "some thing happened during add exercise to visit", error))
    }

})

router.patch('/exercises/:exerciseId', auth, access(0b01100), myValidator.exerciseId, myValidator.checkDate, myValidator.exercise, async (req, res) => {
    try {
        req.exercise._id = req.params.exerciseId
        const newVist = await Visit.findOneAndUpdate({
            "result.exercises._id": req.params.exerciseId
        }, {

            "result.exercises.$": req.exercise

        }, {
            new: true
        })
        if (!newVist) {
            throw new Error("cant edit exercise")
        }
        res.send(newVist)
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error, 4000045, "some thing happened during edit exercise", error))
    }

})

router.get('/exercises/:exerciseId', auth, access(0b01110), myValidator.exerciseId, myValidator.checkDate, async (req, res) => {
    try {
        const set = req.exerciseDatabase.set
        const setDone = req.exerciseDatabase.setDone
        var isComplete = false;
        if (setDone + 1 > set) {
            throw new Error("setDone is full cant increament another one")
        }
        if (setDone + 1 === set) {
            isComplete = true
        }
        await Visit.findOneAndUpdate({
            "result.exercises._id": req.params.exerciseId
        }, {
            $set: {
                "result.exercises.$.setDone": setDone + 1,
                "result.exercises.$.isCheck": false,
                "result.exercises.$.isComplete": isComplete
            }
        })

        res.send()
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error, 4000048, "some thing happened during increament setDone", error))
    }


})



router.post('/exercises/voices/:exerciseId', auth, myValidator.exerciseId, myValidator.checkDate,access(0b01100), uploadVoice.single('voice'), async (req, res) => {
    try {
        var name = req.file.filename;
        await Visit.findOneAndUpdate({
            "result.exercises._id": req.params.exerciseId
        }, {
            $push: {
                "result.exercises.$.voices": {
                    name: name
                }
            }
        })
        res.send({
            name
        })
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error, 4000049, 'some thing happened durring updating voice of exercise', error))
    }

}, (error, req, res, next) => {
    res.status(500).send(consts.CreateError(req.error, 4000049, 'some thing happened durring updating voice of exercise', error))
})

router.get('/exercises/voices/:name', auth, async function (req, res) {
    try {
        var fileName = req.params.name;
        let relPath = path.join('./upload/voices', fileName); // The default name the browser will use
        res.download(relPath, function (error) {
            if (error)
                return res.status(400).send(consts.CreateError(req.error, 4000030, 'some thing happened during download voice', error))
        });
    } catch (error) {
        res.status(400).send(consts.CreateError(req.error, 4000030, 'some thing happened during download voice', error))
    }
});
router.delete('/exercises/voices/:name', auth, myValidator.voicesEx, access(0b01000), async (req, res) => {
    try {
        var fileName = req.params.name;
        await Visit.updateOne({
            "result.exercises.voices.name": fileName
        }, {
            '$set': {
                'result.exercises.$[].voices.$[].status': false
            }
        })
        res.send()
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000050, "some thing happend during delete voice", error))
    }


})

router.get('/exercises',auth,async(req,res)=>{
    const match = {}
    
    if(req.query.complete){
        match["result.exercises.isComplete"]=req.query.complete==='true'
    }
    if(req.query.active){
        match["result.exercises.isActive"]=req.query.active==='true'
    }
    if(req.query.check){
        match["result.exercises.isCheck"]=req.query.check==='true'
    }

    if(req.query.physio){
        match.physio=req.query.physio
    }
    if(req.query.patient){
        match.patient=req.query.patient
    }
    try {
        if(req.query.startDate){
            const date={}
            if(req.query.startDateStart){
                date["$gte"] = req.query.startDateStart
            }
            if(req.query.startDateEnd){
                date["$lte"] = req.query.startDateEnd
            }
            match["result.exercises.date.start"] = date
        }
        if(req.query.endDate){
            const date={}
            date["$lt"] = req.query.endDate
            match["result.exercises.date.end"] = date
        }
        const result= await Visit.find(match) 
        res.send({result,match})
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000051,"some thing happened during get visits in exersie route",error))
    }
   
})



module.exports = router