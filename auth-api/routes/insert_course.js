var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

async function post(req, res, next) {
    var fac_name = req.body.fac_name;
    var fac_name_split = fac_name.split(" ");
    var course = {
        course_name: req.body.c_name,
        description: req.body.c_description,
        semester: req.body.semester,
        dept_name: req.body.dep_name,
        fac_fname: fac_name_split[0],
        fac_lname: fac_name_split[1]
    };

    for (var key in course) {
      if (course.hasOwnProperty(key)) {
        course[key] = esapiEncoder.encodeForHTML(course[key]);
        //console.log(course[key]);
      }
    }

    var user = req['authUserId'];

    try{
      var checkCourse = await check_course(course);

      if(checkCourse){
        res.json({message: "Course already exists!"});
      }else{

        if(user.role == "ADMIN"){
          try{
            department_id = await get_department_id(course);
            faculty_id = await get_faculty_id(course);

            course.department_id = department_id.department_id;
            course.faculty_id = faculty_id.faculty_id;

            console.log(course);

            insert_result = await insert_course(course);
            console.log("after insert course",insert_result);
            res.json({ message: 'Successfully added the course!'});
            //res.redirect('/index');
          } catch (err){
            res.json({ message: 'There was some issue while adding :(' });
            console.error(err);
          }
        }
    }
    } catch (err){
      console.error(err);
    }
}

module.exports.post = post;

async function check_course(course){
  var query = '';
  query = 'select COURSE_NAME as "course_name" from COURSE where course_name = :course_name';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          course_name: course.course_name
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let course_name = result.rows[0];
    return course_name;

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

async function get_department_id(course){
  var query_dept = '';
  query_dept = 'select DEPARTMENT_ID as "department_id" from DEPARTMENT where DEPARTMENT_NAME = :department_name';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query_dept,
      {
          department_name: course.dept_name
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

async function get_faculty_id(course){
  var query_fac = '';
  query_fac = 'select FACULTY_ID as "faculty_id" from FACULTY where FNAME = :fname AND LNAME = :lname';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query_fac,
      {
          fname: course.fac_fname,
          lname: course.fac_lname,
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let faculty_id = result.rows[0];
    return faculty_id;

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



async function insert_course(course){
  var query = '';
  query = 'insert into COURSE (COURSE_NAME, DESCRIPTION, SEMESTER, DEPARTMENT_ID, FACULTY_ID) '+
  'values (:course_name, :description, :semester, :department_id, :faculty_id)';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          course_name: course.course_name,
          description: course.description,
          semester: course.semester,
          department_id: course.department_id,
          faculty_id: course.faculty_id,
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
