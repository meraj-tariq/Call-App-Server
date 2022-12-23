// const { sequelize, Sequelize } = require(".");

module.exports = (sequelize, Sequelize) => {
    const USER = sequelize.define("User", {
        user_id: {
            type: Sequelize.STRING
        },
        first_name: {
            type: Sequelize.STRING
        },
        last_name: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        user_type: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.STRING
            // allowNull defaults to true
        }
    })
    return USER
};