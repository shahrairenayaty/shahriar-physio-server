const consts = require('../G/consts');

const permission =  ({Physio = false,Patient= false,Assistant = false,Watcher=false})=>{

    return function(req,res,next){

        const type = req.header('type')
        
        const permission ={}
        permission[consts.Patient] = Physio
        permission[consts.Physio] = Patient
        permission[consts.Assistant] = Assistant
        permission[consts.Watcher] = Watcher

        const user = req.type
        if(permission[user]===false){
            return 
        }
    }
    


    
}