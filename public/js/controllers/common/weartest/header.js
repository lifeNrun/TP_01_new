dashboardApp.controller('WeartestHeaderCtrl', ['$scope', '$routeParams', '$http', 'notificationWindow',
function ($scope, $routeParams, $http, notificationWindow) {
    'use strict';

    var weartestId = $routeParams['itemId'],
        weartestMode = $routeParams['mode'],
        weartestSection = $routeParams['section'],
        weartestSubSection = $routeParams['subSection'],
        path = '/api/mesh01/weartest/' + weartestId,
        projection = {
            '_id': 1,
            'name': 1,
            'identification': 1,
            'productType': 1,
            'requiredNumberofTesters': 1,
            'wearTestStartDate': 1,
            'wearTestEndDate': 1,
            'imageSetId': 1,
            'productSurveys': 1,
            'productWearAndTearDates': 1,
            'performanceZonesDates': 1,
            'participants': 1,
            'rating': 1,
            'automaticRating': 1
        },
        tabNameToRetunTo = {
            current: 'My Current Tests',
            draft: 'Draft Tests',
            closed: 'Closed Tests'
        };

    path += '?projection=' + JSON.stringify(projection);

    $scope.weartest = {};

    $scope.surveyPercentage = 0;

    $scope.wearTearPercentage = 0;

    $scope.performanceZonePercentage = 0;

    //Get the rating for the weartest
    var getWeartestRating = function () {
        $http.get('/api/misc/weartest/' + weartestId + '/ratings')
            .success(function (result) {
                if (angular.isObject(result)) {
                    $scope.weartestRating = result.rating;
                }
            });
    };

    //Calculates the # of 'On Team' participants
    var getOnTeamParticipants = function () {
        var onTeamParticipantsCount = 0,
            i;

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            if ($scope.weartest.participants[i].status === 'on team') {
                onTeamParticipantsCount += 1;
            }
        }

        return onTeamParticipantsCount;
    };

    //Calculates the % of survey, product images and performance zone completion
    var calculatePercentages = function () {
        var path = '/api/mesh01/surveys_submitted',
            query = {
                'weartestId': $scope.weartest._id
            },
            projection = {
                '_id': 1
            };

        path += '?query=' + JSON.stringify(query);

        path += '&projection=' + JSON.stringify(projection);

        $http.get(path)
            .success(function (result) {
                if (angular.isArray(result)) {
                    $scope.surveyPercentage = result.length / ($scope.weartest.productSurveys.length * getOnTeamParticipants());
                } else {
                    notificationWindow.show('Error calculating % of survey completion');
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error calculating % of survey completion');
            });

        path = '/api/mesh01/imagesets/' + $scope.weartest.imageSetId;

        projection = {
            '_id': 1,
            'images': 1
        };

        path += '?projection=' + JSON.stringify(projection);

        $http.get(path)
            .success(function (result) {
                var wearTearCount = 0,
                    performanceZoneCount = 0,
                    i;

                if (result._id === $scope.weartest.imageSetId) {
                    for (i = 0; i < result.images.length; i++) {
                        if (result.images[i].type === 'wearAndTear') {
                            wearTearCount += 1;
                        }

                        performanceZoneCount += result.images[i].dataPoints.length;
                    }

                    if ($scope.weartest.productWearAndTearDates.length > 0) {
                        $scope.wearTearPercentage = wearTearCount / ($scope.weartest.productWearAndTearDates.length * getOnTeamParticipants());
                    } else {
                        $scope.wearTearPercentage = 0;
                    }

                    if ($scope.weartest.performanceZonesDates.length > 0) {
                        $scope.performanceZonePercentage = performanceZoneCount / ($scope.weartest.performanceZonesDates.length * getOnTeamParticipants());
                    } else {
                        $scope.performanceZonePercentage = 0;
                    }
                } else {
                    notificationWindow.show('Error while calculating % of Product Images and Performance Zone completion', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error while calculating % of Product Images and Performance Zone completion', false);
            });
    };

    $http.get(path)
        .success(function (result) {
            if (result._id === weartestId) {
                $scope.weartest = result;

                calculatePercentages();

                if ($scope.weartest.automaticRating) {
                    getWeartestRating();
                } else {
                    $scope.weartestRating = $scope.weartest.rating;
                }
            } else {
                notificationWindow.show('Error while retrieving product test details', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error while retrieving product test details', false);
        });

    $scope.getNameOfTabToReturnTo = function () {
        return tabNameToRetunTo[weartestMode];
    };

    $scope.getUrlOfTabToReturnTo = function () {
        return '/dashboard/weartests/' + weartestMode;
    };

    $scope.isSectionActive = function (section, subSection) {
        if (subSection) {
            return section === weartestSection && subSection === weartestSubSection;
        } else {
            return section === weartestSection;
        }
    };

    $scope.getUrlOfWeartestSection = function (section, subSection) {
        var url = '/dashboard/weartests/' + weartestMode + '/' + weartestId + '/' + section;

        if (subSection) {
            url += '/' + subSection;
        }

        return url;
    };
}
]);
