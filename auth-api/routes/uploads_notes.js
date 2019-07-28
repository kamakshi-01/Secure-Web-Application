var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');
var multer = require('multer');

function post(req, res, next) {
  var StorageNotes = multer.diskStorage({
      destination: function(req, file, callback) {
          callback(null, "./public/notes");
      },
      filename: function(req, file, callback) {
          //callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
          callback(null, file.originalname);
      }
  });

  var upload_notes = multer({
       storage: StorageNotes
   }).array("notesFileUploader", 3); //Field name and max count

   upload_notes(req, res, function(err) {
       if (err) {
           return res.json({result: "Something went wrong!"});
       }
       return res.json({result: "Notes uploaded sucessfully!."});
   });
    // var name = req.body.name;
    // var course = req.body.course;
    // var query = '';
    //
    // if(role == "FACULTY"){
    //   query = 'select USERNAME as "username", PASSWORD as "password" from FACULTY where username = :username';
    // }
    // else if(role == "STUDENT"){
    //   query = 'select USERNAME as "username", PASSWORD as "password" from STUDENT where username = :username';
    // }
    // else if(role == "PARENT"){
    //   query = 'select USERNAME as "username", PASSWORD as "password" from PARENT where username = :username';
    // }
    // else if(role == "ADMIN"){
    //   //add later
    // }
    //
    // oracledb.getConnection(
    //     config.database,
    //     function(err, connection){
    //         if (err) {
    //             return next(err);
    //         }
    //
    //         connection.execute(
    //             query,
    //             {
    //                 username: req.body.username
    //             },
    //             {
    //                 outFormat: oracledb.OBJECT
    //             },
    //             function(err, results){
    //                 var user;
    //
    //                 if (err) {
    //                     connection.release(function(err) {
    //                         if (err) {
    //                             console.error(err.message);
    //                         }
    //                     });
    //
    //                     return next(err);
    //                 }
    //
    //                 user = results.rows[0];
    //
    //                 bcrypt.compare(req.body.password, user.password, function(err, pwMatch) {
    //                     var payload;
    //
    //                     if (err) {
    //                         return next(err);
    //                     }
    //
    //                     if (!pwMatch) {
    //                         res.status(401).send({message: 'Invalid email or password.'});
    //                         return;
    //                     }
    //
    //                     payload = {
    //                         sub: user.username,
    //                         role: role
    //                     };
    //
    //                     var token = jwt.sign(payload, config.jwtSecretKey, {expiresIn: 86400});
    //
    //
    //                     console.log(token);
    //                         if(token){
    //                         res.status(200).json({
    //                           user: user,
    //                           token: token
    //                         });
    //                     }
    //                     else{
    //                         res.status(403).json({
    //                             message:"Not created"
    //                         });
    //                     }
    //                     //res.status(200).send('http://localhost:3000/api/get_token',{user: user,token: token});
    //                     // axios.post('http://localhost:3000/api/get_token', {
    //                     //   user: user,
    //                     //   token: token
    //                     // }).then(function (response) {
    //                     //   console.log('RESPONSE --> ',response);
    //                     // })
    //                     // .catch(function (error) {
    //                     //   console.log('ERROR --> ',error);
    //                     // });
    //                     // res.status(200).json({
    //                     //     user: user,
    //                     //     token: token
    //                     // });
    //
    //                     // res.status(200).json({
    //                     //     user: user,
    //                     //     token: jwt.sign(payload, config.jwtSecretKey, {expiresIn: 86400})
    //                     // });
    //
    //                      // res.render(__dirname + '../public/index.html');
    //                     // res.redirect('/get_user');
    //
    //                 });
    //
    //                 connection.release(function(err) {
    //                     if (err) {
    //                         console.error(err.message);
    //                     }
    //                 });
    //             });
    //     }
    // );



}

module.exports.post = post;
