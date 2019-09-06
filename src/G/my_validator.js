const Person = require("../../models/person")
const consts = require("./consts")
const util = require('util');
const Movement = require("../models/movement")
const Visit = require("../models/visit")
const Exercise = require('../models/exercise')
const createUser = (req, res, next) => {
    try {
        const person = Person(req.body)
        person.type = req.type;
        const numbers = []
        const title = []
        const reqNumber = req.body.mobiles
        if (reqNumber === undefined) {
            throw Error("must set mobiles array")
        }
        reqNumber.forEach(element => {
            numbers.push(element.number)
            title.push(element.title)
        });
        const numbersSet = new Set(numbers)
        const titleSet = new Set(title)
        req.numbers = numbers
        if (numbers.length !== numbersSet.size) {
            return res.status(400).send(consts.CreateError(req.error, 4000003, "duplicate phone number",undefined,"شماره تماس تکراری است","duplicate number"))

        }
        if (title.length !== titleSet.size) {
            return res.status(400).send(consts.CreateError(req.error, 4000004, "duplicate phone title"))
        }

        return next();
    } catch (error) {
        return res.status(400).send(consts.CreateError(req.error, 4000013, "some thing happened durring creating user phone number", error))
    }

}

const movementId = async (req, res, next) => {
    try {
        const movement = await Movement.findById(req.params.id)
        if (!movement) {
            return res.status(400).send(consts.CreateError(req.erro, 4000017, "can't find movement with this id", undefined, "حرکتی که انتخاب کرده اید مشکل دارد. لطفا با پشتیبانی تماس بگیرید.", "the movement you have chosen has problem pleas contact to supprot team."))
        }
        req.movement = movement;
        next()
    } catch (error) {
        res.status(400).send(consts.CreateError(req.erro, 4000018, "some thing happened durring validation movement id", error))
    }

}

const movementUpdate = async (req, res, next) => {
    if (req.movement && req.movement.complete === false && req.movement.updateStatus === "checking") {
        return next()
    } else {
        return res.status(404).send(consts.CreateError(req.error, 4000026, "cant update this movement", "send back to server"))
    }

}
const pics = async (req, res, next) => {
    try {
        var fileName = req.params.name;
        const movement = await Movement.findOne({
            "pics.name": fileName,
            "pics.status": true
        })
        if (!movement) {
            return res.status(400).send(consts.CreateError(req.error, 4000025, "pic name is wrong or deleted"))
        }
        req.movement = movement;
        next()
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000024, "some thing happend during validation pic", error))
    }

}
const voices = async (req, res, next) => {
    try {
        var fileName = req.params.name;
        const movement = await Movement.findOne({
            "voices.name": fileName,
            "voices.status": true
        })
        console.log(movement)
        if (!movement) {
            return res.status(400).send(consts.CreateError(req.error, 4000031, "voice name is wrong or deleted"))
        }
        req.movement = movement;
        next()
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000032, "some thing happend during validation voice", error))
    }

}
const voicesEx = async (req, res, next) => {
    try {
        var fileName = req.params.name;
        const visit = await Visit.findOne({
            "result.exercises.voices.name": fileName,
            "result.exercises.voices.status": true
        })
        console.log(visit)
        if (!visit) {
            return res.status(400).send(consts.CreateError(req.error, 4000031, "voice name is wrong or deleted"))
        }
        req.visit = visit;
        next()
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000032, "some thing happend during validation voice", error))
    }

}

const visitId = async (req, res, next) => {
    const visit = await Visit.findById(req.params.id)
    if (!visit) {
        return res.status(500).send(consts.CreateError(req.error, 4000039, "visit id is wrong", "send to server"))
    }
    req.visit = visit
    next()
}

