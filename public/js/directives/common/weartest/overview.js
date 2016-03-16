dashboardApp.directive('weartestOverview', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/overview.html',
        controller: 'WeartestOverviewCtrl'
    };
}
]);
