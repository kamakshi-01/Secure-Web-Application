var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');


const cookieParser = require('cookie-parser');


async function get(req, res, next) {
    var user = req['authUserId'];
    let query;
    let courses;

    if(user.role == 'STUDENT'){
      query = 'select COURSE_NAME as "course_name", DESCRIPTION as "description", '+
      'SEMESTER as "semester", DEPARTMENT_ID as "department_id", '+
      'FACULTY_ID as "faculty_id" from COURSE where department_id = :department_id AND semester = :semester';

      try{
        courses = await get_student_courses(user, query);
      } catch (err){
        console.error(err);
      }
      console.log(courses);
      res.json({courses: courses});
    }

    if(user.role == 'FACULTY'){
      query = 'select COURSE_NAME as "course_name", DESCRIPTION as "description", '+
      'SEMESTER as "semester", DEPARTMENT_ID as "department_id", '+
      'FACULTY_ID as "faculty_id" from COURSE where department_id = :department_id AND faculty_id = :faculty_id';
      try{
        courses = await get_faculty_courses(user, query);
      } catch (err){
        console.error(err);
      }
      //console.log(courses);
      res.json({courses: courses});
    }

    if(user.role == 'ADMIN'){
      query = 'select COURSE_NAME as "course_name" from COURSE';
      try{
        courses = await get_all_courses(query);
      } catch (err){
        console.error(err);
      }
      //console.log(courses);
      res.json({courses: courses});
    }
}

module.exports.get = get;

async function get_student_courses(user, query){
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          department_id: user.department_id,
          semester: user.semester
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let courses = result.rows;
    return courses;

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

async function get_faculty_courses(user, query){
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          department_id: user.department_id,
          faculty_id: user.faculty_id
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let courses = result.rows;
    return courses;

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

async function get_all_courses(query){
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let courses = result.rows;
    return courses;

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
