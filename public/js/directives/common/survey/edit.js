dashboardApp.directive('surveyEdit', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/survey/edit.html',
        controller: 'SurveyEditCtrl'
    };
}
]);
