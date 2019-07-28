var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

async function post(req, res, next) {
    var department = {
        name: req.body.d_name,
        new_name: req.body.d_new_name,
        description: req.body.d_description,
    };

    var user = req['authUserId'];

    for (var key in department) {
      if (department.hasOwnProperty(key)) {
        department[key] = esapiEncoder.encodeForHTML(department[key]);
        //console.log(course[key]);
      }
    }

    if(user.role == "ADMIN"){
      try{
        department_id = await get_department_id(department);

        department.department_id = department_id.department_id;

        if(department.new_name){
          update_name_result = await update_department_name(department);
          console.log("after update department name",update_name_result);
        }

        if(department.description){
          update_desc_result = await update_department_description(department);
          console.log("after update department description",update_desc_result);
        }
        res.json({ message: 'Successfully updated the department!'});
        //res.redirect('/index');
      } catch (err){
        res.json({ message: 'There was some issue while adding :(' });
        console.error(err);
      }
    }
}

module.exports.post = post;

async function get_department_id(department){
  var query = '';
  query = 'select DEPARTMENT_ID as "department_id" from DEPARTMENT where DEPARTMENT_NAME = :old_name';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          old_name: department.name,
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

async function update_department_name(department){
  var query = '';
  query = 'update DEPARTMENT set DEPARTMENT_NAME = :new_name where DEPARTMENT_ID = :department_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          new_name: department.new_name,
          department_id: department.department_id,
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

async function update_department_description(department){
  var query = '';
  query = 'update DEPARTMENT set DESCRIPTION = :description where DEPARTMENT_ID = :department_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          description: department.description,
          department_id: department.department_id,
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
