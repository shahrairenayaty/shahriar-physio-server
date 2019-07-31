const assert = require("assert");
const Address = require("../../models/address");
const Number = require("../../models/number");

describe("Testing Address modeld",()=>{
  xit("save address",(done)=>{
    const address = new Address({
      mainStreet:"صیاد شیرازی",
      koche:"صیاد شیرازی 8",
      pelak:17,
      vahed:4
    });
    address.save()
      .then((add)=>{
        console.log(add);
        assert(!address.isNew)
        done();
      })
      .catch((err)=>{
        console.log("error name: "+err.name+"\n"+
                    "message: "+err.message);
        done();
      });
  });

  xit("save number",(done)=>{
    const number = new Number({
      title:"خانه",
      mainNumber:"09037693614"
    });
    number.save()
      .then((add)=>{
        console.log(add);
        assert(!number.isNew)
        done()
      })
      .catch((err)=>{
        console.log("error name: "+err.name+"\n"+
                    "message: "+err.message);
        done();
      });
  });
})
