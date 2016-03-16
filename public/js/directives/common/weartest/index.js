dashboardApp.directive('weartestIndex', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/index.html',
        controller: 'WeartestIndexCtrl'
    };
}
]);
