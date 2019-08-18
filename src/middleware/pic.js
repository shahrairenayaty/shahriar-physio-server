const multer    = require("multer");
const sharp = require('sharp')
const path = require('path')

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./upload/images")
  }
  ,
  filename: function(req,file,cb){
    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
    cb(null, req.movement.name+"-"+Date.now()+path.extname(file.originalname))
  }
});
const fileFilter = (req,file,cb)=>{
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image'))
    }
    cb(undefined, true)
};
const upload    = multer({
  storage:storage,
  limits:{
    fileSize:1024*1024*8
    //8mg
  },
  fileFilter:fileFilter

});// we should make ths folder stati

module.exports = upload