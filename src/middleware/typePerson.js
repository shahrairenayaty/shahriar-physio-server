const consts = require('../G/consts');
const type = (req, res, next) => {
    if (!req.query.type) {
        return res.status(500).send(consts.CreateError(req.error, 4000000, "type dose not definded in url of create user"))

    }
    var type = req.query.type + ""
    type = type.toLowerCase()
    if (type === consts.Physio || type === consts.Patient || type === consts.Assistant || type === consts.Watcher||type===consts.Self) {
        req.type = req.query.type;
        switch (req.query.type) {
            case consts.Physio:
                req.access = 0b10000
                break;
            case consts.Assistant:
                req.access = 0b11000
                break;
            case consts.Patient:
                req.access = 0b11100
                break;
            case consts.Watcher:
                req.access = 0b11110
                break;
            default:
                break;
        }
        next();
    } else {
        res.status(500).send(consts.CreateError(req.error, 4000001, "type definded in url of create user is wrong"))
    }

}

module.exports = type;