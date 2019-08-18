const consts = require('../G/consts');

const checkAccess = (req,res,next)=>{
    // console.log("user accees "+req.user.access)
    // console.log("req access "+ req.access)
    // console.log(req.user.access & req.access)
    if((req.user.access & req.access)==0){
        // console.log("YES");
        return res.status(403).send(consts.CreateError(req.error,4000011,"user doese not access"))
    }
    next();
}

module.exports = checkAccess