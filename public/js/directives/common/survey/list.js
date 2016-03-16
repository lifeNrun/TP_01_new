dashboardApp.directive('surveyList', [
function () {
    'use strict';

    return {
        restrict: 'E',
        templateUrl: '/partials/restricted/common/survey/list.html',
        scope: true,
        controller: 'SurveyListCtrl'
    };
}
]);
