const express = require("express");
const cors = require("cors");
const app = express();
var bodyParser = require('body-parser');

var corsOptions = {
    origin: '*',

    methods: [
        'GET',
        'POST',
        'DELETE'
    ],

    allowedHeaders: [
        'Content-Type',
    ],
}

app.use(cors(corsOptions))

app.use(bodyParser.json({
    limit: '200mb'
}));

app.use(bodyParser.urlencoded({
    limit: '200mb',
    parameterLimit: 1000,
    extended: true
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const db = require('./models/');
db.sequelize.sync();

app.get("/", (req, res) => {
    res.json({ message: "Welcome to audio application." })
})

require("./routes/user.routes")(app)
require("./routes/recordings.routes")(app)
require("./routes/logs.routes")(app)

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})