var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

async function post(req, res, next) {

    var faculty = {
        fname: req.body.f_fname,
        lname: req.body.f_lname,
        username: req.body.f_username,
        phone: req.body.f_phone,
        dept_name: req.body.f_dep_name
    };
    for (var key in faculty) {
      if (faculty.hasOwnProperty(key)) {
        faculty[key] = esapiEncoder.encodeForHTML(faculty[key]);
        //console.log(faculty[key]);
      }
    }

    var user = req['authUserId'];

    try{
      if(user.role == "ADMIN"){
        let salt = await bcrypt.genSalt(10);
        let f_password = await bcrypt.hash(req.body.f_password, salt);
        let f_confirm_pwd = await bcrypt.hash(req.body.f_confirm_pwd, salt);

        if(f_password == f_confirm_pwd){
          faculty.password = f_password;

          department_id = await get_department_id(faculty);
          faculty.department_id = department_id.department_id;

          insert_faculty_result = await insert_faculty(faculty);
          console.log("after insert faculty",insert_faculty_result);

          res.json({ message: 'Successfully added the faculty!'});
          //res.redirect('/index');
        }else{
          res.json({message: "Passwords don't match. Please try again."});
        }
      }
    } catch (err){
      res.json({err: err});
      console.error(err);
    }



}

module.exports.post = post;

async function get_department_id(faculty){
  var query_dept = '';
  query_dept = 'select DEPARTMENT_ID as "department_id" from DEPARTMENT where DEPARTMENT_NAME = :department_name';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query_dept,
      {
          department_name: faculty.dept_name
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let department_id = result.rows[0];
    return department_id;

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


async function insert_faculty(faculty){
  var query = '';
  query = 'insert into FACULTY (FNAME, LNAME, USERNAME, PASSWORD, '+
  'DEPARTMENT_ID, PHONE_NO) '+
  'values (:fname, :lname, :username, :password, :department_id, :phone) ';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
        fname: faculty.fname,
        lname: faculty.lname,
        username: faculty.username,
        password: faculty.password,
        department_id: faculty.department_id,
        phone: faculty.phone,
      },
      {
          autoCommit: true
      },
    );

    console.log(result);
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
