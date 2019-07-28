var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');
var multer = require('multer');

async function post(req, res, next) {
    var assignment = {
        //course_name: req.body.course_name
    };
    var user = req['authUserId'];
    assignment.faculty_id = user.faculty_id;
    console.log('assignment', assignment);


    try{
      //assignment.file_name = await store_file(req, res);
      await store_file(req, res);
      assignment.file_name = req.files;
      console.log('filename', assignment.file_name);

      if(assignment.file_name){
        console.log(req.body.course_name);
        assignment.course_name =  req.body.course_name;
        course_id = await get_course_id(assignment);
        assignment.course_id = course_id.course_id;

        result_insert = await insert_assignment(assignment);
        console.log("result after assignment result", result_insert);
      }


    } catch (err){
      console.error(err);
    }
     //res.redirect('/index');
}

module.exports.post = post;

async function get_course_id(assignment){
  let connection;
  let query = 'select COURSE_ID as "course_id" '+
             'from COURSE where COURSE_NAME = :course_name';

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          course_name: assignment.course_name
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    let course_id = result.rows[0];
    return course_id;

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function store_file(req, res){
  var file_name;
  try{
    var StorageAssignment = await multer.diskStorage({
                                      destination: await function(req, file, callback) {
                                          callback(null, "./public/assignments");
                                      },
                                      filename: await function(req, file, callback) {
                                          //callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
                                          req.files = file.originalname;
                                          callback(null, file.originalname);
                                      }
                                  });

    var upload_assignment = await multer({
                                   storage: StorageAssignment
                               }).array("assignmentFileUploader", 1); //Field name and max count

    await upload_assignment(req, res, await function(err) {
         if (err) {
             return res.json({result: "Something went wrong!"});
         }
     });
      //console.log("req", req);
  } catch (err){
    console.error(err);
  }

}

async function insert_assignment(assignment){
  let connection;
  let query = 'insert into ASSIGNMENT (NAME, FACULTY_ID, COURSE_ID) '+
  'values (:file_name, :faculty_id, :course_id)';

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          file_name: assignment.file_name,
          faculty_id: assignment.faculty_id,
          course_id: assignment.course_id
      },
      {
          autoCommit: true
      },
    );
    return result;

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
