var express = require('express');
var mongoose = require('mongoose');
var fs = require('fs');
var _ = require('underscore'),
	passport = require('passport'),
	icalendar = require('icalendar');
var gcal = require('google-calendar');

var USER = process.env.MASTER_USERNAME;
var PASS = process.env.MASTER_PASSWORD;

var Course = require('./models/Course.js');
var Sec = require('./models/Section.js');
var CoursesList = require('./models/CoursesList.js');
var courseWebLoader = require('./courseLoader.js'); 
var CoursesScheduleList = require('./models/CoursesScheduleList.js');

var app = express();
var auth = express.basicAuth(USER, PASS);
// connect to the database
var db = mongoose.connect(process.env.MONGOLAB_URI);

//attach lister to connected event
mongoose.connection.once('connected', function() {
	console.log("Connected to database");
});

app.set('port', (process.env.PORT || 5000));


app.configure(function() {
    app.use(express.static(__dirname + '/public'));        // set the static files location /public/img will be /img for users
    app.use(express.methodOverride());                      // simulate DELETE and PUT
    app.use(express.json());
    app.use(express.urlencoded());
	app.use(express.cookieParser());
    
    app.use(express.session({ secret: 'keyboard cat' }));
     app.use(passport.initialize());
	 app.use(passport.session());
	 app.use(app.router);
});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
