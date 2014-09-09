'use strict';

/*
 * angular-google-plus-directive v0.0.1
 * ♡ CopyHeart 2013 by Jerad Bitner http://jeradbitner.com
 * Copying is an act of love. Please copy.
 */

/*
 * angular-google-plus-directive v0.0.12 - modified
 * 2014 Modified by Salam Alyahya
*/

angular.module('directive.g+signin', []).
  directive('googlePlusSignin', function () {
  var ending = /\.apps\.googleusercontent\.com$/;

  return {
    restrict: 'E',
    template: '<span class="g-signin"></span>',
    replace: true,
    link: function (scope, element, attrs) {
      attrs.clientid += (ending.test(attrs.clientid) ? '' : '.apps.googleusercontent.com');

      attrs.$set('data-clientid', attrs.clientid);

      // Some default values, based on prior versions of this directive
      var defaults = {
        callback: 'signinCallback',
        cookiepolicy: 'single_host_origin',
        
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/plus.login',
        width: 'wide'
      };

      // Provide default values if not explicitly set
      angular.forEach(Object.getOwnPropertyNames(defaults), function(propName) {
        if (!attrs.hasOwnProperty('data-' + propName)) {
          attrs.$set('data-' + propName, defaults[propName]);
        }
      });

      // Asynchronously load the G+ SDK.
      (function() {
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/client:plusone.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
      })();
	  
    }
  };
}).run(['$window','$rootScope',function($window, $rootScope) {
  $window.signinCallback = function (authResult) {
    if (authResult && authResult.access_token){
		var _me;
		gapi.client.request({
					path:"/plus/v1/people/me",
					mathod:"GET"
				}).execute(function(a){_me = a;
					// fire event after loading profile information
				
			        $rootScope.$broadcast('event:google-plus-signin-success', authResult, _me);
					$rootScope.$apply();// tell angular that scope variables has changed by this event
				});
		
    } else {
      $rootScope.$broadcast('event:google-plus-signin-failure', authResult);
	 // $rootScope.$apply();// tell angular that scope variables has changed by this event
    }
  }; 
}]);


