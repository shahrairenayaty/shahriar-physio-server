const mongoose = require("mongoose");
const assert = require("assert")
const Token = require("../../models/token")

describe("testing token model",()=>{
  xit("create simple token",(done)=>{
    const token = new Token({});
    token.save()
      .then(()=>{
        done()
      })
  })
});
