var clc = require('cli-color');
class MyLog {
  constructor(totalLength){
    this.totalLength = totalLength;
  }
  startLog(message,repeat){
    let rightMessage = "";
    let leftMessage = "";
    const messageLength=message.length
    const eachSideLength = Math.floor((this.totalLength-messageLength)/2);
    const leftSideLength = eachSideLength;
    let rightSideLength=0
    // console.log("total= "+this.totalLength);
    // console.log("message Length= "+messageLength);
    // console.log("leftSideLength= "+leftSideLength);
    if ((this.totalLength-messageLength)%2==0)  {rightSideLength = eachSideLength;} else  {rightSideLength = eachSideLength+1;}
    // console.log("rightSideLength ="+rightSideLength);
    for (var i = 0; i < leftSideLength; i++) {
      leftMessage+=repeat;
    }
    for (var i = 0; i < rightSideLength; i++) {
      rightMessage+= repeat;
    }
    return console.log(clc.magentaBright.bgMagentaBright(leftMessage)+clc.whiteBright.bgMagentaBright(message)+clc.magentaBright.bgMagentaBright(rightMessage));
  }
  endLog(message,repeat){
    let rightMessage = "";
    let leftMessage = "";
    const messageLength=message.length
    const eachSideLength = Math.floor((this.totalLength-messageLength)/2);
    const leftSideLength = eachSideLength;
    let rightSideLength=0
    // console.log("total= "+this.totalLength);
    // console.log("message Length= "+messageLength);
    // console.log("leftSideLength= "+leftSideLength);
    if ((this.totalLength-messageLength)%2==0)  {rightSideLength = eachSideLength;} else  {rightSideLength = eachSideLength+1;}
    // console.log("rightSideLength ="+rightSideLength);
    for (var i = 0; i < leftSideLength; i++) {
      leftMessage+=repeat;
    }
    for (var i = 0; i < rightSideLength; i++) {
      rightMessage+= repeat;
    }
    return console.log(clc.greenBright.bgGreenBright(leftMessage)+clc.whiteBright.bgGreenBright(message)+clc.greenBright.bgGreenBright(rightMessage)+"\n");
  }
  endErrorLog(message){
    let rightMessage = "";
    let leftMessage = "";
    const messageLength=message.length
    const eachSideLength = Math.floor((this.totalLength-messageLength)/2);
    const leftSideLength = eachSideLength;
    let rightSideLength=0
    // console.log("total= "+this.totalLength);
    // console.log("message Length= "+messageLength);
    // console.log("leftSideLength= "+leftSideLength);
    if (eachSideLength%2==0)  {rightSideLength = eachSideLength;} else  {rightSideLength = eachSideLength+1;}
    // console.log("rightSideLength ="+rightSideLength);
    for (var i = 0; i < leftSideLength; i++) {
      leftMessage+="=";
    }
    for (var i = 0; i < rightSideLength; i++) {
      rightMessage+= "=";
    }
    return console.log(clc.redBright.bgRedBright(leftMessage)+clc.whiteBright.bgRedBright(message)+clc.redBright.bgRedBright(rightMessage)+"\n");
  }
}
module.exports = MyLog;
// const myLog = new MyLog(60);
// myLog.startLog("hello, World!","=")
// myLog.startLog("goood boy gitlcs","=")
// myLog.endLog("goodBoy, world!","=")
