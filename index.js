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

// ----- routes
app.get('/', function(req, res) {	
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/getCalendarsList', function(req, res)
// get google cal token, then return avalible calendars
{
	var accessToken = req.query.access_token;
	console.log(req.body);
	gcal(accessToken).calendarList.list(function(err, data) {
   		 if(err) return res.send(500,err);
  			  return res.send(data);
  	});

});

app.all('/ical', function(req, res)
{
	// construct an icalendar object for download
	console.log(req);
	var coursesList = req.body['cList'];
	console.log(coursesList);
	var ical = makeiCalEvents(coursesList);
	var fName = saveTempiCalFile(ical);

	res.send(fName);

});
app.all('/g-calendar/:calendarId', function(req, res){
	console.log(req.body);
	var calendarId  = req.params['calendarId'];
		var coursesList = req.body['cList'];
	var accessToken = req.body['access_token'];
	console.log("coursesList");
	console.log(coursesList);
	 _.each(coursesList, function(_event){
		 
		  var resource = {
		    "summary": ""+_event.title,
		    "location": _event.location,
		    "start": {
		      "dateTime": _event.start,
		      "timeZone": "America/New_York"
		    },
		    "end": {
		      "dateTime": _event.end,
		      "timeZone": "America/New_York"
		    },
		    "recurrence": [
 			 "RRULE:FREQ=WEEKLY;COUNT=26",
				],
		  };
		  console.log("resource");
		  console.log(resource);

		  gcal(accessToken).events.insert(calendarId, resource,
		  function(err, data) {
			  console.log(data);
		  });
	  });

});
app.all('/g-calendar', function(req, res)
// use recived token and title and make a new calendar, return calendarID
{
	 var accessToken = req.body['access_token'];
	//console.log(req.body);
	
	var _title = req.body['title'].val;
	//Create an instance from accessToken
	//console.log(_title);
	  
	gcal(accessToken).calendars.insert({summary:""+_title}, function(err, data) { // add a new calendar
      if(err) return res.send(500,err);
	 // console.log(data);
	  var calendarID = data.id;
      return res.send(calendarID);
	});
		
	
});

app.get('/updateCoursesList', auth, function(req, res){
			
	loadCoursesList(function(){
		res.send('Started Loading Courses Map Successfully...');
		//res.redirect('/');
	});
	
});

// returns an arrays of course department or catagory and a page link 
app.get('/calenderCoursesLinks', function(req, res){
	
	courseWebLoader.getLinks(function(courses_1){
		console.log(courses_1);
	     res.send(courses_1);
	});
	
});

// returns values for auto complete choosing of courses
app.get('/courseList', function(req, res){
	var term = req.query.term;
	console.log(term);
	CoursesList.find({'title': {$regex:term, $options: 'i'}}).limit(20).exec(function(err, crss){
		if(err)console.log("ERROR: "+ err);
		console.log("found " + crss.length+" mathches");
		res.send(crss);
	});
});

// accept a course name link object and returns its courses objects
app.get('/calenderCoursesDetails', function(req, res) {
	course = req.query;

	courseWebLoader.getPageCoursesinfo(course, function(cs){

		var _mCourse ={};
		_.each(cs, function(crs){
			if(crs[0]==course.title){
				
			_mCourse = new Course({
				title:crs[0],
				subject:crs[1],
				name:crs[4],
				number:crs[2],
				description:crs[5],
				antirequisite:crs[6],
				prerequisite:crs[7],
				corequisite:crs[8],
				pre_or_corequisite:crs[9],
				extra:crs[10]
			});
			
		 }// end if equal title
		});
		
		res.send(_mCourse);
	})
});


// reads courses and returns the parsed object
app.get('/timeTableInfo', function(req, res) {
	var cDet = req.query;
		courseWebLoader.loadTimetable(cDet.number, function(content){ // returns the matching course number
			var _secs = makeSectionsArray(content, cDet);
			res.send(_secs);
		//	console.log(content);
		});
		
});

// save list in the database and return objectID
app.post('/saveCoursesScheduleList', function(req, res){
	var list = req.body['coursesList'];
	//console.log(list);
	var _list = new CoursesScheduleList({list:list});
	_list.save(function(err, savedList){
		if(err)
			console.log("EORROR"+err);
		else{
		console.log(savedList);
		//res.send(savedList._id);
		res.send(savedList._id.toString());
	}
	});
});
app.all('/saveCoursesScheduleList/:id', function(req, res){
	console.log(req);
	var _id = req.params['id'];
	CoursesScheduleList.findOne({_id:_id}, function(err, list){
		if(err)
			console.log(err)
		else
			res.send(list);
	});
});


/// ------------------------------------------------------------------
// ------------------------------------ helper functions

var makeSectionsArray = function(content, cDet){
	var _secs = [];
			console.log(content);
			
			_.each(content, function(cour){
				var str = new String(cour.title);
				
				if(str.search(cDet.name.toUpperCase())>0 || exhaustSearchTitle(str, cDet)){ 
					var _sec = {title:cour.title, classes:new Array()};
				
					// iterate on the sections in each course title
					//console.log(cour.secs);
					_.each(cour.secs, function(k, i){
						if(k.length>10){
							var _clss = new classSection(k);// parse it by initiating a new classSection
							_sec.classes.push(_clss);
							console.log(_clss);
						}
					});
					_secs.push(_sec); // add the section to the list to be sent
					console.log(_sec);
					
				}// end if
				
			});
			return _secs;
}
function classSection(k){
	this.section=k[0];
	this.component = k[1]; // LEC or TUT or LAB etc...
	this.classNbr = k[2]; // class number 
	this.days =k[3];
	this.startT = k[9];
	this.endT = k[10];
	this.location = k[11];
	this.instructor = k[12];
	this.notes = k[13];
	this.full = k[14];
}
var makeiCalEvents = function(coursesList)
// accepts an eventsSources and converts it to ical format 
{

		var ical = new icalendar.iCalendar();// creat a calendar

		_.each(coursesList, function(_mevent){
			console.log(_mevent);
		 var _event = ical.addComponent('VEVENT'); // add new event, and use it
		 	_event.setSummary(_mevent.title);
		 	_event.setDescription(_mevent.location);
		 	_event.setDate(new Date(_mevent.start), new Date(_mevent.end));
		 	_event.rrule = new icalendar.RRule("FREQ=WEEKLY;COUNT=26");
		 	console.log(_event.toString());
		});
		return ical;
}
var saveTempiCalFile = function(ical){
	var uniq = _.uniqueId('ical_');
	var fName = '/'+uniq+'.ics';
	fs.writeFile(__dirname+fName, ical.toString(), function (err, file) {
 		 if (err) throw err;
 		 console.log('It\'s saved! as '+ fName);
		});
	return fName;
}

var exhaustSearchTitle = function(titleStr, courseDet)
// if there str.search failed to find the course, exhauste search the title to find the course
{
	//console.log(courseDet);
	var courseAbbr = titleStr.split(" ")[0];
	var subject = courseDet.subject.split(" ");
	if(subject.length>1){ // try to find course initial
		var abbrv = subject[0].charAt(0)+""+subject[1].charAt(0);
		//console.log("\n\nsubject:\n\n"+subject+" abrv:"+abbrv +" title: "+ courseAbbr );
		if( courseAbbr.search(abbrv, 'i')==0){
			//console.log("\n\n\ntruee\n\n"+ titleStr);
			return true;
		}
		
	}
	
		var abbr = courseDet.subject.substring(0, 3).toUpperCase();
		//console.log("\n\n2: abbr: "+abbr+" titleStr: "+ titleStr);
		if(courseAbbr.search(abbr)>=0){
			return true;
		}
		

	return false;
};
// gets a titles's courses a saves them to the database
var loadCoursesDetails = function(){
	// this returns the parsing of the static file contating software engineering courrses
	courseWebLoader.loadTimetable(function(d){
		// iterate and get the title
		_.each(d, function(k, i){
			var _section = new Sec.Section({title:k.title});
			// iterate on the sections in each course title
			_.each(k.secs, function(k, i){
				if(k.length>10){
					var _clss = new Sec.Class({section:k[0]});
					_clss.component = k[1]; // LEC or TUT or LAB etc...
					_clss.classNbr = k[2]; // class number 
					_clss.addDay(k[3]);
					_clss.startT = k[9];
					_clss.endT = k[10];
					_clss.location = k[11];
					_clss.instructor = k[12];
					_clss.notes = k[13];
					_section.addClass(_clss);
				}
			});
			_section.save(function(err, _sec){
				if(err)console.log("err saving section: "+err);
				console.log("saved:"+_sec);
				
			});
			
		});
	
	});
}

// query all the courses from western calendar and saved them in data base as coursesList
var loadCoursesList = function(callback){
	var _links ;
	courseWebLoader.getLinks(function(courses_1){
		_.each(courses_1, function(k){
			courseWebLoader.getPageCoursesinfo(k, function(cs){
				_.each(cs, function(v){
					var _c = new CoursesList({
						link:k.link,
						title: v[0]});
						_c.save(function(err, _c){
							if(err)
								console.log("didnt save! list item");
							else
								console.log("saved: "+_c);
							
						});
				});
			});

		
		});
		callback();
		
	});
	
}



// -- end routes

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
