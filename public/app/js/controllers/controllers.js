'use strict';

/* Main Controllers */

angular.module('myApp.controllers')
.controller('MainCtrl', ['$scope','messageService','SchedulerListService','SchedulerService','toaster','$http','SessionService','$routeParams','$location',
						function($scope, messageService, SchedulerListService, SchedulerService, toaster, $http, SessionService, $routeParams, $location){
	// initialize controller with a list
	if($routeParams.listId){
		// send get to server
		// load the list
		// create events for avalible courses 
		// then proceed normally

		var id = $routeParams.listId;
		var data = messageService.getSavedCoursesScheduleList(id);
		data.then(function(a){
			console.log(a);
			restoreSavedList(a.list);
		});
	}

	//  ----------- scope flags
	
	$scope.courseDetailsFlag = false; // flag to enable details button - false to disable initially
	$scope.showDetailsFlag = false;
	
	// ------------ scope variables
	
	$scope.courseDetails; 
	$scope.eventSources=[];
	 $scope.alerts=[];
	var tempEvents=[]; // holds tempporary events to show on the calendar on demand
	$scope.activeTabPos = 0;
	$scope.activeListOfCourses;// changes on tab changes
	$scope.selectedCourseTitle; // search input variable
	$scope.coursesLists = SchedulerListService.sortedSectionsLists;
	$scope.detailsText = "Details";
	if($scope.coursesLists.length<1)
		SchedulerListService.init();// initlizr service only once
		$scope.coursesLists[$scope.activeTabPos].active = true;

	$scope.courseSections; // current course sections
	$scope.$watch('loadingCourses', function(a){
		console.log(a);
		if(a){
			$scope.detailsText = "loading...";
		}
		else{
		$scope.detailsText = "Details";
		}
	});

	// ------------ link event functions

	$scope.pinClick = function(c, courseDetails, e){
		 if (e) {
    	        e.preventDefault();
    	        e.stopPropagation();
    	     }
    	     c.courseDetails = courseDetails;
    	     c.isPin=!c.isPin;
    	     console.log("heeloo pni "+ c.isPin);

	};
	
	$scope.sectionClick = function(classes, clss, e){
    	  if (e) {
    	        e.preventDefault();
    	        e.stopPropagation();
    	      }
			  var secNum = clss.section;
			  var comp = clss.component;
			  angular.forEach(classes.classes, function(c){
				  if(c.section == secNum){
				  	c.click = !c.click;
				  	$scope.showTempSection(c, classes.title, c.click);
				  }
				  else if(c.component == comp && c.click){
				  	c.click = false;
				  	$scope.showTempSection(c, classes.title, c.click);

				  }
			  });
	};
	$scope.removeTabClick = function(list, i, remove){
		if(list.eventSources.length<1 || remove){
			$scope.coursesLists.splice(i, 1);
			$scope.activeTabPos = i-1;
			getActiveTab().active = true;
		}
		else{
		//toaster.pop('error', "Hold On!", 'Are you sure you also want to delete courses in the list? <button ng-click="onRemoveTabYesClick('+i+')" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-ok"></i>Yes</button>', 0, 'trustedHtml');
			$scope.alerts.length=0;
			addAlert("Are you sure you want to delete the content of the list too?", "danger");
			$scope.activeTabPos = i;

		}
	}
	 $scope.onRemoveTabYesClick = function(){
	 	angular.forEach(getActiveTab().courses, function(cour){
	 		$scope.removeSectionClick(cour);
	 	});
	 	$scope.removeTabClick(getActiveTab(), $scope.activeTabPos, true);
	 	$scope.alerts.length=0;
	 }
	 $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
	$scope.exportClick = function(){
		$scope.$broadcast('exportClick', {isEmpty: $scope.coursesLists[$scope.activeTabPos].isEmpty(), isAuth:SessionService.getUserAuthenticated()});	
	};
	$scope.onTabActive = function(list, i){
		$scope.activeListOfCourses=list;
		$scope.activeTabPos=i;
		var src = $scope.coursesLists[i].eventSources;
		  $scope.myCalendar.fullCalendar('addEventSource', list.eventSources);	}
	$scope.onTabDeactive = function(list){
	  $scope.myCalendar.fullCalendar('removeEventSource', list.eventSources);
	};
	$scope.removeSectionClick = function(course, e){
		 if (e) {
  	        e.preventDefault();
  	        e.stopPropagation();
  	      }
  	      getActiveTab().remove(course);
  	      $scope.myCalendar.fullCalendar('refetchEvents'); // force to update calendar events
	};

	$scope.showTempSection = function(clss, title, add){
		if(add){
		var srcEvents = SchedulerService.makeEvents(clss, title);
		clss.events = srcEvents;
		tempEvents.push(srcEvents);
		$scope.myCalendar.fullCalendar('addEventSource', clss.events);
	}
	else{
		$scope.myCalendar.fullCalendar('removeEventSource', clss.events);
		var index = tempEvents.indexOf(clss.events);
		if(index>-1){
			tempEvents.splice(index, 1);
		}
	}
	};
	$scope.editSectionClick = function(course, e)
	// return course information inplace to be edited
	{
  	  if (e) {
  	        e.preventDefault();
  	        e.stopPropagation();
  	      }
		  $scope.removeSectionClick(course);
		restoreSearchInput(course.details, course.sections);
	};
	$scope.addCourseSections = function(secs, details, e, conflictResolved)
	// --- add this course to the list and calculate the events
	{	
		if(secs.isPin){
			details = secs.courseDetails;
			secs.isPin = false;
		}
		if(angular.isUndefined(conflictResolved))
			conflictResolved=false;

	 	 if (e) {
	        e.preventDefault();
	        e.stopPropagation();
	      }

		  if(validateSections(secs)){
		  	removeTempEvents(secs.classes);// remove temporary events from calendar
		  var added = false;
		 
			  var conflict = false;
			  var evtSources = $scope.coursesLists[$scope.activeTabPos].eventSources;
			  if(!$scope.coursesLists[$scope.activeTabPos].isEmpty()){
			 	 var sections =secs;
			  	 SchedulerService.makeListOfEvents(sections.classes, sections.title, 
					  function(a){
						  sections=a; // convert list of sections to list of events
					  });
				  conflict = SchedulerService.checkConflict(evtSources, sections);
			  }
			  



			  if(!conflict || conflictResolved){ // if there is no conflict, proceed
			  	secs.isopen = false;
			  	registerSecClickCalbacks(secs);
		  		SchedulerService.addCourses(evtSources, secs, function(evtSrc, err){
		  		if(!err){
					evtSources = evtSrc; // update caledar reference
		  			added=true;
					$scope.myCalendar.fullCalendar('refetchEvents'); // force to update calendar events
		  		}
				
		  	});
		}// end if conflict
		else{ // conflict exists, advance to next calendar list
			showConflictModal(details, function(newList){
				if(newList)
					$scope.activeTabPos=$scope.coursesLists.nextList($scope.activeTabPos);
				$scope.addCourseSections(secs, details, e, true);
			});

			
		}// end else if conflict
		if(added){ // if we have added the course,
		SchedulerListService.addSectionsAndDetails(secs, details, $scope.activeTabPos);
		clearSearchInput();// clear for new input
		}
	}// end if validate secstions
	else{
		 toaster.pop('warning', "Hold On!", "Please select a section from the list");
	}
	}
	$scope.getTypeahead = function(term)
	// get user input and return array of matching course titles
	{
		tempEvents.clear();
		$scope.typeaheadMap;
		var typeaheadMapPromise = messageService.getList(term);
		return typeaheadMapPromise.then(function(map){
			$scope.typeaheadMap = map;
			return makeListOfTitles(map);
		});
		
	};
	$scope.typeaheadOnSelectTitle = function(title)
	// title is selected, find details and sections
	{
		$scope.loadingCourses = true;
		var titleLink = findMatchingTitleLink(title);
		var _detailsPromise = messageService.getCourseDetails(titleLink);
		_detailsPromise.then(function(d){
			setCourseDetails(d.data);
			$scope.loadingCourses = false;
			// now get course sections
			var courseSecPromise = messageService.getCourseSections(d.data);
			courseSecPromise.then(function(sec){
				//$scope.courseSections = sec;
				addCourseSections(sec);
			});
		});
	};
	$scope.toggleShowDetails = function(){
		$scope.showDetailsFlag = !$scope.showDetailsFlag;
	};
	$scope.clickDownload = function(){
		if(!$scope.coursesLists[$scope.activeTabPos].isEmpty()){// make sure we have courses added to the list
			messageService.postIcalendar($scope.coursesLists[$scope.activeTabPos]);
		}
		else{
			toaster.pop('warning', "Hold On!", "Please add courses to your schedule.");
		}
	}
	$scope.clickSave = function(){
		var postID = messageService.postSaveCourseScheduleList($scope.coursesLists[$scope.activeTabPos]);
		postID.then(function(a){
			$location.url('/index/'+a);
		});

	}
	$scope.newTapClick = function(e){
		if (e) {
	        e.preventDefault();
	        e.stopPropagation();
	      }
	      $scope.activeTabPos=$scope.coursesLists.nextList($scope.coursesLists.length-1);
	      getActiveTab().active = true;

	}
	$scope.printDiv = function(divName) {
		if(!$scope.coursesLists[$scope.activeTabPos].isEmpty()){// make sure we have courses added to the list
			 $scope.myCalendar.fullCalendar('option', 'height', 750); 
  			var printContents = document.getElementById(divName).innerHTML;
  			var originalContents = document.body.innerHTML;        
  			var popupWin = window.open('', '_blank', 'top=50, left=500, width=450,height=750');
 			 popupWin.document.open();
			  popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="//cdnjs.cloudflare.com/ajax/libs/fullcalendar/1.6.4/fullcalendar.print.css" media="print"/>  <link href="//cdnjs.cloudflare.com/ajax/libs/fullcalendar/1.6.4/fullcalendar.css" rel="stylesheet"></head><body onload="window.print()">' + printContents + '</html>');
 			 popupWin.document.close();
 			 $scope.myCalendar.fullCalendar('option', 'height', 400); 
 		 }
		else{
			toaster.pop('warning', "Hold On!", "Please add courses to your schedule.");
		}

}
  // --------- configuer calendar
  
  $scope.calendarOptions = {
       
          height: 400,
		 defaultView:'agendaWeek',
		 weekends: false, // will hide Saturdays and Sundays
          header:{
            left: '',
            center: '',
            right: ''
          },
		  minTime:'8:00',
		  eventClick: function(event){

		  	event.click();
		  	$scope.myCalendar.fullCalendar('rerenderEvents'); 

		  }
		 
      };
	  
	// --------- helper functions

	tempEvents.clear = function(){
		angular.forEach(tempEvents, function(evSrc){
			$scope.myCalendar.fullCalendar('removeEventSource', evSrc);
		});
	}
	var findMatchingTitleLink = function(title)
	// search in typeahead map to find a matching title and return it
	{
		var indx = 0;
		for (var i = $scope.typeaheadMap.length - 1; i >= 0; i--) {
			if($scope.typeaheadMap[i].title == title){
				indx=i;
				break;
			}
		};
		return $scope.typeaheadMap[i];
	}
	var makeListOfTitles = function(list)
	// filter array and return an array of titles
	{
		var cour=[];
			  angular.forEach(list, function(c){
				  cour.push(c.title);
			  });
		return cour;
	}
	var showConflictModal = function(details, callback)
		// trigger modal
	{
		$scope.$broadcast('openConflictModal', details, callback);
	}

	var removeTempEvents = function(secs){
		angular.forEach(secs, function(sec){
			if(sec.click)
				$scope.showTempSection(sec, null, false);
			$scope.myCalendar.fullCalendar('refetchEvents');
		});
	}
  var validateSections = function checkOneIsClicked(secs)
  // return true if at least one section is clicked
  {
	  var rtn = false;
  	  for(var i =0; i<secs.classes.length && !rtn; i++){
		  // if rtn hits true, it will break the loop and return true
			  rtn = secs.classes[i].click;
  	  }
	 return rtn;
  }
  var restoreSavedList = function(list)
  // accepts a saved courses list of details and sections, and generated eventsSources and attaches them
  {
  	if(!getActiveTab().isEmpty()){
  		SchedulerListService.clearLists();
  		$scope.coursesLists[$scope.activeTabPos].active = true;

  	}
  	angular.forEach(list, function(el){
  			$scope.addCourseSections(el.sections, el.details);

  	});
  }
  var registerSecClickCalbacks = function(secs){
  	$scope.$watch(function(){return secs.isopen;}, function(is){
  		console.log(is);
  		var _color;
  		if(is){
  			_color = "#1E5277";
  		}
  		else{
  			_color = "#5C92B7";
  		}

  		angular.forEach(secs.classes, function(clss){
  					if(clss.click){
  						clss.event.color = _color;
  					}
  			});
  	  	$scope.myCalendar.fullCalendar('rerenderEvents'); 

  	});
	secs.onClick=function(){
		 	secs.isopen = !secs.isopen;
	  		$scope.$digest();
	  		return secs.isopen;
		 	};
  };
  var checkAndClearCourseSections = function(){
  	if(!angular.isUndefined($scope.courseSections))
  		for (var i = 0; i < $scope.courseSections.length; i++) {
  		var sec = $scope.courseSections[i];
  		if(!sec.isPin){
  			//$scope.courseSections[i]=null;
  			$scope.courseSections.splice(i, 1);
  		}
  	};
  };
	var clearSearchInput = function(){
		$scope.courseDetailsFlag = false; // flag to enable details button - false to disable initially
		$scope.showDetailsFlag = false;
		$scope.courseDetails = null;
		//$scope.courseSections = null;
		checkAndClearCourseSections();
		$scope.selectedCourseTitle= null;
	};
	var addAlert = function(msg, type){
    $scope.alerts.push({msg: msg, 
    				type:type});
  };
	var addCourseSections = function(secs){

		if(!$scope.courseSections){
			$scope.courseSections=[];
		}
		else
			checkAndClearCourseSections();
		angular.forEach(secs, function(sec){
			$scope.courseSections.push(sec);
		});
	}
	var restoreSearchInput = function(details, sections){
		setCourseDetails(details);
		addCourseSections([sections]);
		$scope.selectedCourseTitle=sections.title;
	};
	var setCourseDetails = function(det)
	// set course details, and turn on flag
	{
		$scope.courseDetails = det;
		$scope.courseDetailsFlag = true;
	};
	var getActiveTab = function (){
		return $scope.coursesLists[$scope.activeTabPos];
	}
	
	
	$scope.$on('exportCal', function(event, args)
			// event fire when we return from export modal
	{
			console.log(args);
			if(args.cal)
				messageService.postCoursesList($scope.coursesLists[$scope.activeTabPos], args.cal);
			else if(args.title.val != ''){
				messageService.postCoursesNewList($scope.coursesLists[$scope.activeTabPos], args.title);
			}
	});
	
}]);
