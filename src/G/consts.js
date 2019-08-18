const Physio = "physio"
const Patient = "patient"
const Assistant = "assistant"
const Watcher = "watcher"
const Self = 'self'


const E_somethingIsWrong_en = "some thing is wrong , please contact to support team"
const E_somethingIsWrong_ir = "مشکلی پیش آمده است  لطفا با پشتیبانی تماس بگیرید"

const CreateError = (format, id,reason, serverMessage=undefined,CMIR=E_somethingIsWrong_ir, CMEN=E_somethingIsWrong_en) => {

    if (!format) {
        format = {
            ids: [],
            customMessage: "",
            serverMessage: ""
        }
    }
    format.ids.push(id)
    format.customMessage = {
        show: {
            en: CMEN,
            ir: CMIR,
        },
        reason
    };
    if(serverMessage&&serverMessage.message){
        format.serverMessage = serverMessage.message;
    }else{
        format.serverMessage = serverMessage;
    }
    

    return format;

}

module.exports = {
    Physio,
    Patient,
    Assistant,
    Watcher,
    Self,
    CreateError,
    E_somethingIsWrong_en,
    E_somethingIsWrong_ir
}