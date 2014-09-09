'use strict';


// ---------- controllers for conflict course popup Modal
var ModalConflictCtrl = function($scope, $modal) {
	//-- register event
	$scope.$on('openConflictModal', function(event, data, callback){
		$scope.open({callback:callback, details:data});
	});

	$scope.open = function(args) {
		$scope.callback = args.callback;
		$scope.coreq = args.details.corequisite;
		//$scope.coreq = callback.;
		var modalInstance = $modal.open({
      templateUrl: 'app/partials/conflict-modal.html',
      controller: function($scope, $rootScope, $modalInstance, $log, callback, coreq){
      		$scope.coreq = coreq;
			$scope.ignoreClick = function () {
  		 		callback(false);
    	 		$modalInstance.dismiss('cancel');
    		};
    		$scope.newListClick = function(){
    			callback(true);
    	 		$modalInstance.dismiss('cancel');	
    		}
  
    		$scope.printConflictClick = function(){
    			var conflictFormLink = "http://www.eng.uwo.ca/undergraduate/forms/TimetableConflictForm.pdf";
    			window.open(conflictFormLink); // open a new tap with this link
    		}
  			$scope.cancel = function () {
   			 		$modalInstance.dismiss('cancel');
			};
		},
        backdrop: true,
   		 windowClass: 'modal',
       resolve: {
                callback: function(){
                	return $scope.callback;
                },
                coreq: function(){
                	return $scope.coreq;
                }
            }
    });
	};
};


// -------- controllers for export to google calendar popup Modal
var ExportModalCtrl = function ($scope, $modal, toaster) {
	$scope.$on('exportClick', function(event, data){
		if(data.isAuth && !data.isEmpty)
			$scope.open({val:''});
		else if(!data.isAuth)
		 toaster.pop('warning', "Hold On!", "Please Sign-in");
		 else if(data.isEmpty)
		 toaster.pop('warning', "Hold On!", "Please Add courses to your schedule");
	});
  $scope.open = function (title) {
	$scope.title = title;
    var modalInstance = $modal.open({
      templateUrl: 'app/partials/export-modal.html',
      controller: 'ModalInstanceCtrl',
            backdrop: true,
            windowClass: 'modal',
       resolve: {
                title: function () {
                    return $scope.title;
                }
            },
        
    });
  };
};

var ModalInstanceCtrl = function ($scope, $rootScope, $modalInstance,$log, messageService, title) {
	$scope.userCals = null;
	
	$scope.init = function(){
		$scope.newcal=false;
		var promise = messageService.getCalendarList();
    promise.then(function(ret){
      var a = ret.data;
       $scope.userCals=a.items; // get the user's current calendars
       $scope.selectedCal = null;
       $scope.title= title;
    });
	};
	
	$scope.onSelect = function(item){
		if(item){
	   	console.log(item);
		  $scope.selected = item;
		  $scope.modalBg = item.backgroundColor;
		}
	};
	$scope.addClick = function(){
		$scope.newcal=!$scope.newcal;
		$log.log(title);
		$scope.modalBg='';
		$scope.selected=null;
	}
  	$scope.ok = function () {
  		 if($scope.selected || ($scope.newcal && $scope.title)){
  	    	 $rootScope.$broadcast('exportCal', {
    	 	cal:$scope.selected,
    	 	title:$scope.title

    	 });
    	 $modalInstance.dismiss('cancel');
    	}
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};