const exercises = async (req, res, next) => {
    var isEveryThingGood = true;
    errorMessage = ''
    try {
        const exercises = req.body
        if ((!util.isArray(exercises)) || exercises.length <= 0) {
            throw new Error('body must be array of exercise')
        }
        await Promise.all(exercises.map(async (element, index) => {
            const movementId = element.movement
            const movement = await Movement.findById(movementId)
            if (!movement || movement === null) {
                isEveryThingGood = false
                errorMessage = 'unvalid movement id'
                return false
            }
            if (!element.set) {
                isEveryThingGood = false
                errorMessage = 'must set set Number'
                return false
            }
            if (!element.number) {
                isEveryThingGood = false
                errorMessage = 'must set number Number'
                return false
            }
            if(element.setDone==element.set){
                element.isComplete = true
            }
            if (element.date && element.date.start && !(element.date.end)) {
                element.date.end = element.date.start + 86400000
                if (element.date.start < req.visit.dateOfVisit) {
                    isEveryThingGood = false
                    errorMessage = 'start time of exersie must be bigger than date of visit'
                    return false

                }
                if (element.date.end && element.date.end < element.date.start) {
                    isEveryThingGood = false
                    errorMessage = 'end time must be bigger than start time'
                    return false
                }
            }
            return true

        }));
        // console.log(isEveryThingGood)
        if (isEveryThingGood) {
            req.exercises = exercises
            next()
        } else {
            throw new Error(errorMessage)
        }

    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000042, "invalid exercise", error))
    }

}

const exercise = async (req, res, next) => {
    try {
        var errorMessage = ''
        const exercise = req.body
        const movementId = exercise.movement
        // console.log("yesssssssssssssssssssss")
        const movement = await Movement.findById(movementId)
        if (!movement || movement === null) {
            throw new Error(errorMessage)
        }
        if (!exercise.set) {
            errorMessage = 'must set set Number'
            throw new Error(errorMessage)
        }
        if (!exercise.number) {
            errorMessage = 'must set number Number'
            throw new Error(errorMessage)
        }
        if (exercise.date && exercise.date.start && !(exercise.date.end)) {
            exercise.date.end = exercise.date.start + 86400000
            if (exercise.date.start < req.visit.dateOfVisit) {
                throw new Error("start time of exersie must be bigger than date of visit")
            }
            if (exercise.date.end && exercise.date.end < exercise.date.start) {
                throw new Error("end time must be bigger than start date")
            }
        }

        if (exercise.setDone && (exercise.setDone > exercise.set)) {
            throw new Error("setDone cant be bigger than set")
        }
        if(exercise.setDone==exercise.set){
            exercise.isComplete = true
        }
        req.exercise = exercise
        next()
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error, 4000042, "invalid exercise", error))
    }

}

const exerciseId = async (req, res, next) => {
    try {
        const visit = await Visit.findOne({
            "result.exercises._id": req.params.exerciseId
        })
        if (!visit) {
            return res.status(500).send(consts.CreateError(req.error, 4000044, "exercises id is wrong", "send to server"))
        }
        req.visit = visit
        const exercise = visit.result.exercises.find(element => element.id === req.params.exerciseId);
        req.exerciseDatabase = exercise;
        next() 
    } catch (error) {
        return res.status(500).send(consts.CreateError(req.error,4000046,'some thing happened during validation of exercise id ',error))
    }
    
}

const checkDate = async (req, res, next) => {
    try {
        const nowDate = Date.now()
        var endDate = 0
        if (req.visit) {
            endDate = req.visit.dateOfVisit+(24*60*60*1000*3)
        }
        if(req.exerciseDatabase){
            endDate = req.exerciseDatabase.date.end
        }
        if(nowDate>endDate){
            throw new Error("it is late for do this action")
        }
        next() 
    } catch (error) {
        res.status(500).send(consts.CreateError(req.error,4000047,'some thing happened during validation of date',error))
    }
    

}
module.exports = {
    createUser,
    movementId,
    pics,
    movementUpdate,
    voices,
    visitId,
    exercises,
    exercise,
    exerciseId,
    checkDate,
    voicesEx   

}