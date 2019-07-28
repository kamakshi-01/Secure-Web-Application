var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

async function post(req, res, next) {
    var event_val = {
        name: req.body.e_name,
        new_name: req.body.e_new_name,
        date:req.body.e_date,
        description: req.body.e_description,
    };

    for (var key in event_val) {
      if (event_val.hasOwnProperty(key)) {
        event_val[key] = esapiEncoder.encodeForHTML(event_val[key]);
        //console.log(course[key]);
      }
    }

    var user = req['authUserId'];

    if(user.role == "ADMIN"){
      try{
        event_id = await get_event_id(event_val);

        event_val.event_id = event_id.event_id;

        if(event_val.new_name){
          update_name_result = await update_event_name(event_val);
          console.log("after update event name",update_name_result);
        }

        if(event_val.date){
          update_date_result = await update_event_date(event_val);
          console.log("after update event date",update_date_result);
        }

        if(event_val.description){
          update_desc_result = await update_event_description(event_val);
          console.log("after update event description",update_desc_result);
        }
        res.json({ message: 'Successfully updated the event!'});
        //res.redirect('/index');
      } catch (err){
        res.json({ message: 'There was some issue while adding :(' });
        console.error(err);
      }
    }
}

module.exports.post = post;

async function get_event_id(event_val){
  var query = '';
  query = 'select EVENT_ID as "event_id" from EVENTS where NAME = :old_name';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          old_name: event_val.name,
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

async function update_event_name(event_val){
  var query = '';
  query = 'update EVENTS set NAME = :new_name where EVENT_ID = :event_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          new_name: event_val.new_name,
          event_id: event_val.event_id,
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

async function update_event_date(event_val){
  var query = '';
  query = 'update EVENTS set DATE_OF_EVENT = TO_DATE(:doe, \'YYYY-MM-DD\') where EVENT_ID = :event_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          doe: event_val.date,
          event_id: event_val.event_id,
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

async function update_event_description(event_val){
  var query = '';
  query = 'update EVENTS set DESCRIPTION = :description where EVENT_ID = :event_id';
  let connection;

  try {
    connection = await oracledb.getConnection(config.database);

    let result = await connection.execute(
      query,
      {
          description: event_val.description,
          event_id: event_val.event_id,
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
