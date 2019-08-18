const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BodyPartSchema = require('./body_part')

const MovementSchema = new Schema({
    name: {
        type: String,
        unique: true,
        require: [true, "english name is required"]
    },
    persianName: {
        type: String,
    },
    category: [{
        type: BodyPartSchema,
        require: [true, "category is required"]
    }],
    desForPatient: {
        type: String
    },
    persionDesForPatient: {
        type: String
    },
    desForPhysio: {
        type: String
    },
    persianDesForPhysio: {
        type: String
    },
    videos: [{
        name: {
            type: String
        },
        status: {
            type: Boolean,
            default: true
        }

    }],
    anim: [{
        type: String
    }],
    pics: [{
        name: {
            type: String
        },
        status: {
            type: Boolean,
            default: true
        }

    }],
    voices: [{
        name: {
            type: String
        },
        status: {
            type: Boolean,
            default: true
        }

    }],
    duration: Number,
    bestTime: String,
    complete: {
        type: Boolean,
        default: false
    },
    createBy: {
        user: {
            type: Schema.Types.ObjectId,
            ref: "person"
        },
        type: {
            type: String
        }
    },
    edits: [{
        edit: {
            type: Schema.Types.ObjectId,
            ref: "movementN"
        },
        status:  {
            type: String,
            enum: ["reject", "checking", "accept", "finish"],
            default:"checking"
        },
        editBy: {
            type: Schema.Types.ObjectId,
            ref: "person"
        },
        checkBy: {
            type: Schema.Types.ObjectId,
            ref: "person"
        },
    }],
    updateStatus: {
        type: String,
        enum: ["reject", "checking", "accept", "finish"],
    },
    updateBy:{
        type: Schema.Types.ObjectId,
        ref: "person"
    }
});

// <editor-fold desc='Method'>
MovementSchema.statics.getMovementIdById = function (id) {
    return Movement.findOne({
        _id: id
    }).select({
        _id: 1
    })
}


MovementSchema.statics.getAllOrgan = async function () {
    const allMovement= await Movement.find({complete:true})
    const organs = []
    allMovement.forEach(element => {
        element.category.forEach(element => {
           organs.push(element.organ) 
        });
    });
    var uniqueOrgans = new Set(organs) 
    return  Array.from(uniqueOrgans);
    
}

MovementSchema.statics.getJoints = async function(organ){
    const allMovement= await Movement.find({complete:true,"category.organ":organ})
    const joints = []
    console.log(JSON.stringify(allMovement.length,undefined,2))
    allMovement.forEach(element => {
        element.category.forEach(element => {
            joints.push(element.joint) 
        });
    });
    console.log(joints)
    var uniqueJoints = new Set(joints) 
    console.log(uniqueJoints)

    return  Array.from(uniqueJoints);
}

MovementSchema.methods.getId = function () {
    var returnObject = {
        _id: this._id
    };
    return returnObject;
};


MovementSchema.pre('save', async function (next) {
    const movement = this
    next()
})
MovementSchema.virtual('original', {
    ref: 'movementN',
    localField: '_id',
    foreignField: 'edits.edit'
})

// </editor-fold>
const Movement = mongoose.model("movementN", MovementSchema)
module.exports = Movement;