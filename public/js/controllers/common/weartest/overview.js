dashboardApp.controller('WeartestOverviewCtrl', ['$scope', '$http', '$routeParams', 'notificationWindow',
function ($scope, $http, $routeParams, notificationWindow) {
    'use strict';

    var weartestId = $routeParams['itemId'],
        path = '/api/mesh01/weartest/' + weartestId,
        projection = {
            '_id': 1,
            'imageSetId': 1,
            'wearTestOverview': 1,
            'expectationsOverview': 1
        };

    path += '?projection=' + JSON.stringify(projection);

    $scope.weartest = {};

    $http.get(path)
        .success(function (result) {
            if (result._id === weartestId) {
                $scope.weartest = result;
            } else {
                notificationWindow.show('Error while retrieving product test', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error while retrieving product test', false);
        });
}
]);
