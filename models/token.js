const mongoose = require("mongoose")
const crypto = require("crypto")
const Schema = mongoose.Schema

const TokenSchema = new Schema({
  expirationDate:{
    start:{
      type:Date,
      default:Date.now
    },
    end:{
      type:Date,
      default:function() {
          const start= this.expirationDate.start.getTime()
          return new Date(start+86400000*5)
      }
    }
  },
  refreshToken:{
    type:String,
    default: function() {
        return crypto.randomBytes(20).toString('hex')
    }
  },
  mainToken:{
    type:String,
    default: function() {
        return crypto.randomBytes(20).toString('hex')
    }
  }
});

const Token = mongoose.model("token",TokenSchema)
//module.exports = Token

module.exports = TokenSchema
