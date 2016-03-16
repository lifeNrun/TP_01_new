dashboardApp.directive('weartestMode', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/mode.html',
        controller: 'WeartestModeCtrl'
    };
}
]);
