const { Op } = require('sequelize');
const db = require('../models');
const Activity = db.logsActivity

exports.saveRequestDataToDatabase = async (req, res) => {
    try {
        const { message, type, user } = req.body
        // Create a User 
        const activity = {
            message: message,
            logType: type,
            user
        }

        // Save User in the Database
        Activity.create(activity).then(data => {
            res.send(data);
            console.log(data, "**********************************************************");
        })
            .catch(err => {
                res.status(500).send({ message: err.message || "Some error occured while creating the user." })
                console.log(err.message || "Some error occured while creating the user.");

            })
    } catch (error) {
        console.log(`Error: ${error}`)
    }
}

const paginate = (query, { page, pageSize }) => {
    const offset = page * pageSize;
    const limit = pageSize;

    return {
        ...query,
        offset,
        limit,
    };
};
const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: allRecords } = data;
    const currentPage = page ? ++page : 0;
    const totalPages = Math.ceil(totalItems / limit);
    return { totalItems, allRecords, totalPages, currentPage };
};

exports.getAllActivityLogs = (req, res) => {
    const { Page, PageSize, q } = req.query
    const page = Number(Page)
    const pageSize = Number(PageSize)

    Activity.findAndCountAll(
        paginate(
            {
                where: {
                    user: {
                        [Op.like]: `%${q}%`
                    }
                }, // conditions
                order: [
                    ['createdAt', 'DESC'],
                ]
            },
            { page, pageSize },
        ),
    ).
        then(data => {
            const response = getPagingData(data, page, PageSize);
            res.send(response);
            console.log(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving user."
            });
        });
};