dashboardApp.directive('weartestWearandtear', [
    function () {
        'use strict';

        return {
            restrict: 'E',
            scope: true,
            templateUrl: '/partials/restricted/common/weartest/wear-and-tear.html',
            controller: 'WeartestWearandtearCtrl'
        };
    }
]);
