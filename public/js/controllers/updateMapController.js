'use strict';


angular.module('myApp.controllers').controller('updateMapController', ['$scope', '$http','$location', function($scope, $http, $location){
	$http.get('/updateCoursesList').then(function(res){
		$scope.updateMap = res.data;
	});
	$scope.go = function ( path ) {
  		$location.path( path );
		};
}])