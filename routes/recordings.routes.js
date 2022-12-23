var cors = require('cors')
module.exports = app => {

    const recordingRoutes = require('../controllers/recordings.controller');

    var router = require('express').Router();

    //Create a new user

    router.post("/create", cors(), recordingRoutes.create);

    router.post("/getAllRecordings", cors(), recordingRoutes.findAll);

    router.post("/findtarFiles", cors(), recordingRoutes.FindTarFiles); // Find all tar files path

    router.post("/untarTarSingleFiles", cors(), recordingRoutes.UntarSingleFiles); // untar tar files from client path

    router.get("/", recordingRoutes.PlayAudioFile);
    
    app.use('/api/recordings', router);

}