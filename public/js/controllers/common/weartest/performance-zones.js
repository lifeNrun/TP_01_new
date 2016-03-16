dashboardApp.controller('WeartestPerformanceZoneCtrl', ['$scope', '$http', '$routeParams', 'notificationWindow', 'loginState',
function ($scope, $http, $routeParams, notificationWindow, loginState) {
    'use strict';

    var weartestId = $routeParams['itemId'],
        path,
        projection;

    $scope.weartest = {};

    $scope.productImages = [];

    $scope.imageDataPoints = [];

    $scope.testerDetails = [];

    $scope.filter = {
        color: 'All',
        user: 'All'
    };

    $scope.sortBy = {
        column: 'date',
        reverse: true,
        limit: 5
    };

    $scope.userDetails = {};

    $scope.primaryImage = {};

    //Get details on participants of weartest (on team participants)
    var getTesterDetails = function () {
        var path,
            projection,
            query,
            participantLength,
            participantIds = [],
            i;

        participantLength = $scope.weartest.participants.length;

        for (i = 0; i < participantLength; i++) {
            if ($scope.weartest.participants[i].status === 'on team') {
                participantIds.push($scope.weartest.participants[i].userIdkey);
            }
        }

        if (participantIds.length === 0) {
            return;
        }

        path = '/api/mesh01/users';

        query = {
            '_id': {
                '$in': participantIds
            }
        };

        path += '?query=' + JSON.stringify(query);

        projection = {
            '_id': 1,
            'username': 1
        };

        path += '&projection=' + JSON.stringify(projection);

        notificationWindow.show('Retrieving details on participants of product test', true);

        $http.get(path)
            .success(function (result) {
                if (angular.isArray(result)) {
                    $scope.testerDetails = result;

                    //Add all users as a category too
                    $scope.testerDetails.push({
                        _id: 'All',
                        username: 'All Testers'
                    });

                    notificationWindow.show('Details on product test participants retrieved successfully', false);
                } else {
                    notificationWindow.show('Error. Could not retrieve details of participants', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve details of participants', false);
            });
    };

    //Get the product images of the weartest and also the data points
    //for each image
    var getImagesetDetailsOfWeartest = function () {
        var path,
            projection;

        $scope.productImages = [];

        $scope.imageDataPoints = [];

        path = '/api/mesh01/imagesets/' + $scope.weartest.imageSetId;

        projection = {
            '_id': 1,
            'images': 1
        };

        path += '?projection=' + JSON.stringify(projection);

        notificationWindow.show('Retrieving details of image collection associated with product test', true);

        $http.get(path)
            .success(function (result) {
                var imagesLength,
                    i;

                if (result._id === $scope.weartest.imageSetId) {
                    imagesLength = result.images.length;

                    for (i = 0; i < imagesLength; i++) {
                        if (result.images[i].type === 'productImage') {
                            $scope.productImages.push(result.images[i]);

                            $scope.imageDataPoints = $scope.imageDataPoints.concat(result.images[i].dataPoints);
                        }
                    }

                    if ($scope.productImages.length > 0) {
                        $scope.setPrimaryImage($scope.productImages[0]);

                        getTesterDetails();
                    } else {
                        notificationWindow.show('This product test has no product images', false);
                    }
                } else {
                    notificationWindow.show('Error. Could not retrieve the details of the image collection associated with the product test', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve the details of the image collection associated with the product test', false);
            })
    };

    loginState.getLoginState(function (data) {
        $scope.userDetails = data.userInfo;
    });

    path = '/api/mesh01/weartest/' + weartestId;

    projection = {
        '_id': 1,
        'imageSetId': 1,
        'participants': 1
    };

    path += '?projection=' + JSON.stringify(projection);

    notificationWindow.show('Retrieving details of product test...', true);

    //Get the weartest details
    $http.get(path)
        .success(function (result) {
            if (result._id === weartestId) {
                $scope.weartest = result;

                getImagesetDetailsOfWeartest();
            } else {
                notificationWindow.show('Error. Could not retrieve the details of the product test', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error. Could not retrieve the details of the product test', false);
        });

    //Sets the primary image
    $scope.setPrimaryImage = function (image) {
        $scope.primaryImage = image;
    };

    //Returns the count of positive Data Points
    $scope.getPositiveDataPoints = function (dataPoints) {
        var count = 0,
            i;

        if (angular.isUndefined(dataPoints)) {
            return count;
        }

        //All data points with color 'Green' are positive
        for (i = 0; i < dataPoints.length; i++) {
            if (dataPoints[i].color === 'Green') {
                count += 1;
            }
        }

        return count;
    };

    //Returns the count of negative Data Points
    $scope.getNegativeDataPoints = function (dataPoints) {
        var count = 0,
            i;

        if (angular.isUndefined(dataPoints)) {
            return count;
        }

        //All data points with color 'Red' are negative
        for (i = 0; i < dataPoints.length; i++) {
            if (dataPoints[i].color === 'Red') {
                count += 1;
            }
        }

        return count;
    };

    //Checks if the image is the primary image or not
    $scope.isPrimaryImage = function (imageId) {
        if (imageId === $scope.primaryImage._id) {
            return true;
        } else {
            return false;
        }
    };

    //Returns the username for the userID field provided - user has to be an "on team" participant
    $scope.getUserNameForId = function (userId) {
        var i;

        for (i = 0; i < $scope.testerDetails.length; i++) {
            if ($scope.testerDetails[i]._id === userId) {
                return $scope.testerDetails[i].username;
            }
        };
    };

    //Returns the status of the feedback
    $scope.getFeedbackStatus = function (pointColor) {
        if (pointColor === 'Red') {
            return 'Negative';
        } else if (pointColor === 'Green') {
            return 'Positive';
        } else if (pointColor === 'All') {
            return 'All Feedback';
        }
    };

    //Current sort by column
    $scope.changeSortOrder = function (sortByColumn) {
        //If the sortByColumn is the current column that we are sorting
        //by, then toggle the ascending / descending sort feature
        if ($scope.sortBy.column === sortByColumn) {
            $scope.sortBy.reverse = !$scope.sortBy.reverse;
        } else {
            $scope.sortBy.column = sortByColumn;
            $scope.sortBy.reverse = false;
        }
    };

    //Check if the column provided is the sort by column
    $scope.checkSortOrder = function (sortByColumn, sortNature) {
        if ($scope.sortBy.column === sortByColumn) {
            //Check the ascending nature
            if ($scope.sortBy.reverse === false && sortNature === 'ascending') {
                return true;
            } else if ($scope.sortBy.reverse === true && sortNature === 'descending') {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    //Custom filter to display the data points based on the user
    $scope.customFilter = function (dataPointEntry) {
        if ($scope.filter.user === 'All') {
            if ($scope.filter.color === 'All') {
                return true;
            } else if ($scope.filter.color === dataPointEntry.color) {
                return true;
            } else {
                return false;
            }
        } else if ($scope.filter.user === dataPointEntry.userId) {
            if ($scope.filter.color === 'All') {
                return true;
            } else if ($scope.filter.color === dataPointEntry.color) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    //Returns the name of the Image to which the provided data point is associated with
    $scope.getImageForPoint = function (dataPointId) {
        var productImagesLength,
            dataPointsLength,
            i, j;

        productImagesLength = $scope.productImages.length

        for (i = 0; i < productImagesLength; i++) {
            dataPointsLength = $scope.productImages[i].dataPoints.length;

            for (j = 0; j < dataPointsLength; j++) {
                if ($scope.productImages[i].dataPoints[j]._id === dataPointId) {
                    return $scope.productImages[i].name;
                }
            }
        }
    };

    //Returns the status of the Data Point based on the color
    $scope.getDataPointStatus = function (pointColor) {
        if (pointColor === 'Red') {
            return 'Bad';
        } else if (pointColor === 'Green') {
            return 'Good';
        }
    };

    //Returns the predicate for sorting
    $scope.predicate = function (dataPointEntry) {
        var i, j;

        switch ($scope.sortBy.column) {
            case 'date':
                return dataPointEntry.createdDate;

            case 'user':
                return $scope.getUserNameForId(dataPointEntry.userId);

            case 'imageName':
                //Find the image corresponding to the data point
                for (i = 0; i < $scope.productImages.length; i++) {
                    for (j = 0; j < $scope.productImages[i].dataPoints.length; j++) {
                        if ($scope.productImages[i].dataPoints[j]._id === dataPointEntry._id) {
                            return $scope.productImages[i].name;
                        }
                    }
                }

                break;

            case 'type':
                return dataPointEntry.color;

            case 'note':
                return dataPointEntry.comment;
        }
    };

    $scope.increaseCommentLimit = function () {
        if ($scope.sortBy.limit > $scope.imageDataPoints.length) {
            return;
        }

        $scope.sortBy.limit += 10;
    };
}
]);
