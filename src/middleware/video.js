const multer    = require("multer");
const path = require('path')

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./upload/videos")
  }
  ,
  filename: function(req,file,cb){
    cb(null, req.movement.name+"-"+Date.now()+path.extname(file.originalname))
  }
});
const fileFilter = (req,file,cb)=>{
  if (!file.originalname.match(/\.(mp4)$/)) {
    return cb(new Error('Please upload an mp4'))
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