'use strict';

angular.module('myApp.services').service('SessionService', function(){
    var userIsAuthenticated = false;
	var token = null;
    this.setUserAuthenticated = function(value){
        userIsAuthenticated = value;
    };
	this.setToken = function(value){
		token=value;
	}
	this.getToken = function(){
		return token;
	}
    this.getUserAuthenticated = function(){
        return userIsAuthenticated;
    };
	this.signOut = function(){
		gapi.auth.signOut();	
	};
});