var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

async function post(req, res, next) {
    var department = {
        name: req.body.d_name,
        description: req.body.d_description,
    };

    for (var key in department) {
      if (department.hasOwnProperty(key)) {
        department[key] = esapiEncoder.encodeForHTML(department[key]);
        //console.log(course[key]);
      }
    }

    var user = req['authUserId'];

    try{
      var check_dept = await check_department(department);
      if(check_dept){
        res.json({message: "Department already exists"});
      }else{

        if(user.role == "ADMIN"){
          try{
            insert_result = await insert_department(department);
            console.log("after insert department",insert_result);
            res.json({ message: 'Successfully added the department!'});
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

async function check_department(department){
  var query = '';
  query = 'select DEPARTMENT_NAME as "department_name" from DEPARTMENT where department_name = :department_name';

  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          department_name: department.name
      },
      {
          outFormat: oracledb.OBJECT
      },
    );
    //console.log(result.rows);
    let department_name = result.rows[0];
    return department_name;

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

async function insert_department(department){
  var query = '';
  query = 'insert into DEPARTMENT (DEPARTMENT_NAME, DESCRIPTION) '+
  'values (:department_name, :description)';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          department_name: department.name,
          description: department.description,
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
