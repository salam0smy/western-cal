'use strict';

angular.module('myApp.services').factory('SchedulerService', function(){
	  
	  
	  // accept a class section object and returns a calenda
	  var makeEvent = function(clss, mTitle, dayOffset, day, _click){
		  var date = new Date();
		      var d = date.getDate();
		      var m = date.getMonth();
		      var y = date.getFullYear();
		  var mStart = parseTime(clss.startT);
		  var mEnd = parseTime(clss.endT);
		  var color = "";
		
		  var click = function(){
		  	return _click();
		  }

		  return {
			  id: clss.classNbr,
			  title: mTitle,
			  start: new Date(y, m, d-dayOffset, mStart.hours, mStart.minutes),
			  end: new Date(y, m, d-dayOffset, mEnd.hours, mEnd.minutes),
			  allDay: false,
			  mDay:day,
			  location:clss.location,
			  click : click,
			  color : color,
		  };
		
	  };
	  var checkEventsConflict = function(eventSrc, evnts)
	  // check if one of the events conflict with given eventsources
	  {
		  var ret = false;
		  for(var i =0; i<evnts.length && !ret; i++){
			  ret = checkConflict(eventSrc, evnts[i]);
		  }
		  return ret;
	  }
	  var checkConflict = function(cal, mevent)
	  // CHECK if the given event conflict with given calendar (event array)
	  {
		  var ret = false;
		  angular.forEach(cal, function(evt){
			  if(evt.mDay == mevent.mDay ){ // is it the same day
				  if(evt.start.getTime()<=mevent.start.getTime() && mevent.start.getTime()< evt.end.getTime()){ // conflict it starts at the same time - test upper boundaries
					  console.log("start time overlap");
					  ret = true;
				  }
				  else if(evt.start.getTime()<mevent.end.getTime() && mevent.end.getTime()<= evt.end.getTime()){
				  	 ret = true;
				  }
			  }
		  });
		  return ret;
	  };
	  
	  // returns an arrays of events... one class can exists on multiple days
	  var makeEvents = function(clss, mTitle, click){
		  console.log(clss.days.split(' '));
		  var events =[];
		  angular.forEach(clss.days.split(' '), function(d){
			  var offset = getDateOffset(d);
			  var evnt = makeEvent(clss, mTitle, offset, d, click);
			  clss.event = evnt;
			  events.push(evnt);
		  })
		  return events;
	  };
	  
	  // calculates the day offset of an event... accepts days in format of 'm', 't', 
	  var getDateOffset = function(day){
	  	 var d = new Date();
		 var weekDays = {
		 M:1,
		 Tu:2,
		 W:3,
		 Th:4,
		 F:5	
	 };
	 		return d.getDay()-weekDays[day] ;
	  };
	  var addCourses = function(eventSources, sections, callBck)
	  // check if there is a conflict, return err if so, or add events to the source
	  {
		  var err = false;
		  angular.forEach(sections.classes, function(clss){
			  if(clss.click){// make sure class is chosen
				  var events = makeEvents(clss, sections.title, sections.onClick); // convert classes to events by day
				  angular.forEach(events, function(ev){ // add each class per day
					  //err = checkConflict(eventSources, ev);
					 
					  	eventSources.push(ev);
				  });
			  }// end if click
		  });
		  callBck(eventSources, err);
	  };
	  var makeListOfEvents = function(classes, title, callback)
	  // makes eventSource array out of given classes
	  {
		  var evSrc = [];
		  angular.forEach(classes, function(c){
			  if(c.click){
				  var events = makeEvents(c, title); // convert classes to events by day
				  evSrc = evSrc.concat(events);
			  }
		  });
		  callback(evSrc);
	  };
	  
	  var calcTimePeriod = function(start, end){
		  var mStart = parseTime(start);
		  var mEnd = parseTime(end);
		  return mEnd.hours - mStart.hours
	  };
	  
	  // parse a time (09:00 am) to a time object (1:00 pm to 13:00)
	  var parseTime = function(time){
		  var mTime ={};
		  var timePeriod = time.split(" ");
		 var theTime = timePeriod[0].split(":");
		  
		 if(timePeriod[1] == 'AM' || timePeriod[1] == 'am'){
			 mTime.hours = theTime[0];
			 mTime.minutes = theTime[1];
		 }
		 else{
			 if(theTime[0]=='12')
				 mTime.hours = theTime[0];
			else
				 mTime.hours = ""+(parseInt(theTime[0])+12);
				 
			 mTime.minutes = theTime[1];
		 }
		 return mTime;
	  }
	  // parses extra information if course details infot usefull data
	  var parseExtraDetails = function(details){
		  var options = details.extra.split(", ");
		  var listOfOpt= [];
		  angular.forEach(options, function(part){
			  var component = part.split(" ");
			  var type ={};
			  if(component.length>2){
				  if(component[1] =='lecture'){
					  type = 'LEC';
				  }
				  else if(component[1] =='laboratory'){
					  type = 'LAB';
				  }
				  else if(component[1] =='tutorial'){
					  type = 'TUT';
				  }
			  }// end if length > 2
			  else{ // this is the last part of the string wich says 0.5 course credits or 1
				  type = 'weight';
			  }
			  
			  listOfOpt.push({
				  type:type,
				  val:component[0]
			  });
		  });
		  
		  return listOfOpt;
	  };
	 
	  
	  // factory exposes these services
	  return{
		addCourses:addCourses,
		checkConflict:checkEventsConflict,
		makeListOfEvents:makeListOfEvents,
		makeEvents:makeEvents
	  };
  });