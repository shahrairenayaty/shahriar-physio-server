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

const upload = require('../middleware/video')
const uploadPic = require('../middleware/pic')
const uploadVoice = require('../middleware/voice')

router.post('/movements', auth, access(0b01000), async (req, res) => {
    try {
        const movement = new Movement(req.body)
        const t = (req.user.type).toString()

        movement.createBy = {
            user: req.user._id,
            type: t
        }
        const newMovement = await movement.save();
        res.send(newMovement)
    } catch (error) {
        res.status(400).send(consts.CreateError(req.error, 4000016, 'some thing happened durring creating movement', error))
    }

})

router.post('/movements/:id/film', auth, myValidator.movementId, access(0b01100), upload.single('film'), async (req, res) => {
    try {
        const movement = req.movement;
        movement.videos.push({
            name: req.file.filename
        })
        await new Movement(movement).save()
        res.send({
            name: req.file.filename
        })
    } catch (error) {
        res.status(400).send(consts.CreateError(req.error, 4000020, 'some thing happened durring updating video of movement', error))
    }

}, (error, req, res, next) => {
    res.status(500).send(consts.CreateError(req.error, 4000019, 'some thing happened durring video upload', error))
})

router.get('/movements/videos/:name', auth, async function (req, res) {
    try {
        var fileName = req.params.name;
        const movement = await Movement.findOne({
            "videos.name": fileName,
            "videos.status": true,
            complete: false
        })
        if (!movement) {
            return res.send(consts.CreateError(req.error, 4000021, "movement name is wrong or deleted"))
        }
        let relPath = path.join('./upload/videos', fileName); // The default name the browser will use
        res.download(relPath, function (error) {
            if (error) return res.status(400).send(consts.CreateError(req.error, 4000020, 'some thing happened during download videos', error))
        });
    } catch (error) {
        res.status(400).send(consts.CreateError(req.error, 4000020, 'some thing happened during download videos', error))
    }
});
router.delete('/movements/videos/:name', auth, access(0b01000), async (req, res) => {
    try {
        var fileName = req.params.name;
        const movement = await Movement.updateOne({
            "videos.name": fileName,
            complete: false
        }, {
            '$set': {
                'videos.$.status': false
            }
        })
        res.send()
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000027, "some thing happend during delete videos", error))
    }

})


router.post('/movements/pics/:id', auth, myValidator.movementId, myValidator.movementUpdate, access(0b01100), uploadPic.array('pic', 6), async (req, res) => {
    try {
        const movement = req.movement;
        var name = "";
        req.files.forEach(element => {
            movement.pics.push({
                name: element.filename
            })
            name = element.filename
        });
        await new Movement(movement).save()
        res.send({
            name
        })
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error, 4000022, 'some thing happened durring updating pictures of movement', error))
    }

}, (error, req, res, next) => {
    res.status(500).send(consts.CreateError(req.error, 4000022, 'some thing happened durring updating pictures of movement', error))
})

router.get('/movements/pics/:name', auth, async function (req, res) {
    try {
        var fileName = req.params.name;
        let relPath = path.join('./upload/images', fileName); // The default name the browser will use
        res.download(relPath, function (error) {
            if (error)
                return res.status(400).send(consts.CreateError(req.error, 4000023, 'some thing happened during download picture', error))
        });
    } catch (error) {
        res.status(400).send(consts.CreateError(req.error, 4000023, 'some thing happened during download picture', error))
    }
});
router.delete('/movements/pics/:name', auth, myValidator.pics, myValidator.movementUpdate, access(0b01000), async (req, res) => {
    try {
        var fileName = req.params.name;
        const movement = await Movement.updateOne({
            "pics.name": fileName
        }, {
            '$set': {
                'pics.$.status': false
            }
        })
        res.send()
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000028, "some thing happend during delete pics", error))
    }


})


router.post('/movements/voices/:id', auth, myValidator.movementId, myValidator.movementUpdate, access(0b01100), uploadVoice.single('voice'), async (req, res) => {
    try {
        const movement = req.movement;
        var name = "";
        movement.voices.push({
            name: req.file.filename
        })
        name = req.file.filename

        await new Movement(movement).save()
        res.send({
            name
        })
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error, 4000029, 'some thing happened durring updating voice of movement', error))
    }

}, (error, req, res, next) => {
    res.status(500).send(consts.CreateError(req.error, 4000029, 'some thing happened durring updating voice of movement', error))
})

