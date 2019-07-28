var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');


const cookieParser = require('cookie-parser');


async function get(req, res, next) {
    var user = req['authUserId'];
    let query;
    let department_list;

    if(user.role == 'ADMIN'){
        query = 'select DEPARTMENT_NAME as "department_name" from DEPARTMENT';
      try{
        department_list = await get_department_list(query);
      } catch (err){
        console.error(err);
      }
      console.log(department_list);
      res.json({department_list: department_list});
    }
}

module.exports.get = get;

async function get_department_list(query){
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
    let department_list = result.rows;
    return department_list;

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
