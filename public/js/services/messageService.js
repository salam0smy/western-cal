'use strict';

angular.module('myApp.services').service('messageService',['$http', 'SessionService','usSpinnerService','toaster','$location', function($http, SessionService, usSpinnerService, toaster, $location){
	  var list;
	  
  	  this.getList = function(term){
		 // var request = '?term='+term;
		  return $http.get('/courseList', {params:{term:term}, cache: true}).then(function(response){
			  list = response.data;
			  
			  return list;
		  });
  	  };
	  
	  // sends http get to the server and return course details object
	  this.getCourseDetails = function(titleLink){
		  var courseLink, courseDetails;
		  courseLink=titleLink;
		 return $http({method:'GET', url:'/calenderCoursesDetails', params:courseLink, cache: true}).success(function(data){
		 	  courseDetails = data;
		 	  return data.data;
		 });
				  
		
		
	  };
	  
	  this.getCourseSections = function(cDet){
	  		usSpinnerService.spin('spinner-section');
		  return $http.get('/timeTableInfo', {cache: true, params:{name:cDet.name, number:cDet.number, subject:cDet.subject}}).then(function(res){
			  usSpinnerService.stop('spinner-section');
			  if(res.data.length<1)
			  	toaster.pop('warning', "Sorry", "Couldn't find matching sections in WesternTimeable Service");
			  return res.data;
		  });
	  };
	  this.getCalendarList = function(callback){
	  	var url = "/getCalendarsList";
		var accessToken = SessionService.getToken();

	  	return $http.get(url, {params:{access_token:accessToken}}).success(function(data){
	  		console.log(data);
	  		return data;
	  	});
	  };
	  var postCoursesList = this.postCoursesList = function(coursesLists, cal)
	  // send post message to server containing event sources object
	  {
		  var access_token = SessionService.getToken();
		  if(cal){
		  		var cList = uncircular(coursesLists.eventSources);
		  		console.log(access_token);
		  		$http.post('/g-calendar/'+cal.id, {cList:cList, access_token:access_token});
		  }

	  };
	  this.postCoursesNewList = function(coursesLists, title){
	  	var access_token = SessionService.getToken();
	  		$http.post('/g-calendar', {access_token:access_token, title:title}).then(function(res){
	  			var calendarID = res.data;
	  			postCoursesList(coursesLists, {id:calendarID});
	  		});
	  };
	  this.postIcalendar = function(coursesLists)
	  	// post eventsources to the server, recieve id, then request download file
	  {
	  		var uncircularList = uncircular(coursesLists.eventSources);
	  			  		console.log(uncircularList);
	  		$http.post('/ical', {cList:uncircularList}).then(function(res){
	  			console.log(res);
	  			window.location = res.data;// pass the file to the window to be saved 
	  		});
	  }
	  // send post request to save a new list to database
	  this.postSaveCourseScheduleList = function(coursesList){
	  		console.log(coursesList.courses);
	  		var newList = getCleanListCopy(coursesList.courses);
	  		return $http.post('/saveCoursesScheduleList', {coursesList:newList}).then(function(res){
	  			console.log(res.data);
	  			return res.data;
	  		});
	  }
	  this.getSavedCoursesScheduleList = function(id){
	  	return $http.get('/saveCoursesScheduleList/'+id).then(function(res){
	  		return res.data;
	  	});
	  }
	  // ----------------------- helper functions
	  var getCleanListCopy = function(list){
	  	var newList = [];
	  	angular.forEach(list, function(el){
	  		var _list = {details:el.details, sections:{title:el.sections.title, classes:[]}};
	  		
	  		angular.forEach(el.sections.classes, function(_secs){
	  			var clss = {
	  				classNbr:_secs.classNbr,
	  				click:_secs.click,
	  				component:_secs.component,
	  				days:_secs.days,
	  				endT:_secs.endT,
	  				instructor:_secs.instructor,
	  				location:_secs.location,
	  				notes:_secs.notes,
	  				section:_secs.section,
	  				startT:_secs.startT
	  			};
	  			_list.sections.classes.push(clss);
	  		});
	  		newList.push(_list);
	  	});
	  	
	  	
	  	return newList;
	  }
	  var uncircular = function(list){
	  	var nList = [];
	  	angular.forEach(list, function(a){
	  		var aNew = {};
	  		aNew.title = a.title;
	  		aNew.location = a.location;
	  		aNew.start = a.start;
	  		aNew.end = a.end;
	  		nList.push(aNew);
	  	});
	  	return nList;
	  }
	  var censor =  function(cen)
	  	// get red of circulur objects, to make it ready to be sent
	   {
  		var i = 0;

  		return function(key, value) {
   	 		if(i !== 0 && typeof(cen) === 'object' && typeof(value) == 'object' && cen == value) 
   	   return '[Circular]'; 

  	  if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
   		   return '[Unknown]';

    ++i; // so we know we aren't using the original object anymore

    return value;  
  }
}
	  // this service takes care of scheduling courses
  }]);