dashboardApp.controller('SurveyIndexCtrl', ['$scope', '$routeParams',
function ($scope, $routeParams) {
    'use strict';

    var section = $routeParams['section'];

    $scope.isEditMode = function () {
        return section === 'edit';
    };
}
]);
