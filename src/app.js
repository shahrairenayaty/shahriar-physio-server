const express = require('express')
require('./db/mongoose')
const personRouter = require("./routes/person")
const movementRouter = require('./routes/movment')
const visitRouter = require('./routes/visit')
const exerciseRouter = require('./routes/exercise')
const bodyParser = require('body-parser');
const app = express();

app.use((req, res, next) => {
    console.log("new Request");
    next()
})
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use((req, res, next) => {
    // console.log(JSON.stringify(req.originalUrl,undefined,2));
    console.log(JSON.stringify(req.headers, undefined, 2));

    next()


})
// app.use("/upload",express.static(__dirname+"/upload"))
app.use(personRouter)
app.use(movementRouter)
app.use(visitRouter)
app.use(exerciseRouter)


module.exports = app