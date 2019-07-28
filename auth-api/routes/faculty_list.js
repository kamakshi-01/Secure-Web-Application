var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

async function get(req, res, next) {
    var user = req['authUserId'];
    var dep_name = req.body.dep_name;
    let query;
    let faculty_list;

    if(user.role == 'ADMIN'){

      try{
        if(dep_name){
          department_id = await get_department_id(dep_name);
          query = 'select FNAME as "fname", LNAME as "lname" from FACULTY where DEPARTMENT_ID = '+department_id.department_id;
        }else{
            query = 'select FNAME as "fname", LNAME as "lname" from FACULTY';
        }
        faculty_list = await get_faculty_list(query);
      } catch (err){
        console.error(err);
      }
      console.log(faculty_list);
      res.json({faculty_list: faculty_list});
    }
}

module.exports.get = get;

async function get_department_id(dep_name){
  var query_dept = '';
  query_dept = 'select DEPARTMENT_ID as "department_id" from DEPARTMENT where DEPARTMENT_NAME = :department_name';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query_dept,
      {
          department_name: dep_name
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

async function get_faculty_list(query){
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
    let faculty_list = result.rows;
    return faculty_list;

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
