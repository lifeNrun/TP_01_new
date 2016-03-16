dashboardApp.directive('surveyMode', [
function () {
    'use strcit';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/survey/mode.html',
        controller: 'SurveyModeCtrl'
    };
}
]);
