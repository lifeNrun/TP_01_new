dashboardApp.directive('weartestHeader', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/header.html',
        controller: 'WeartestHeaderCtrl'
    };
}
]);
