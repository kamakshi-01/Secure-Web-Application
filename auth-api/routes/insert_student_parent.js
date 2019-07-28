var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

async function post(req, res, next) {

  //esapiEncoder.encodeForHTML(input_username);

    var student = {
        fname: req.body.s_fname,
        lname: req.body.s_lname,
        username: req.body.s_username,
        dob: req.body.s_dob,
        phone: req.body.s_phone,
        doj: req.body.s_doj,
        dept_name: req.body.s_dep_name,
        semester: req.body.s_semester
    };

    for (var key in student) {
      if (student.hasOwnProperty(key)) {
        student[key] = esapiEncoder.encodeForHTML(student[key]);
        //console.log(student[key]);
      }
    }

    var parent = {
        fname: req.body.p_fname,
        lname: req.body.p_lname,
        username: req.body.p_username,
        dob: req.body.p_dob,
        phone: req.body.p_phone
    };

    for (var key in parent) {
      if (parent.hasOwnProperty(key)) {
        parent[key] = esapiEncoder.encodeForHTML(parent[key]);
      }
    }

    var user = req['authUserId'];

    try{
      if(user.role == "ADMIN"){
        let salt = await bcrypt.genSalt(10);
        let s_password = await bcrypt.hash(req.body.s_password, salt);
        let s_confirm_pwd = await bcrypt.hash(req.body.s_confirm_pwd, salt);

        let p_password = await bcrypt.hash(req.body.p_password, salt);
        let p_confirm_pwd = await bcrypt.hash(req.body.p_confirm_pwd, salt);

        if((s_password == s_confirm_pwd) && (p_password == p_confirm_pwd)){
          student.password = s_password;
          parent.password = p_password;

          department_id = await get_department_id(student);
          student.department_id = department_id.department_id;

          insert_parent_result = await insert_parent(parent);
          console.log("after insert parent",insert_parent_result);

          student.parent_id = insert_parent_result.outBinds.rid[0];

          insert_student_result = await insert_student(student);
          console.log("after insert student",insert_student_result);

          res.json({ message: 'Successfully added the student and the parent!'});
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

async function get_department_id(student){
  var query_dept = '';
  query_dept = 'select DEPARTMENT_ID as "department_id" from DEPARTMENT where DEPARTMENT_NAME = :department_name';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query_dept,
      {
          department_name: student.dept_name
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

async function insert_parent(parent){
  var query = '';
  query = 'insert into PARENT (USERNAME, PASSWORD, FNAME, LNAME, DOB, PHONE_NO) '+
  'values (:username, :password, :fname, :lname, TO_DATE(:dob, \'YYYY-MM-DD\'), :phone) '+
  'returning PARENT_ID, USERNAME '+
  'into :rid, :rusername' ;
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
        username: parent.username,
        password: parent.password,
        fname: parent.fname,
        lname: parent.lname,
        dob: parent.dob,
        phone: parent.phone,
        rid: {
            type: oracledb.NUMBER,
            dir: oracledb.BIND_OUT
        },
        rusername: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT
        }
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

async function insert_student(student){
  var query = '';
  query = 'insert into STUDENT (FNAME, LNAME, USERNAME, PASSWORD, DOB, '+
  'PARENT_ID, PHONE, DATE_OF_JOIN, DEPARTMENT_ID, SEMESTER) '+
  'values (:fname, :lname, :username, :password,  TO_DATE(:dob, \'YYYY-MM-DD\'), :parent_id, '+
  ':phone, TO_DATE(:doj, \'YYYY-MM-DD\'), :department_id, :semester) ';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
        fname: student.fname,
        lname: student.lname,
        username: student.username,
        password: student.password,
        dob: student.dob,
        parent_id: student.parent_id,
        phone: student.phone,
        doj: student.doj,
        department_id: student.department_id,
        semester: student.semester
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
