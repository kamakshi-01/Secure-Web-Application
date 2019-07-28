var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');


const cookieParser = require('cookie-parser');


async function get(req, res, next) {
    var user = req['authUserId'];
    let query;

    if(user.role == 'ADMIN'){
        query = 'select NAME as "e_name" from EVENTS';
      try{
        events_list = await get_events_list(query);
      } catch (err){
        console.error(err);
      }
      console.log(events_list);
      res.json({events_list: events_list});
    }
}

module.exports.get = get;

async function get_events_list(query){
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
    let events_list = result.rows;
    return events_list;

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
