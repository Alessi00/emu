'use strict';


angular.module('emuwebApp')
.directive('bundleListSideBar', function ($animate) {
	return {
		templateUrl: 'views/bundleListSideBar.html',
		restrict: 'E',
		link: function postLink(scope, element, attr) {

			scope.$watch('vs.submenuOpen', function () {

				var dotMs = scope.vs.getTransitionTime();

				var transcss = {
					'-webkit-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
					'-moz-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
					'-ms-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
					'-o-transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out',
					'transition': 'width ' + dotMs + 's ease-in-out, left ' + dotMs + 's ease-in-out,right ' + dotMs + 's ease-in-out'
				};

				// alert("sdfsdf")
				element.css(transcss);
			// $('#menu-bottom').css(transcss);
			// $('#menu').css(transcss);			
			// $('#TimelineCtrl').css(transcss);
            // $('#HandleLevelsCtrl').css(transcss);
            $('#mainWindow').css(transcss);            
            if(scope.vs.submenuOpen) {

               $animate.addClass($('#mainWindow'), '.slideInBody');
               $animate.addClass(element, '.slideInSubmenu');
               // $animate.addClass($('#menu-bottom'), '.slideInBody');
               // $animate.addClass($('#TimelineCtrl'), '.slideInBody');
               // $animate.addClass($('#HandleLevelsCtrl'), '.slideInBody');
           }
           else {
           		$animate.removeClass($('#mainWindow'), '.slideInBody');
           		// alert("else");
               $animate.removeClass(element, '.slideInSubmenu');
               // $animate.removeClass($('#menu-bottom'), '.slideInBody');
               // $animate.removeClass($('#menu'), '.slideInBody');
               // $animate.removeClass($('#TimelineCtrl'), '.slideInBody');
               // $animate.removeClass($('#HandleLevelsCtrl'), '.slideInBody');
           }
       }, true);
}
};
});

// simple animation to add slideLeft class
angular.module('emuwebApp').animation(".slideInSubmenu", function () {
	return {
		addClass: function (element, className) {
			element.addClass('cbp-spmenu-open');
		},
		removeClass: function (element, className) {
			element.removeClass('cbp-spmenu-open');
		}
	}
});

// simple animation to add slideLeft class
angular.module('emuwebApp').animation(".slideInBody", function () {
	return {
		addClass: function (element, className) {
			element.addClass('cbp-spmenu-left-toright');
		},
		removeClass: function (element, className) {
			element.removeClass('cbp-spmenu-left-toright');
		}
	}
});