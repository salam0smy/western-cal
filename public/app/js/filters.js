'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).filter('groupBy', function() {
    return function(items, groupedBy) {
        if (items) {
            var finalItems = [],
                thisGroup;
            for (var i = 0; i < items.length; i++) {
                if (!thisGroup) {
                    thisGroup = [];
                }
                thisGroup.push(items[i]);
                if (((i+1) % groupedBy) == 0) {
                    finalItems.push(thisGroup);
                    thisGroup = null;
                }
            };
            if (thisGroup) {
                finalItems.push(thisGroup);
            }
            return finalItems;
        }
    };
}).filter('courseTitleFilter', function(){
	return function(meventTitle){
		if(meventTitle){
		
			var finalItem = meventTitle.split("-")[0];  // course abbr e.g SE 4450 
			
			finalItem = finalItem+"";
			return finalItem;
		}
	}
}).filter('displayComponentSectionFilter', function(){
	return function(clss){
		if(clss){
			var finalObj ="";
			finalObj +=  clss.component + " " + clss.section;
			return finalObj;
		}
	};
}).filter('displayDaysTimeFilter', function(){
	return function(clss){
		if(clss){
			return clss.startT +" - "+ clss.endT;
		}
	}
}).filter('dayClassFilter', function(){
    return function(clss){
        return clss.days +" - " + clss.startT +" - "+ clss.endT + " - "+ clss.location;
    }
});
