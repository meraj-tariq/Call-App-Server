

const db = require('../models');
const fs = require('fs');
const Recordings = db.Recordings
const seq = db.sequelize
const Op = db.Sequelize.Op;
const paths = require('path');
const { glob } = require('glob');
var tar1 = require('tar-fs')
var ffmpeg = require('fluent-ffmpeg');
const fsPromises = require('fs/promises');
const { default: axios } = require('axios');
const xml2js = require('xml2js');
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');


async function ParseStringFunction(docBody) {
    // const parser = new XMLParser();
    // const leadsData = await parser.parse(docBody, {
    //     attrPrefix: '_',
    //     textNodeName: '__',
    //     ignoreNonTextNodeAttr: false,
    //     ignoreTextNodeAttr: false,
    //     ignoreNameSpace: false,
    // })
    const leadsData = await xml2js.parseStringPromise(docBody, { mergeAttrs: true, explicitArray: false })
    const json = JSON.stringify(leadsData, null, 4);
    const parseObjectData = JSON.parse(json)["recording"];

    return parseObjectData
}

async function ReadFilePath(path) {
    const data = await fsPromises.readFile(path, { encoding: 'utf8' });
    return data
}

exports.create = (req, res) => {
    //Validate request 
    // console.log("REQUEST BODY", req.body);

    // if (!Object.values(req.body).every(field => field.length > 0)) {
    //     res.status(400).send({
    //         message: "Content can not be Empty!"
    //     });
    //     return;
    // }
    const user_data = req.body
    // seq.query
    // // Save User in the Database
    Recordings.bulkCreate(user_data,
        {
            individualHooks: true,
            validate: true,
            // fields: ['id', 'core_callingparty', 'core_calledparty', 'inum', 'agentLoginId', 'agentname', 'starttime', 'endtime', 'filename', 'core_callid', 'core_globalcallid', 'duration', 'core_calldirection', 'createdAt', 'updatedAt'],
            // updateOnDuplicate : true,
            // updateOnDuplicate: true,
            // ignoreDuplicates: true
        }).then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occured while creating the recording." })
        })
};

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

