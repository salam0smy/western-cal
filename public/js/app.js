'use strict';



// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.bootstrap',
  'ui.calendar',
  'ngAnimate',
  'toaster',
  'directive.g+signin',
  'angularSpinner'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/index', {templateUrl: 'app/partials/partial1.html', controller: 'MainCtrl'});
  $routeProvider.when('/index/:listId', {templateUrl: 'app/partials/partial1.html', controller: 'MainCtrl'});
  $routeProvider.when('/updatemap', {templateUrl:'app/partials/updateMap.html', controller:'updateMapController'});
  $routeProvider.otherwise({redirectTo: '/index'});
  
}]);

angular.module('myApp.controllers', []);
angular.module('myApp.services', []);
