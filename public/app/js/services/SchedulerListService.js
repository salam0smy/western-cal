'use strict';

angular.module('myApp.services').factory('SchedulerListService', function()
  // takes cares of a list of courses
  {
	  // local variables
	  var sortedSectionsList;
	  var sortedSectionsLists=[];
	  // ------ sortedsectionsLists array definition
	  sortedSectionsLists.nextList = function(i)
	  // get current position, advance and check if it exists, if not instansiate a new object
	  {
		  i++;
		  if(!sortedSectionsLists[i]){
		  	sortedSectionsLists[i]=new SectionsList();
		  }
		  return i;
	  }
	  var SectionsList = function SectionsList(det, secs){
		  this.eventSources = [];// hold a list after converting courses to events
		  if(det!=null && secs !=null){
		  	this.courses = [{details:det, sections:secs}]; // added courses
		  }
		else{
			this.courses = [];
		}
		this.isEmpty = function(){
			return this.eventSources.length<1;
			}
		this.clear = function(){
			this.eventSources.length =0;
			this.courses.length = 0;
		}
		this.remove = function(course){
			var thiz = this;
			var secNumber;
			angular.forEach(course.sections.classes, function(clss){
				if(clss.click) // remove events first
					{

						thiz.removeEvent(clss.event);

					}
			});
			this.removeCourse(course);
			}
		this.removeCourse = function(course){
			var index = this.courses.indexOf(course);
			if(index>-1){
				this.courses.splice(index, 1);
				}
			}
		this.removeEvent = function(ev){
			for (var i = 0; i < this.eventSources.length; i++) {
				var evnt = this.eventSources[i];
					if(evnt.id == ev.id)
						this.eventSources.splice(i, 1);
			};
			
			}
		  }// end SectionsList
	  // local methods
	  var init = function(){
	  	sortedSectionsLists.push(new SectionsList());
	  };
	  var clearLists = function(){
	  	angular.forEach(sortedSectionsLists, function(l){
	  		l.clear();
	  	});
	  	sortedSectionsLists.length = 0;
	  	init();
	  }
	  
	  var addSectionsAndDetails = function(secs, details, i)
	  // add this course
	  {
		  if(secs!=null && details!=null){// dont add null
			  if(!sortedSectionsLists[i]){
			  	sortedSectionsLists[i] = new SectionsList(details, secs);
		  }
			  else{
		  	sortedSectionsLists[i].courses.push({details:details, sections:secs});
		  }
	  }
	  }
	  
	  	  // factory exposes these services
	  return{ 
		  getSortedSectionsList:sortedSectionsList,
		  addSectionsAndDetails:addSectionsAndDetails,
		  init:init,
		  sortedSectionsLists:sortedSectionsLists,
		  clearLists:clearLists
	  };
	
	
  });