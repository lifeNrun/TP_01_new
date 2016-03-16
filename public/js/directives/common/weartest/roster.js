dashboardApp.directive('weartestRoster', ['$timeout',
function ($timeout) {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/roster.html',
        controller: 'WeartestRosterCtrl',
        link: function (scope, element, attrs) {
            var displayResults;

            scope.$watch(function () {
                return scope.addTesterFilterInput.length + (scope.loadingTesterUsers).toString();
            }, function () {
                if (displayResults) {
                    $timeout.cancel(displayResults);

                    displayResults = undefined;
                }

                if (scope.addTesterFilterInput.length > 0 && !scope.loadingTesterUsers) {
                    displayResults = $timeout(function () {
                        scope.showTesterResults = true;
                    }, 700);                    
                } else {
                    scope.showTesterResults = false;
                }
            });
        }
    };
}
]);
