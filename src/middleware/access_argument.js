const consts = require('../G/consts');

const accees = (numberAccess)=>{
    return (req,res,next)=>{
        // console.log("user accees "+req.user.access)
        // console.log("req access "+ numberAccess)
        // console.log(req.user.access & numberAccess)
        if((req.user.access & numberAccess)==0){
            // console.log("YES");
            return res.status(403).send(consts.CreateError(req.error,4000011,"user doese not access"))
        }
        next();
    }
}



module.exports = accees