const mongoose = require ("mongoose");
const Schema = mongoose.Schema;

const NumberSchema = new Schema({
  title:{
    type:String,
    enum:["خانه","مطب","موبایل"],
    required:[true,"حتما باید نوع شماره مشخص باشد."]
  },
  mainNumber:{
    type:String,
    required:[true,"حتما باید این فیلد را پر کنید"],
    //description:{"شماره مویل را به صورت 09..و شماره خانه و مطب را با پیش شماره شهر وارد نمایید."}
    //description:{"hello"}
  }
});
function NumberValidator(num){
  switch (this.type) {
    case ("خونه"||"مطب"):
      break;
    default:

  }
}
module.exports = NumberSchema
// const Number = mongoose.model("number",NumberSchema);
// module.exports = Number;
