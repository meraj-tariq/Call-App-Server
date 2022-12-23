

const db = require('../models');
const User = db.user
const Op = db.Sequelize.Op;
const sql = require('mssql');
const fs = require('fs');

// Create and Save a new User
function createGuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
exports.create = (req, res) => {
    //Validate request 
    console.log(req.body);
    if (!Object.values(req.body).every(field => field.length > 0)) {
        res.status(400).send({
            message: "Content can not be Empty!"
        });
        return;
    }
    // Create a User 
    const user_data = {
        user_id: createGuid(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        user_type: req.body.user_type,
        status: req.body.status
    }

    // Save User in the Database
    User.create(user_data).then(data => {
        res.send(data);
    })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occured while creating the user." })
        })
};


exports.loginUser = async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email, password: req.body.password } });
    if (user) {
        const obj = {
            data: user,
            status: true,
            error: false
        }
        res.send(obj);

        var dir = `../../StreamWavFile/`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

    } else {
        res.status(404).json({
            message: "User does not exist",
            status: false,
            error: true
        });
    }
}

exports.logOut = async (req, res) => {
    const { userData } = req.body
    console.log("User login", userData);
    fs.rmdir(`../../StreamWavFile`,
        { recursive: true, force: true }, (err) => {
            if (err) {
                return console.log("error occurred in deleting directory", err);
            }
            console.log("Directory deleted successfully");
            res.send({ message: "logout successfully" });
        });
}

//Retrieve All Tutorial from the database.
const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;
    return { limit, offset };
};


const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: allData } = data;
    const currentPage = page ? page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, allData, totalPages, currentPage };
};


exports.findAll = (req, res) => {
    const { page, size, title, status, user_type } = req.query
    const condition = {
        [Op.and]: [
            {
                first_name: {
                    [Op.like]: `%${title}%`
                }
            },
            {
                status: {
                    [Op.like]: `%${status}%`
                }
            },
            {
                user_type: {
                    [Op.like]: `%${user_type}%`
                },
            }

        ]
    }
    const { limit, offset } = getPagination(page, size);
    const limitInt = Number(limit)
    User.findAndCountAll({ where: condition, limit: limitInt, offset, order: [['createdAt', 'DESC']] })
        .then(data => {
            const response = getPagingData(data, parseInt(page), limit);
            res.send(response);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving user."
            });
        });
};


// Update a User Status by id and status

exports.updateStatus = (req, res) => {
    const { user_id, status } = req.body;
    User.update({ status: status }, {
        where: { user_id: user_id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "User Status was updated successfully.",
                    user_id: user_id,
                    status: status
                });
            } else {
                res.send({
                    message: `Cannot update User with id=${user_id}. Maybe User was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating User with id=" + user_id
            });
        });
};

// Delete all Tutorials form  the database.
exports.delete = (req, res) => {
    console.log(req);
    const id = req.query.id;
    User.destroy({
        where: { user_id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "User was deleted successfully!",
                    user_id: id
                });
            } else {
                res.send({
                    message: `Cannot delete User with id=${id}. Maybe User was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete User with id=" + id
            });
        });
};


// Find a single User with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    User.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving User with id=" + id
            });
        });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    User.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Tutorial was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating User with id=" + id
            });
        });
};



// Delete all Tutorials

exports.deleteAll = (req, res) => {
    User.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} User were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all User."
            });
        });
};

// Find all published User
// Find all User with published = true:
exports.findAllPublished = (req, res) => {
    User.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving User."
            });
        });
};


