dashboardApp.controller('WeartestIndexCtrl', ['$routeParams', '$scope',
function ($routeParams, $scope) {
    'use strict';

    var type = $routeParams['mode'],
        section = $routeParams['section'],
        weartestId = $routeParams['itemId'];

    $scope.showWeartestList = function () {
        if (weartestId) {
            return false;
        }

        return true;
    };

    $scope.showWeartestSection = function (sectionName) {
        if (section && section === sectionName) {
            return true;
        }

        return false;
    };
}
]);
