var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

const cookieParser = require('cookie-parser');


function post(req, res, next) {
    var role = req.body.role;
    // var input_username = req.body.username;
    // var encoded_username = esapiEncoder.encodeForHTML(input_username);
    // console.log("encoded ", encoded_username);

    var username = esapiEncoder.encodeForHTML(req.body.username);

    var query = '';

    if(role == "FACULTY"){
      query = 'select FACULTY_ID as "faculty_id", USERNAME as "username", '+
      'PASSWORD as "password", FNAME as "fname", LNAME as "lname", '+
      'DEPARTMENT_ID as "department_id", PHONE_NO as "phone" from FACULTY where username = :username';
    }
    else if(role == "STUDENT"){
      query = 'select STUDENT_ID as "student_id", USERNAME as "username", '+
      'PASSWORD as "password", FNAME as "fname", LNAME as "lname", '+
      'DOB as "dob", PHONE as "phone", PARENT_ID as "parent_id", '+
      'DATE_OF_JOIN as "doj", DEPARTMENT_ID as "department_id", '+
      'SEMESTER as "semester" from STUDENT where username = :username';
    }
    else if(role == "PARENT"){
      query = 'select PARENT_ID as "parent_id", USERNAME as "username", '+
      'PASSWORD as "password", FNAME as "fname", LNAME as "lname", '+
      'DOB as "dob", PHONE_NO as "phone" from PARENT where username = :username';
    }
    else if(role == "ADMIN"){
      query = 'select ADMIN_ID as "admin_id", USERNAME as "username", '+
      'PASSWORD as "password", FNAME as "fname", LNAME as "lname" '+
      'from ADMIN where username = :username';
    }

    oracledb.getConnection(
        config.database,
        function(err, connection){
            if (err) {
                return next(err);
            }

            connection.execute(
                query,
                {
                    username: username
                },
                {
                    outFormat: oracledb.OBJECT
                },
                function(err, results){
                    var user;

                    if (err) {
                        connection.release(function(err) {
                            if (err) {
                                console.error(err.message);
                                res.json({
                                    message: err.message
                                });
                            }
                        });

                        return next(err);
                    }

                    user = results.rows[0];

                    if(user){
                      bcrypt.compare(req.body.password, user.password, function(err, pwMatch) {
                        var payload;

                        if (err) {
                          res.json({
                              message: err.message
                          });
                            return next(err);
                        }

                        if (!pwMatch) {
                          //  res.status(401).send({message: 'Invalid email or password.'});
                          res.json({
                              message:"Invalid credentials. Please try again."
                          });
                            return;
                        }

                        user.role = role;
                        payload = {
                            sub: user,
                            role: role
                        };

                        var token = jwt.sign(payload, config.jwtSecretKey, {expiresIn: '1h'});

                        if(token){
                          res.cookie('token', token);
                          res.json({ message: "Successfully logged in!" });
                          //res.redirect('/index');
                          // res.json({
                          //   success: true,
                          //   message: 'Authentication successful!',
                          //   token: token
                          // });
                        }else{

                          res.status(403).json({
                              message:"Not created"
                          });
                        }
                    });
                  }else{
                    res.json({
                        message:"Invalid credentials. Please try again."
                    });
                  }

                    connection.release(function(err) {
                        if (err) {
                          res.json({
                              message: err.message
                          });
                            console.error(err.message);
                        }
                    });
                });
        }
    );
}

module.exports.post = post;

function get(req, res, next) {
    console.log("body ",req.cookies['jwt'], " header ", req.headers);
    const withAuthUserId = [
      cookieParser(),
      (req, res, next) => {
        const claims = jsonwebtoken.verify(req.cookies['jwt'], config.jwtSecretKey)
        console.log("parser ", claims['sub']);
        req['authUserId'] = claims['sub']
        next()
      }
    ];
    res.redirect('/index');
}

module.exports.get = get;
