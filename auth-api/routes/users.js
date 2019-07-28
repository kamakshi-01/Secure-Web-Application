var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');

function post(req, res, next) {
    var user = {
        username: req.body.username,
        fname: req.body.fname,
        lname: req.body.lname,
        dob: req.body.dob,
        role: req.body.role
    };
    var unhashedPassword = req.body.password;

    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            return next(err);
        }

        bcrypt.hash(unhashedPassword, salt, function(err, hash) {
            if (err) {
                return next(err);
            }

            user.hashedPassword = hash;

            insertUser(user, function(err, user) {
                var payload;

                if (err) {
                    return next(err);
                }

                payload = {
                    sub: user.username,
                    role: user.role
                };

                res.status(200).json({
                    user: user,
                    token: jwt.sign(payload, config.jwtSecretKey, {expiresInMinutes: 60})
                });
            });
        });
    });
}

module.exports.post = post;

function insertUser(user, cb) {
    var query = '';
    if(user.role == "PARENT"){
      query = 'insert into PARENT (USERNAME, PASSWORD, FNAME, LNAME, DOB) '+
      'values (:username, :password, :fname, :lname, TO_DATE(:dob, \'DD/MM/YY\')) '+
      'returning PARENT_ID, USERNAME '+
      'into :rid, :rusername' ;
    }
    oracledb.getConnection(
        config.database,
        function(err, connection){
            if (err) {
                return cb(err);
            }

            connection.execute(
                query,
                {
                    username: user.username,
                    password: user.hashedPassword,
                    fname: user.fname,
                    lname: user.lname,
                    dob: user.dob,
                    rid: {
                        type: oracledb.NUMBER,
                        dir: oracledb.BIND_OUT
                    },
                    rusername: {
                        type: oracledb.STRING,
                        dir: oracledb.BIND_OUT
                    }
                },
                {
                    autoCommit: true
                },
                function(err, results){
                    if (err) {
                        connection.release(function(err) {
                            if (err) {
                                console.error(err.message);
                            }
                        });

                        return cb(err);
                    }

                    cb(null, {
                        id: results.outBinds.rid[0],
                        username: results.outBinds.rusername[0]
                    });

                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }
                    });
                });
        }
    );
}
