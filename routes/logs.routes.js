var cors = require('cors')
module.exports = app => {

    const LogActivityRoutes = require('../controllers/log.controller');

    var router = require('express').Router();

    //Create a new user

    router.post("/add", cors(), LogActivityRoutes.saveRequestDataToDatabase);
    router.post("/getActivity", cors(), LogActivityRoutes.getAllActivityLogs);

    // router.post("/getAllRecordings", cors(), recordingRoutes.findAll);

    // router.get("/untarFiles", recordingRoutes.UntarTarFiles); //1 untar all files
    // router.get("/loadDataInToDb", recordingRoutes.LoadDataIntoDB); // 2 save data into database
    // router.get("/deleteTempTarFiles", recordingRoutes.DeleteTempTarFiles); // after delete untar data.

    // router.get("/", recordingRoutes.PlayAudioFile);

    // router.get("/RunBatFile", recordingRoutes.RunBatFile)

    app.use('/api/recordings/logs', router);

}