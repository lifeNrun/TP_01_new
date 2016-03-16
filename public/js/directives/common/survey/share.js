dashboardApp.directive('surveyShare', [
function () {
    'use strict';

    return {
        restrict: 'E',
        templateUrl: '/partials/restricted/common/survey/share.html',
        controller: 'SurveyShareCtrl'
    };
}
]);
