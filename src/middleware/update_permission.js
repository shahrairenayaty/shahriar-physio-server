const Person = require("../../models/person")
const consts = require("../G/consts")

const updatePermissionOfExitUser = async (req, res, next) => {
    
    try {
        const user = await Person.findOne({
            $or: [{
                "mobiles.number": {
                    "$in": req.numbers
                }
            }, 
            {
                idNation: req.body.idNation
            }]
        })
        if (!user) {
            return next()
        }


        var query = {}
        query["Permissions."+req.type+".status"] = true;
        query["Permissions."+req.type+".registryDate"] = Date.now()
        
        // console.log(JSON.stringify(user,undefined,2))
        if(user.Permissions[req.type].status===true){
            return res.status(400).send(consts.CreateError(
                                                        req.error,
                                                        4000005,
                                                        "user have this permission",
                                                        undefined,
                                                        "کاربری با این مشخصات وجود دارد",
                                                        "there is a user with this inforamtion."
                                                        ),
                                        )
        }
        const newPermission = await Person.findOneAndUpdate(
        {
            idNation: user.idNation
        },{"$set": query}
           ,{
            runValidators: true,
            new: true
        })
        return res.status(201).send(newPermission)
    } catch (error) {
        return res.status(400).send(consts.CreateError(req.error,4000014,"some thing happened durring updateing permission of exist user",error))
    }
}

module.exports = updatePermissionOfExitUser;