exports.findAll = (req, res) => {
    const { Page, PageSize, q, inum, sdt, edt } = req.query
    console.log("***************************", sdt, edt);
    const page = Number(Page)
    const pageSize = Number(PageSize)

    Recordings.findAndCountAll(
        paginate(
            {
                //select * from tablename where core_c
                where: {
                    [Op.or]: [{
                        core_callid: {
                            [Op.like]: q !== "" ? `%${q}%` : null
                        }
                    },
                    {
                        inum: {
                            [Op.like]: inum !== "" ? `%${inum}%` : null
                        }
                    },
                    {
                        starttime: sdt !== "" ? { [Op.between]: [sdt, edt] } : null,
                    }],

                    // starttime: {
                    //     [Op.between]: ["2021-12-20T13:52:00.000", "2021-12-20T13:52:59.000"]
                    //   }
                    // [Op.or]: {
                    //     starttime: sdt !== "" ? { [Op.between]: [sdt, edt] } : null,
                    //     starttime: sdt !== "" ? { [Op.gte]: sdt } : null,
                    // }



                }, // conditions
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

// exports.findAll = (req, res) => {
//     const { Page, PageSize, q } = req.query
//     const page = Number(Page)
//     const pageSize = Number(PageSize)

//     Recordings.findAndCountAll(
//         paginate(
//             {
//                 where: {
//                     inum: {
//                         [Op.like]: `%${q}%`
//                     }
//                 }, // conditions
//             },
//             { page, pageSize },
//         ),
//     ).
//         then(data => {
//             const response = getPagingData(data, page, PageSize);
//             res.send(response);
//             console.log(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message:
//                     err.message || "Some error occurred while retrieving user."
//             });
//         });
// };


//************************************ Working play api service ******************************* */

exports.PlayAudioFile = async (req, res) => {
    const { path: streamPath, inum, tempPath } = req.query
    try {
        console.log("check Value inum", inum, "check Value streamPath: ", streamPath, "check Value tempPath:", tempPath);
        console.log("path", streamPath);
        const path_folder = paths.join('../../StreamWavFile');

        if (!fs.existsSync(streamPath)) {
            console.log("exists:", path_folder);
            ffmpeg(tempPath)
                .inputFormat('wav')
                .audioCodec('pcm_s16le')
                .format('wav')
                .save(streamPath).on('progress', function (progress) {
                    console.log('Processing: ' + progress.percent + '% done');
                }).on('end', function () {
                    console.log('Finished processing');
                    res.set("content-type", "audio/wav");
                    res.set("accept-ranges", "bytes");
                    res.set("content-length", fs.statSync(streamPath).size)
                    fs.createReadStream(streamPath).on("error", (err) => {
                        console.log(err);
                        res.status(400).json({ message: "Couldn't read file" })
                    }).on("data", (chunk) => {
                        res.write(chunk);
                    }).on("end", () => {
                        res.end();
                    })
                })
            console.log("call every time");
        } else {
            console.log("Not exists:", path_folder);

            res.set("content-type", "audio/mp3");
            res.set("accept-ranges", "bytes");
            res.set("content-length", fs.statSync(streamPath).size)
            fs.createReadStream(streamPath).on("error", (err) => {
                console.log(err);
                res.status(400).json({ message: "Couldn't read file" })
            }).on("data", (chunk) => {
                res.write(chunk);
            }).on("end", () => {
                res.end();
            })

        }

    } catch (e) {
        console.log(`Error: ${e}`)
    }
}

//************************************ Working play api service ******************************* */

exports.FindTarFiles = async (req, res) => {
    try {
        const { path } = req.body
        console.log(path)
        glob(`${path}/**/*.tar`, async (err, files_path) => {
            if (err) {
                console.log(err, "********");
            } else {
                // a list of paths to javaScript files_path in the current working directory
                // console.log("UntarTarFiles l", files_path);
                // if (files_path.length > 0) {
                //     var target = '../../tempUntarFiles';
                //     for (var i = 0; i < files_path.length; i++) {
                //         fs.createReadStream(files_path[i]).pipe(tar1.extract(target));
                //     }
                // }
                if (files_path.length !== 0) {
                    const arr = []
                    files_path.map(item => {
                        arr.push({ path: item, progress: false, UploadStatus: false })
                    })
                    res.json({
                        message: "All Tar files untar into temp folder.",
                        data: files_path.length ? arr : null,
                        error: false
                    })
                } else {
                    res.json({
                        message: "No Tar Files Found",
                        data: null,
                        error: true
                    })
                }
            }
        });
    } catch (e) {
        console.log(`Error: ${e}`)
    }
}

const getFilename = function (str) {
    return str?.substring(str.lastIndexOf('/') + 1);
}

exports.UntarSingleFiles = async (req, res) => {
    try {


        const { path } = req.body
        console.log(path, "Request body ppath")
        var fileName = getFilename(path);
        console.log("FileName:", fileName.split(".")[0]);

        // a list of paths to javaScript files_path in the current working directory

        if (path) {
            var target = `../../tempUntarFiles222/${fileName.split(".")[0]}`; // ***audio file placed path***
            if (fs.existsSync(target)) {
                console.log('Directory exists!')
                res.json({
                    path: path,
                    filename: fileName,
                    message: "Already Uploaded.",
                    fileLength: fs.statSync(target).isDirectory() && Math.round(fs.readdirSync(target).length / 2)
                })
            } else {
                var readStream = fs.createReadStream(path);
                readStream.pipe(tar1.extract(target))
                readStream.on('error', function (err) {
                    console.log("***ERROR****", err);
                });

                readStream.on('close', function () {
                    glob(`${target}/*.xml`, async (err, files_path) => {
                        if (err) {
                            console.log(err);
                            // res.end();
                            // res.json({
                            //     path: path,
                            //     filename: fileName,
                            //     message: "Successfully complete process.",
                            //     fileLength: fs.statSync(target).isDirectory() && Math.round(fs.readdirSync(target).length / 2)
                            // })
                        } else {
                            console.log("LoadDataIntoDB", files_path.length);
                            var arr = [];
                            if (files_path.length > 0) {
                                for (var i = 0; i < files_path.length; i++) {
                                    const data = await ReadFilePath(files_path[i])
                                    const parsedData = await ParseStringFunction(data)
                                    const getAgentName = parsedData?.cti?.contact?.sessions?.session?.filter(item => {
                                        if (item?.agentname !== '') {
                                            return item?.agentname
                                        }
                                    })
                                    const getAgentId = parsedData?.cti?.contact?.sessions?.session?.filter(item => {
                                        if (item?.agentloginid !== '') {
                                            return item?.agentloginid
                                        }
                                    })
                                    var date1 = new Date(parsedData?.starttime?.split('.')[0]);
                                    var date2 = new Date(parsedData?.endtime?.split('.')[0]);
                                    var ElapsedSeconds = (date2 - date1) / 1000;
                                    const data_obj = {
                                        "core_callingparty": parsedData?.cti?.contact?.core_callingparty,
                                        "core_calledparty": parsedData?.cti?.contact?.core_calledparty,
                                        "inum": parsedData?.inum,
                                        "starttime": parsedData?.starttime,
                                        "endtime": parsedData?.endtime,
                                        "filename": parsedData?.filename,
                                        "core_callid": parsedData?.cti?.callid?.id,
                                        "core_globalcallid": parsedData?.cti?.tags?.core_globalcallid,
                                        "duration": ElapsedSeconds,
                                        "core_calldirection": parsedData?.cti?.tags?.core_calldirection,
                                        "agentname": getAgentName !== undefined && getAgentName[0]?.agentname,
                                        "agentLoginId": getAgentId !== undefined && getAgentId[0]?.agentloginid,
                                        "path": `../../StreamWavFile/${parsedData?.inum}.wav`,
                                        "tempPath": `../../tempUntarFiles/${parsedData?.inum}.wav`,
                                        "tarPath": '../../../FBL tar Files',
                                        "newPath": `../../tempUntarFiles222/${fileName.split(".")[0]}/${parsedData?.inum}.wav`
                                        // parties: "",
                                    };
                                    arr.push(data_obj);
                                }

                                if (arr.length > 0) {
                                    await axios({
                                        method: 'post',
                                        url: 'http://localhost:8080/api/recordings/create',
                                        // headers:{}
                                        data: arr,
                                        maxContentLength: "infinity", // <- for large content, base64
                                        maxBodyLength: "infinity",  //<- do the same above
                                    }).then(function (response) {
                                        // console.log(response, "RESPONCE**********");
                                        res.json({
                                            path: path,
                                            filename: fileName,
                                            message: "Uploaded.",
                                            fileLength: fs.statSync(target).isDirectory() && Math.round(fs.readdirSync(target).length / 2)
                                        })

                                    }).catch(function (error) {
                                        console.log({ error });
                                        res.status(500).json({ error: 'Something went wrong' });
                                        // res.json({
                                        //     path: path,
                                        //     filename: fileName,
                                        //     message: "Already added in database.",
                                        //     fileLength: fs.statSync(target).isDirectory() && Math.round(fs.readdirSync(target).length / 2)
                                        // })
                                    });
                                }
                            } else {
                                res.send({
                                    message: "File Not Found!",
                                });
                            }
                        }
                    })

                });
            }
        }

    } catch (e) {
        console.log(`Error: ${e}`)
    }
}


// exports.DeleteTempTarFiles = async (req, res) => {
//     try {
//         var folder = '../../tempUntarFiles/';
//         fs.readdir(folder, (err, files) => {
//             if (err) throw err;
//             if (files.length > 0) {

//                 for (const file of files) {
//                     fs.unlink(folder + file, function (err) {
//                         if (err && err.code == 'ENOENT') {
//                             // file doens't exist
//                             console.log("File doesn't exist, won't remove it.");
//                         } else if (err) {
//                             // other errors, e.g. maybe we don't have enough permission
//                             console.log("Error occurred while trying to remove file");
//                         } else {
//                             console.log(`removed`);
//                             console.log(file + ' : File Deleted Successfully.');
//                         }
//                     });

//                 }
//             } else {
//                 res.json({ message: "No Data Found." })
//             }
//         });
//     } catch (e) {
//         console.log(`Error: ${e} `)
//     }
// }

