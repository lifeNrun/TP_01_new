dashboardApp.directive('weartestList', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/list.html',
        controller: 'WeartestListCtrl'
    };
}
]);
