var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var users = require(__dirname + '/routes/users.js');
var logins = require(__dirname + '/routes/logins.js');
var logins_without_security = require(__dirname + '/routes/logins_without_security.js');
var user_view_details = require(__dirname + '/routes/user_view_details.js');

var courses_list = require(__dirname + '/routes/courses_list.js');
var faculty_list = require(__dirname + '/routes/faculty_list.js');
var department_list = require(__dirname + '/routes/department_list.js');
var events_list = require(__dirname + '/routes/events_list.js');

var insert_event = require(__dirname + '/routes/insert_event.js');
var insert_course = require(__dirname + '/routes/insert_course.js');
var insert_department = require(__dirname + '/routes/insert_department.js');
var insert_student_parent = require(__dirname + '/routes/insert_student_parent.js');
var insert_faculty = require(__dirname + '/routes/insert_faculty.js');

var update_event = require(__dirname + '/routes/update_event.js');
var update_course = require(__dirname + '/routes/update_course.js');
var update_department = require(__dirname + '/routes/update_department.js');

var uploads_assignment = require(__dirname + '/routes/uploads_assignment.js');
var uploads_notes = require(__dirname + '/routes/uploads_notes.js');
var uploads_videos = require(__dirname + '/routes/uploads_videos.js');
var check_token = require('./check_token.js');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '/config.js');
var app;
var router;
var port = 3000;
var path= require('path');
var csrf = require( 'csurf' ) ;
var esapi= require('node-esapi');
var esapiEncoder= esapi.encoder();

// require('@snyk/nodejs-runtime-agent')
// ({projectId: '69647065-aa88-42f9-b72f-14f14a4c3750',
// });

app = express();

app.use(morgan('combined')); //logger
app.use(bodyParser.json());


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

//security aspect

var helmet = require('helmet') //https://www.npmjs.com/package/helmet
var hpp = require( 'hpp' ) ;
app.use( hpp() ) ;


app.use(helmet());

const csp = require('helmet-csp')

// Allow loading resources only from white-listed domains
app.use( csp( {
 directives: {
   "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
   //https://fonts.googleapis.com/css?family=Lato:700%7CMontserrat:400,600
   "style-src": [, "'self'", "'unsafe-inline'", 'https://maxcdn.bootstrapcdn.com'],
   "font-src": ["'self'", 'https://fonts.googleapis.com/css' , 'https://fonts.gstatic.com/s', 'https://maxcdn.bootstrapcdn.com'],
   //"img-src": [ path.join(__dirname + '/public/img')]
   "img-src": ["'self'"],
   "default-src": [ "'self'" ],
 }
} ) ) ;

// Adding XSS prevention header block

app.use(function(req, res, next) {
    res.header("X-XSS-Protection", "1; mode=block");
    next();
});

app.use(function(req, res, next) {
    res.header("X-Content-Type-Options", "nosniff");
    next();
});

app.use(function(req, res, next) {
    res.header("Strict-Transport-Security", "max-age=31536000");
    next();
});

// app.use(function(req, res, next) {
//     res.header("Content-Security-Policy", "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self';");
//     next();
// });



// Prevent opening page in frame or iframe to protect from clickjacking
app.disable( 'x-powered-by' ) ;

app.use(helmet.xssFilter())
app.use(helmet.frameguard())
// Prevents browser from caching and storing page
app.use(helmet.noCache());
 // Allow communication only on HTTPS
 app.use(helmet.hsts());

app.use( function( req, res, next ) {
  res.header( 'Strict-Transport-Security', 7776000000 ) ;
  // Prevent opening page in frame or iframe to protect from clickjacking
  //It will prevent anyone from putting this page in an iframe unless it’s on the same origin. That generally means that you can put your own pages in iframes, but nobody else can.
  res.header( 'X-Frame-Options', 'SAMEORIGIN' ) ;
  res.header( 'X-XSS-Protection', 0 ) ;
  // Forces browser to only use the Content-Type set in the response header instead of sniffing or guessing it
  res.header( 'X-Content-Type-Options', 'nosniff' ) ;
  next() ;
} ) ;

const rateLimit = require("express-rate-limit");

app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

// only apply to requests that begin with /api/
app.use("/api/", apiLimiter);
//security aspect ends

router = express.Router();
router.post('/users', users.post);
router.post('/logins', logins.post);
router.post('/logins_without_security', logins_without_security.post);

const withAuthUserId = [
  cookieParser(),
  (req, res, next) => {
    const claims = jwt.verify(req.cookies['token'], config.jwtSecretKey)
    req['authUserId'] = claims['sub']
    next()
  }
];

router.get('/get_user', ...withAuthUserId, (req, res) => {
  console.log(req['authUserId']);
  res.json({user: req['authUserId']});
});

router.get('/logout/', function(req, res) {
  res.clearCookie("token");
  res.redirect('/index');
});
//app.get('/get_user', check_token.checkToken, logins.get);

router.get('/user_view_details', ...withAuthUserId, user_view_details.get);

router.get('/get_courses_list', ...withAuthUserId, courses_list.get);
router.get('/get_faculty_list', ...withAuthUserId, faculty_list.get);
router.get('/get_department_list', ...withAuthUserId, department_list.get);
router.get('/get_events_list', ...withAuthUserId, events_list.get);

router.post('/insert_event', ...withAuthUserId, insert_event.post);
router.post('/insert_course', ...withAuthUserId, insert_course.post);
router.post('/insert_department', ...withAuthUserId, insert_department.post);
router.post('/insert_student_parent', ...withAuthUserId, insert_student_parent.post);
router.post('/insert_faculty', ...withAuthUserId, insert_faculty.post);

router.post('/update_event', ...withAuthUserId, update_event.post);
router.post('/update_course', ...withAuthUserId, update_course.post);
router.post('/update_department', ...withAuthUserId, update_department.post);


router.post('/upload_assignment', ...withAuthUserId, uploads_assignment.post);
router.post('/upload_notes', ...withAuthUserId, uploads_notes.post);
router.post('/upload_videos', ...withAuthUserId, uploads_videos.post);

app.use('/api', router);


app.get('/index', function (req, res) {
req.acceptsLanguages("en");
res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/contact', function (req, res) {
res.sendFile(path.join(__dirname + '/public/contact.html'));
});

app.get('/blog', function (req, res) {
res.sendFile(path.join(__dirname + '/public/blog.html'));
});

app.use( csrf() ) ;
app.use( function( req, res, next ) {
  res.locals.csrftoken = req.csrfToken() ;
  next() ;
} ) ;

app.listen(port, function() {
    console.log('Web server listening on localhost:' + port);
});
