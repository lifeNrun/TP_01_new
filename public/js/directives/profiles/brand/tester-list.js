dashboardApp.directive('testerList', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/profiles/brand/tester-list.html',
        controller: 'TesterListCtrl'
    };
}
]);
