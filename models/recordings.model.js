module.exports = (sequelize, Sequelize) => {
    const Recording = sequelize.define("Recordings", {
        id: {
            type: Sequelize.INTEGER,
            // autoIncrement: true,
        },
        core_callingparty: {
            type: Sequelize.STRING,
        },
        core_calledparty: {
            type: Sequelize.STRING
        },
        inum: {
            type: Sequelize.STRING,
            // autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        agentLoginId: {
            type: Sequelize.STRING
        },
        agentname: {
            type: Sequelize.STRING
        },
        starttime: {
            type: Sequelize.STRING
        },
        endtime: {
            type: Sequelize.STRING
        },
        filename: {
            type: Sequelize.STRING
        },
        core_callid: {
            type: Sequelize.STRING
        },
        core_globalcallid: {
            type: Sequelize.STRING
        },
        duration: {
            type: Sequelize.INTEGER
            // allowNull defaults to true
        },
        core_calldirection: {
            type: Sequelize.STRING
            // allowNull defaults to true
        },
        path: {
            type: Sequelize.STRING
            // allowNull defaults to true
        },
        tarPath: {
            type: Sequelize.STRING
            // allowNull defaults to true
        },
        tempPath: {
            type: Sequelize.STRING
            // allowNull defaults to true
        },
        newPath: {
            type: Sequelize.STRING
            // allowNull defaults to true
        },
    })
    return Recording
};