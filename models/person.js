const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const consts = require("../src/G/consts")
const mobileSchema = require("../models/G/mobile")


const Schema = mongoose.Schema;


const PersonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    family: {
        type: String,
        required: true,
        trim: true
    },
    birthday: {
        type: Date
    },
    mobiles: {
        type: [mobileSchema],
        required: true,
        validate: (value) => value.length > 0,
    },
    idNation: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    PhoneModel: [{
        name: {
            type: String
        },
        lastUse: {
            type: Date
        },
        token: {
            type: String
        }
    }],
    appVersion: [{
        name: {
            type: String
        },
        lastUse: {
            type: Date
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    Permissions: {
        patient: {
            status: {
                type: Boolean,
                default: false
            },
            registryDate: {
                type: Date,
            },
            watchers: [{
                watcher: {
                    type: Schema.Types.ObjectId,
                    ref: "person"
                },
                status: {
                    type: Boolean,
                    default: true
                }
            }]
        },
        physio: {
            status: {
                type: Boolean,
                default: false
            },
            registryDate: {
                type: Date,
            },
            patients: [{
                patient: {
                    type: Schema.Types.ObjectId,
                    ref: "person"
                },
                status: {
                    type: Boolean,
                    default: true
                }
            }],
            assistants: [{
                assistant: {
                    type: Schema.Types.ObjectId,
                    ref: "person"
                },
                status: {
                    type: Boolean,
                    default: true
                }
            }]
        },
        assistant: {
            status: {
                type: Boolean,
                default: false
            },
            registryDate: {
                type: Date,
            },
        },
        watcher: {
            status: {
                type: Boolean,
                default: false
            },
            registryDate: {
                type: Date,
            },
        }
    }

}, {
    timestamps: true
})

PersonSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject();
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

PersonSchema.methods.generateAuthToken = async function (type) {
    console.log(type)
    const user = this
    const token = jwt.sign({
        _id: user._id.toString(),
        type: type.toString()
    }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({
        token
    })
    await user.save();
    return token;
}

PersonSchema.methods.updatePhoneModelAndAppVersion = async function (PhoneModel1, appVersion, token) {
    const user = this;
    var queryPhone = {}
    queryPhone["name"] = PhoneModel1;
    queryPhone["lastUse"] = Date.now()
    queryPhone["token"] = token
    var queryApp = {}
    queryApp["name"] = appVersion;
    queryApp["lastUse"] = Date.now()
    try {

        var bulk = Person.collection.initializeOrderedBulkOp();
        bulk.find({
            '_id': user._id
        }).update({
            $pull: {
                PhoneModel: {
                    name: PhoneModel1
                },
                appVersion: {
                    name: appVersion
                }

            }
        });
        bulk.find({
            '_id': user._id
        }).update({
            $push: {
                PhoneModel: queryPhone,
                appVersion: queryApp
            }

        })
        await bulk.execute();


    } catch (error) {
        return res.status(400).send(consts.CreateError(req.error, 400008, "something is happanded during update phone mobile and appversion", error))
    }
}

PersonSchema.pre('save', async function (next) {
    const person = this
    if (person.type == consts.Physio) {
        person.Permissions.physio.status = true;
        person.Permissions.physio.registryDate = Date.now()
    } else if (person.type == consts.Patient) {
        person.Permissions.patient.status = true;
        person.Permissions.patient.registryDate = Date.now()
    } else if (person.type == consts.Assistant) {
        person.Permissions.assistant.status = true;
        person.Permissions.assistant.registryDate = Date.now()
    } else if (person.type == consts.Watcher) {
        person.Permissions.watcher.status = true;
        person.Permissions.watcher.registryDate = Date.now()
    }
    person.type = undefined

    next()
})


const Person = mongoose.model('Person', PersonSchema)

module.exports = Person