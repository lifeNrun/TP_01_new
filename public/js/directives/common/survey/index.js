dashboardApp.directive('surveyIndex', [
function () {
    'use strict';

    return {
        restrict: 'E',
        templateUrl: '/partials/restricted/common/survey/index.html',
        scope: true,
        controller: 'SurveyIndexCtrl'
    };
}
]);
