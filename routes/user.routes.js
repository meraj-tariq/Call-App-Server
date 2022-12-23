var cors = require('cors')
module.exports = app => {

    const userRoutes = require('../controllers/user.controller');
    var router = require('express').Router();

    //Create a new user
    router.post("/create", cors(), userRoutes.create);

    //Login user 
    router.post("/login", cors(), userRoutes.loginUser);
    router.post("/logout", cors(), userRoutes.logOut); 

    // Retrieve all user
    router.get("/getAllUser", userRoutes.findAll);

    // Update User status by id
    router.post("/updateStatus", userRoutes.updateStatus);

    // Delete a user with id
    router.delete("/deleteUser?:id", userRoutes.delete);


    // Retrieve all published user
    router.get("/published", userRoutes.findAllPublished);

    // Retrieve a single user with id
    router.get("/:id", userRoutes.findOne);

    // Update a user with id
    router.put("/:id", userRoutes.update);

    // Delete all user
    router.delete("/", userRoutes.deleteAll);
    app.use('/api/user', router);

}