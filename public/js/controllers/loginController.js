'use strict';

/* Controllers */

angular.module('myApp.controllers').controller('loginController', ['$scope','SessionService', function($scope, SessionService){
	$scope.isUserAuth = false;
	$scope.authUser = {};
	$scope.authUser.logout = function(){
		SessionService.signOut();
	};
	$scope.$on('event:google-plus-signin-success', function (event,authResult, me) {
			console.log("login succes");
			var token = authResult.access_token;
			SessionService.setToken(token);
			SessionService.setUserAuthenticated(true);
			$scope.isUserAuth = true;
			$scope.authUser.displayName = me.displayName;
			$scope.authUser.picURL = me.image.url;
			
			
			//$scope.$apply(); // tell angular that scope variables has changed by this event
	  });
		  $scope.$on('event:google-plus-signin-failure', function (event,authResult) {
			    // Auth failure or signout detected
				$scope.isUserAuth = false;
				SessionService.setUserAuthenticated(false);
			//	$scope.$apply(); // tell angular that scope variables has changed by this event
				
		  });

	
}])