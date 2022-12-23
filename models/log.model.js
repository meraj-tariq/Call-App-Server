// const { sequelize, Sequelize } = require(".");

module.exports = (sequelize, Sequelize) => {
    const logsActivity = sequelize.define("logsActivity", {
        message: {
            type: Sequelize.TEXT
        },
        logType: {
            type: Sequelize.TEXT
        },
        user:{
            type: Sequelize.TEXT
        }
    })
    return logsActivity
};