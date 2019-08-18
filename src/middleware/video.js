const multer    = require("multer");
const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./upload/videos")
  },
  filename: function(req,file,cb){
    cb(null, req.movement.name+"-"+Date.now()+'.mp4')
  }
});
const fileFilter = (req,file,cb)=>{
  //rejact file
  if(file.mimetype==="video/mp4"){
    //accsepted file
    cb(null,true);
  }else {
    cb(null,false);
  }



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