router.get('/movements/voices/:name', auth, async function (req, res) {
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
router.delete('/movements/voices/:name', auth, myValidator.voices, myValidator.movementUpdate, access(0b01000), async (req, res) => {
    try {
        var fileName = req.params.name;
        const movement = await Movement.updateOne({
            "voices.name": fileName
        }, {
            '$set': {
                'voices.$.status': false
            }
        })
        res.send()
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000050, "some thing happend during delete voice", error))
    }


})


router.post('/movements/update/:id', auth, myValidator.movementId, async (req, res) => {
    try {
        var temp = new Movement(req.body)
        temp.createBy = req.movement.createBy
        // temp.edits = req.movement.edits
        temp.name = "update/" + temp.name
        temp.updateStatus = "checking"
        if (req.movement.complete) {
            temp = await temp.save();
            await Movement.updateOne({
                _id: req.movement._id
            }, {
                $push: {
                    "edits": {
                        edit: temp._id,
                        status: true,
                        editBy: req.user._id
                    }
                }
            })

        } else {
            //tode:check permission
            temp._id = req.movement._id
            temp = await Movement.findOneAndUpdate({
                _id: req.movement._id
            }, temp, {
                new: true
            })

        }
        res.send(temp)

    } catch (error) {
        res.status(500).send(consts.CreateError(req.error, 4000033, 'some thing happened during updating movement', error))
    }

})

router.get("/movements/update/:id", auth, myValidator.movementId, myValidator.movementUpdate, access(0b01000), async (req, res) => {

    try {
        if (!req.query.accept) {
            return res.status(400).send(consts.CreateError(req.error, 4000034, 'accept dose not definded in url of accecpt update movement'))
        } else if (req.query.accept === "false") {
            await Movement.updateOne({
                _id: req.params.id
            }, {
                updateStatus: "reject"
            })
            await Movement.updateOne({
                "edits.edit": req.params.id
            }, {
                "edits.$.status": "reject",
                "edits.$.checkBy": req.user._id
            })
            return res.send({
                status: "reject"
            })
        } else {
            const updateMovement = await Movement.findById(req.params.id).populate('original').exec();
            const originalMovement = updateMovement.original[0]
            updateMovement.edits = originalMovement.edits;
            updateMovement._id = originalMovement._id
            var namesOfUpadateMovement = updateMovement.name.split('/');
            updateMovement.name = namesOfUpadateMovement[1]
            updateMovement.complete = true;
            updateMovement.updateStatus ="finish"

            await Movement.updateOne({
                _id: originalMovement._id
            }, {
                $set: updateMovement
            })

            await Movement.updateOne({
                _id: req.params.id
            }, {
                updateStatus: "accept"
            })
            await Movement.updateOne({
                "edits.edit": req.params.id
            }, {
                "edits.$.status": "accept",
                "edits.$.checkBy": req.user._id
            })
            return res.send({
                status: "accept"
            })
        }
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000035,"something happened during accepting or rejecting movement",error))
    }

    // console.log(JSON.stringify(n.original,undefined,2))
})

//just for test
router.get('/organ',async(req,res)=>{
        const organs = await Movement.getAllOrgan();
        const joint = await Movement.getJoints(req.query.organ)
        res.send({joint})
})

router.get("/movements",auth,access(0b01100),async(req,res)=>{
    const match = {}
    if(req.query.complete){
        match.complete=req.query.complete==='true'
    }
    if(req.query.joint){
        match["category.joint"] = req.query.joint
    }
    if(req.query.organ){
        match["category.organ"] = req.query.organ
    }
    if(req.query.createBySelf&&req.query.createBySelf==='true'){
        match["createBy.user"] = req.user._id
    }

    if(req.query.editMode){
        match["edits.status"] = req.query.editMode
    }
    if(req.query.editBySelf&&req.query.editBySelf==='true'){
        match["edits.editBy"] = req.user._id
    }
    if(req.query.checkBySelf&&req.query.checkBySelf==='true'){
        match["edits.checkBy"] = req.user._id
    }
    if(req.query.updateStatus){
        match.updateStatus = req.query.updateStatus
        match.complete=false
    }
    if(req.query.id){
        match._id = req.query.id
    }
    try {
        const result= await Movement.find(match) 
        res.send({result,match})
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000036,"something happened during finding movement tha match queries",error))
    }
   
   
    
})



module.exports = router