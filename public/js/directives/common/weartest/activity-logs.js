dashboardApp.directive('weartestActivityLogs', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/activity-logs.html',
        controller: 'WeartestActivityLogsCtrl',
        link: function (scope, element, attrs) {
            scope.$watch('searchText', function () {
                if (angular.isUndefined(scope.searchText.userId)) {
                    return;
                }

                //Prepare the activity logs for export
                scope.prepareDataForExport();
            }, true);
        }
    };
}
]);
