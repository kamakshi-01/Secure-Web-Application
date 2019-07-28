var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

async function get(req, res, next) {

    var user = req['authUserId'];

    var user_view = user;

    delete user_view.password;

    if(user_view.role == "ADMIN"){

      try{
        delete user_view.admin_id;

        console.log("UserView ", user_view);

        res.json({user: user_view});

      } catch (err){
        console.error(err);
      }


    }

    else if(user_view.role == "FACULTY"){

      try{
        department_details = await get_department_details(user_view);

        user_view.department_name = department_details.department_name;
        user_view.department_description = department_details.department_description;

        delete user_view.department_id;
        delete user_view.faculty_id;

        //console.log("UserView ", user_view);

        res.json({user: user_view});

      } catch (err){
        console.error(err);
      }


    }

    else if(user_view.role == "PARENT"){

      try{
        student_details = await get_student_details(user_view);

        user_view.student_fname = student_details.student_fname;
        user_view.student_lname = student_details.student_lname;
        user_view.student_username = student_details.student_username;
        user_view.student_dob = student_details.student_dob;
        user_view.student_phone = student_details.student_phone;
        user_view.student_doj = student_details.student_doj;
        user_view.student_semester = student_details.student_semester;
        user_view.department_id = student_details.department_id;

        department_details = await get_department_details(user_view);

        user_view.department_name = department_details.department_name;
        user_view.department_description = department_details.department_description;

        delete user_view.department_id;
        delete user_view.parent_id;

        //console.log("UserView ", user_view);

        res.json({user: user_view});

      } catch (err){
        console.error(err);
      }


    }
    else if (user_view.role == "STUDENT"){
      delete user_view.student_id;

      try{
        parent_details = await get_parent_details(user_view);
      } catch (err){
        console.error(err);
      }

      user_view.parent_fname = parent_details.parent_fname;
      user_view.parent_lname = parent_details.parent_lname;
      user_view.parent_username = parent_details.parent_username;
      user_view.parent_dob = parent_details.parent_dob;
      user_view.parent_phone = parent_details.parent_phone;
      //console.log('user_view after parent contents ', user_view);

      try{
        department_details = await get_department_details(user_view);
      } catch (err){
        console.error(err);
      }

      user_view.department_name = department_details.department_name;
      user_view.department_description = department_details.department_description;
      //console.log('user_view after department contents ', user_view);

      delete user_view.parent_id;
      delete user_view.department_id;

      //console.log(user_view);

      res.json({user: user_view});
    }

}

module.exports.get = get;

async function get_parent_details(user_view){
  var query_parent = '';
  query_parent = 'select FNAME as "parent_fname", LNAME as "parent_lname", USERNAME as "parent_username", '+
  'DOB as "parent_dob", PHONE_NO as "parent_phone" from PARENT where PARENT_ID = :parent_id';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query_parent,
      {
          parent_id: user_view.parent_id
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let parent_details = result.rows[0];
    return parent_details;

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

async function get_student_details(user_view){
  var query = '';
  query = 'select FNAME as "student_fname", LNAME as "student_lname", USERNAME as "student_username", '+
  'DOB as "student_dob", PHONE as "student_phone", '+
  'DATE_OF_JOIN as "student_doj", DEPARTMENT_ID as "department_id", SEMESTER as "student_semester" '+
  'from STUDENT where PARENT_ID = :parent_id';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          parent_id: user_view.parent_id
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let student_details = result.rows[0];
    return student_details;

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

async function get_department_details(user_view){
  var query_department = '';
  query_department = 'select DEPARTMENT_NAME as "department_name", '+
  'DESCRIPTION as "department_description" from DEPARTMENT where DEPARTMENT_ID = :department_id';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query_department,
      {
          department_id: user_view.department_id
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let department_details = result.rows[0];
    return department_details;

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
