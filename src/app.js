const express = require('express')
require('./db/mongoose')
const personRouter = require("./routes/person")
const movementRouter = require('./routes/movment')
const visitRouter = require('./routes/visit')
const exerciseRouter = require('./routes/exercise')
const app = express();
app.use(express.json())
app.use("/upload",express.static(__dirname+"/upload"))
app.use(personRouter)
app.use(movementRouter)
app.use(visitRouter)
app.use(exerciseRouter)


module.exports = app 