dashboardApp.directive('weartestSurveys', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/surveys.html',
        controller: 'WeartestSurveyCtrl',
        link: function (scope, element, attrs) {
            scope.$watch('surveyFilter + loading', function () {
                if (angular.isUndefined(scope.surveyFilter) || scope.loading === true) {
                    return;
                }

                //Each time the survey filter changes, fetch the questions of the selected survey
                scope.getSelectedSurveyQuestions();

                scope.chartLimit = 3;

                scope.logLimit = 15;
            });

            //Watch the changes to the filters - update the export data in each case
            scope.$watch('userFilter + surveyFilter', function () {
                scope.prepareDataForExport();
            });
        }
    };
}
]);
