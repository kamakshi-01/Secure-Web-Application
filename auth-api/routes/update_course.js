var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

async function post(req, res, next) {
    var course = {
        name: req.body.c_name,
        new_name: req.body.c_new_name,
        description: req.body.c_description,
        semester: req.body.sem,
        dept_name: req.body.dep_name,
        fac_full_name: req.body.fac_name
    };

    if(course.fac_full_name){
      var fac_name = course.fac_full_name;
      var fac_name_split = fac_name.split(" ");
      course.fac_fname = fac_name_split[0],
      course.fac_lname = fac_name_split[1]
    }

    for (var key in course) {
      if (course.hasOwnProperty(key)) {
        course[key] = esapiEncoder.encodeForHTML(course[key]);
        //console.log(course[key]);
      }
    }

    var user = req['authUserId'];

    if(user.role == "ADMIN"){
      try{
        course_id = await get_course_id(course);

        course.course_id = course_id.course_id;

        if(course.new_name){
          update_name_result = await update_course_name(course);
          console.log("after update course name",update_name_result);
        }

        if(course.description){
          update_desc_result = await update_course_description(course);
          console.log("after update course description",update_desc_result);
        }

        if(course.semester){
          update_sem_result = await update_course_semester(course);
          console.log("after update course semester",update_sem_result);
        }

        if(course.dept_name){
          department_id = await get_department_id(course);
          course.department_id = department_id.department_id;

          update_dep_result = await update_course_department(course);
          console.log("after update course department",update_dep_result);
        }

        if(course.fac_full_name){
          faculty_id = await get_faculty_id(course);
          course.faculty_id = faculty_id.faculty_id;

          update_fac_result = await update_course_faculty(course);
          console.log("after update course faculty",update_fac_result);
        }
        res.json({ message: 'Successfully updated the course!'});
        //res.redirect('/index');
      } catch (err){
        res.json({ message: 'There was some issue while adding :(' });
        console.error(err);
      }
    }
}

module.exports.post = post;

async function get_course_id(course){
  var query = '';
  query = 'select COURSE_ID as "course_id" from COURSE where COURSE_NAME = :old_name';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          old_name: course.name,
      },
      {
          outFormat: oracledb.OBJECT
      },
    );

    return result.rows[0];

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

async function update_course_name(course){
  var query = '';
  query = 'update COURSE set COURSE_NAME = :new_name where COURSE_ID = :course_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          new_name: course.new_name,
          course_id: course.course_id,
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

async function update_course_description(course){
  var query = '';
  query = 'update COURSE set DESCRIPTION = :description where COURSE_ID = :course_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          description: course.description,
          course_id: course.course_id,
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

async function update_course_semester(course){
  var query = '';
  query = 'update COURSE set SEMESTER = :semester where COURSE_ID = :course_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          semester: course.semester,
          course_id: course.course_id,
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

async function update_course_department(course){
  var query = '';
  query = 'update COURSE set DEPARTMENT_ID = :dept_id where COURSE_ID = :course_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          dept_id: course.department_id,
          course_id: course.course_id,
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

async function update_course_faculty(course){
  var query = '';
  query = 'update COURSE set FACULTY_ID = :faculty_id where COURSE_ID = :course_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          faculty_id: course.faculty_id,
          course_id: course.course_id,
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
