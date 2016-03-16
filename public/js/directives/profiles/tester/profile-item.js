dashboardApp.directive('testerBio', [function () {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			answerActivitySurvey: '&'
		},
		templateUrl: '/partials/restricted/profiles/tester/profile-bio.html',
		controller: 'TesterProfileBioCtrl'
	};
}]);

dashboardApp.directive('viewEditSurvey', [function () {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			surveyDetails: '=',
			surveyName: '@',
			updateSurveyInfo: '&'
		},
		templateUrl: '/partials/restricted/profiles/tester/profile-submitted-survey.html',
		link: function (scope, iElement, iAttr) {
			//Keep a watch over the submitted-survey details.
			//Each time it changes, update the clone too
			scope.$watch('surveyDetails', function () {
				angular.copy(scope.surveyDetails, scope.surveyDetailsClone);
			});
		},
		controller: 'TesterProfileSubmittedSurveyCtrl'
	};
}]);
