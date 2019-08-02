const mongoose = require("mongoose");

before(done=>{
  mongoose.connect("mongodb+srv://shahriar:Shahriar1376@test-rb6ed.mongodb.net/test?retryWrites=true",{ useNewUrlParser: true });
  mongoose.connection
    .once("open",()=>done())
    .on("error",(error)=>{
      console.log("WARNING:",error);
    });
});
/*
beforeEach(done=>{
  const {addresses,numbers} = mongoose.connection.collections;
  //addresses.drop()
  //numbers.drop()
    .then(()=>done())
    .catch(()=>done());
})
*/

beforeEach(done=>{
  const {movements,exercises} = mongoose.connection.collections;
  Promise.all([
    //movements.drop()
    //exercises.drop()
  ])
    .then(()=>done())
    .catch(()=>done());
});
  const {physios,patients,visits} = mongoose.connection.collections;
  beforeEach(done=>{
  Promise.all([
    //physios.drop(),
    //patients.drop(),
    //visits.drop()
  ])
    .then(()=>done())
    .catch(()=>done());
})
