const multer    = require("multer");
const path = require('path')

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./upload/voices")
  }
  ,
  filename: function(req,file,cb){
    cb(null, req.exerciseDatabase._id+"-"+Date.now()+path.extname(file.originalname))
  }
});
const fileFilter = (req,file,cb)=>{
    if (!file.originalname.match(/\.(mp3|wav)$/)) {
        return cb(new Error('Please upload an mp3'))
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