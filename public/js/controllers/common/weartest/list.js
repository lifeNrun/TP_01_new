dashboardApp.controller('WeartestListCtrl', ['$scope', '$location', '$http', 'WTServices', 'async', 'notificationWindow',
function ($scope, $location, $http, WTServices, async, notificationWindow) {
    'use strict';
    var weartestId;
    notificationWindow.show('Retrieving all product tests...', true);

    var path = $location.path(),
        hierarchy = path.split('/'),
        //Remove any query paramters before reading the last node
        weartestMode = hierarchy[hierarchy.length - 1].split('?')[0],
        weartestProjection = {
            '_id': 1,
            'status': 1,
            'imageSetId': 1,
            'identification': 1,
            'name': 1,
            'rating':1,
            'brand': 1,
            'registrationStart': 1,
            'registrationDeadline': 1,
            'wearTestStartDate': 1,
            'wearTestEndDate': 1,
            'productType': 1,
            'activity': 1,
            'automaticRating': 1
        },
        allWeartests = [],
        orderWeartestsBy = {},
        imageset = {},
        redCount = 0,
        greenCount = 0,
        circleColor = [];

    $scope.productImages = [];

    $scope.weartestFilter = '';

    $scope.shownWeartests = [];

    $scope.predicate = "registrationStart";

    //Default sort order is descending
    $scope.reverse = true;

    $scope.weartestDisplayLimit = 10;

    $scope.loadingInitialWeartests = true;

    $scope.loadingInitialCircles = true;
    
    $scope.alwaysHide = true;

    $scope.loadingAllWeartests = true;

    orderWeartestsBy[$scope.predicate] = -1;

    $scope.showConfirmDeleteModal = false;

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };
	$scope.weartestRating = 1;
    $scope.weartestToDelete = {};
    $scope.weartest = {};

    var getWeartestRating = function () {
         $http.get('/api/misc/weartest/' +  $scope.weartest._id + '/ratings')
         .success(function (result) {
                 if (angular.isObject(result)) {
                     $scope.weartest.rating = result.rating;;// result.rating;
                     console.log("After change In getWeartestRating id = "+$scope.weartest._id+" rating = "+$scope.weartest.rating);
                     $scope.shownWeartests.push($scope.weartest);
                     $scope.loadingAllWeartests = false;
                 }
             });
    };
    var adjustShownWeartests = function () {
        var allWeartestsLength = allWeartests.length,
            shownWeartestsLength = $scope.shownWeartests.length,
            weartestIsShown,
            i,
            j;
        console.log("shownWeartestsLength = "+shownWeartestsLength+",  allWeartestsLength = "+allWeartestsLength);
        if (shownWeartestsLength >= allWeartestsLength) {
            $scope.loadingAllWeartests = false;
            return;
        }
        for (i = 0; i < allWeartestsLength; i++) {
            weartestIsShown = false;
            for (j = 0; j < shownWeartestsLength; j++) {
                if ($scope.shownWeartests[j]._id === allWeartests[i]._id) {
                    weartestIsShown = true;
                    break;
                }
            }
            if (!weartestIsShown) {
                if(allWeartests[i].automaticRating){
                    $scope.weartest = allWeartests[i];
                    getWeartestRating();
                }
                else{
                    $scope.shownWeartests.push(allWeartests[i]);
                }
            }
        }
        console.log("adjustShownWeartests");
        $scope.loadingAllWeartests = false;
    };
    var adjustShownWeartests2 = function(){
        var i,shownWeartestsLength =  allWeartests.length;
        for(i = 0; i < shownWeartestsLength;i++){
            if(allWeartests[i].automaticRating){
                $scope.weartest = allWeartests[i];
                getWeartestRating();
            }
            else{
                $scope.shownWeartests.push(allWeartests[i]);
            }
        }
        console.log("adjustShownWeartests2");
    };
    var getWeartestRecords = function (query, limit) {
        var path = '/api/mesh01/weartest',
        circleColor,
        i;
        query = query || {};
        //A limit of 0 indicates all records
        limit = limit || 0;

        path += '?query=' + JSON.stringify(query);

        path += '&limit=' + limit;

        path += '&projection=' + JSON.stringify(weartestProjection);

        path += '&orderBy=' + JSON.stringify(orderWeartestsBy);

        if (limit !== 0) {
            getWeartestRecords(query);
            if ($scope.loadingInitialWeartests) {
               setCircleColor();
            } 
        }

        (function (query, limit, path) {
            $http.get(path)
                .success(function (result) {
                    if (angular.isArray(result)) {
                        if (limit === 0) {
                            allWeartests = result.slice(0);
                            adjustShownWeartests();
                            notificationWindow.show('Loading Complete', false);
                        } else if (result.length > allWeartests.length) {
                            allWeartests = result.slice(0);
                            console.log("in getWeartestRecords length = "+allWeartests.length);
                            adjustShownWeartests2();
                            //$scope.shownWeartests = result.slice(0);
                            //console.log("loadingInitialWeartests false");
                            $scope.loadingInitialWeartests = false;
                        } else {
                            $scope.loadingInitialWeartests = false;
                        }
                    } else {
                        notificationWindow.show('Error. Could not retrieve product tests', false);
                    }
                })
                .error(function (err) {
                    console.log(err);

                    notificationWindow.show('Error. Could not retrieve product tests', false);
                });
        })(query, limit, path);
    };

    var setCircleColor = function () {
        var path = '/api/mesh01/imagesets/',
            query = {
                'images.type': 'productImage'
            },
            projection = {
                '_id': 1,
                'images': 1
            },
            i,
            j,
            k,
            l,
            imageId,
            imageColor,
            sortOrder;;

        path += '?query=' + JSON.stringify(query);

        path += '&projection=' + JSON.stringify(projection);
        
        $http.get(path)
            .success(function (result) {
                if (angular.isArray(result)) {
                    imageset = result;

                    for (i = 0; i < imageset.length; i++) {
                        //Filter out the product images and count the Red and Green data points
                        redCount = 0;
                        greenCount = 0;
                
                        for (j = 0; j < imageset[i].images.length; j++) {
                            if (imageset[i].images[j].type === 'productImage') {
                                for (k = 0; k < imageset[i].images[j].dataPoints.length; k++) {
                                    if (imageset[i].images[j].dataPoints[k].color === 'Red') {
                                        redCount++;
                                    }
                                    if (imageset[i].images[j].dataPoints[k].color === 'Green') {
                                        greenCount++;
                                    }
                                }
                            }
                        }
                        
                        imageId = imageset[i]._id;
                        if (redCount ===0 && greenCount === 0) {
                             //Green
                             imageColor = '/img/dot-green.png';
                             sortOrder = 1;
                        } else if (redCount > greenCount) {
                             //Red
                             imageColor = '/img/dot-red.png';
                             sortOrder = 3;
                        } else if (greenCount / (greenCount + redCount) >= 0.75){
                             //Green
                             imageColor = '/img/dot-green.png';
                             sortOrder = 1;
                        } else {
                             //Yellow
                             imageColor = '/img/dot-yellow.png';
                             sortOrder = 2;
                        }
                     	  circleColor.push(imageId,imageColor);

                        // Set circleSortOrder in allWeartests for current imageID
                        for (l = 0; l < allWeartests.length; l++) {
                        	  if (allWeartests[l].imageSetId === imageId) {
               	                allWeartests[l].circleSortOrder = sortOrder;
               	            }
                        }

                        // Default Sort Order to 1 (Green) if no Performance Zone images were found
                        for (l = 0; l < allWeartests.length; l++) {
                        	  if (!allWeartests[l].circleSortOrder) {
               	                allWeartests[l].circleSortOrder = 1;
               	            }
                        }

                        // Set circleSortOrder in shownWeartests for current imageID
                        for (l = 0; l < $scope.shownWeartests.length; l++) {
                        	  if ($scope.shownWeartests[l].imageSetId === imageId) {
               	                $scope.shownWeartests[l].circleSortOrder = sortOrder;
               	            }
                        }

                        // Default Sort Order to 1 (Green) if no Performance Zone images were found
                        for (l = 0; l < $scope.shownWeartests.length; l++) {
                        	  if (!$scope.shownWeartests[l].circleSortOrder) {
               	                $scope.shownWeartests[l].circleSortOrder = 1;
               	            }
                        }

                    }
                    $scope.loadingInitialCircles = false;

                } else {
                    notificationWindow.show('Error. Could not retrieve details on image collection associated with product test', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve details on image collection associated with product test', false);
            });
            
    };

    var removeWeartestFromList = function (weartestId) {
        var i;

        for (i = 0; i < $scope.shownWeartests.length; i++) {
            if ($scope.shownWeartests[i]._id === weartestId) {
                $scope.shownWeartests.splice(i, 1);
            }
        }

        for (i = 0; i < allWeartests.length; i++) {
            if (allWeartests[i]._id === weartestId) {
                allWeartests.splice(i, 1);
            }
        }
    };

    //Prepare the request to show the relevant weartests
    switch (weartestMode) {
        case 'current':
            getWeartestRecords({'status': 'active'}, 10);
            break;

        case 'draft':
            getWeartestRecords({'status': {'$in': ['draft', 'pending approval']}}, 10);
            break;

        case 'closed':
            getWeartestRecords({'status': 'closed'}, 10);
            break;
    }

    $scope.isSortOrder = function (columnName, sortOrder) {
        if ($scope.predicate === columnName) {
            //Check if sort order is provided - if not, then do not consider it
            if (sortOrder === undefined) {
                return true;
            } else {
                if ($scope.reverse === true && sortOrder === "descending") {
                    return true;
                } else if ($scope.reverse === false && sortOrder === "ascending") {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    };

    $scope.setSortOrder = function (columnName) {
        if ($scope.predicate === columnName) {
            $scope.reverse = !$scope.reverse;
        } else {
            $scope.predicate = columnName;
            $scope.reverse = true;
        }
    };

    $scope.isTab = function (tabName) {
        return weartestMode === tabName;
    };

    $scope.countPointsForImage = function (imageId, pointColor) {
        var count = 0,
            i, j;

        for (i = 0; i < $scope.productImages.length; i++) {
            if ($scope.productImages[i]._id === imageId) {
                for (j = 0; j < $scope.productImages[i].dataPoints.length; j++) {
                    if ($scope.productImages[i].dataPoints[j].color === pointColor) {
                        count++;
                    }
                }
            }
        }

        return count;
    };

    //Returns the image based on the Performance Zones of the wear test
    $scope.getCircleColor = function (imageId) {
        var location;
        
        if (circleColor.indexOf(imageId) === -1) {
            location = "/img/dot-green.png";
        } else {
            location = circleColor[circleColor.indexOf(imageId)+1];
        }
        return location;
    };

    //Infinite scroll - increase limit on displayed weartests
    $scope.increaseWeartestDisplayLimit = function () {
        if ($scope.weartestDisplayLimit > $scope.shownWeartests.length) {
            return;
        } else {
            $scope.weartestDisplayLimit += 10;
        }
    };

    //Checks if there are any weartests to display
    $scope.doWeartestsExist = function () {
        if ($scope.loadingInitialWeartests) {
            //Can't say yet since we are in the middle of loading weartests
            //Best to play safe and assume that there will be weartests to display
            return true;
        } else if ($scope.shownWeartests.length === 0) {
            return false;
        } else {
            return true;
        }
    };

    //De-activate a weartest
    $scope.deActivateWeartest = function (weartest) {
        var newWeartest = {
                '_id': weartest._id
            },
            path = '/api/mesh01/weartest/' + newWeartest._id;

        weartest.deactivating = true;

        newWeartest.status = 'closed';

        $http.put(path, newWeartest)
            .success(function (result) {
                if (result._id === newWeartest._id && result.status === newWeartest.status) {
                    notificationWindow.show('Product test de-activated successfully', false);

                    removeWeartestFromList(result._id);
                } else {
                    notificationWindow.show('Error de-activating product test', false);
                }

                weartest.deactivating = false;
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error de-activating product test', false);

                weartest.deactivating = false;
            })
    };

    $scope.putonHoldWeartest = function (weartest) {
        var newWeartest = {
                '_id': weartest._id
            },
            path = '/api/mesh01/weartest/' + newWeartest._id;

        weartest.puttingonhold = true;

        newWeartest.status = 'draft';

        $http.put(path, newWeartest)
            .success(function (result) {
                if (result._id === newWeartest._id && result.status === newWeartest.status) {
                    notificationWindow.show('Product test put on hold successfully', false);

                    removeWeartestFromList(result._id);
                } else {
                    notificationWindow.show('Error putting product test on hold', false);
                }

                weartest.puttingonhold = false;
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error putting product test on hold', false);

                weartest.puttingonhold = false;
            })
    };

    //Activate a weartest
    $scope.activateWeartest = function (weartest) {
        weartest.activating = true;

        async.parallel({
            weartest: function (callback) {
                var path = '/api/mesh01/weartest/';

                path += weartest._id;

                $http.get(path)
                    .success(function (result) {
                        if (result._id === weartest._id) {
                            callback(null, result);
                        } else {
                            callback('error while retrieving weartest');
                        }
                    })
                    .error(function (err) {
                        callback('error while retrieving weartest');
                    });
            },
            productImages: function (callback) {
                var path = '/api/mesh01/imagesets/';

                path += weartest.imageSetId;

                $http.get(path)
                    .success(function (result) {
                        if (result._id === weartest.imageSetId) {
                            var productImages = [],
                                imagesLength = result.images.length,
                                i;

                            for (i = 0; i < imagesLength; i++) {
                                if (result.images[i].type === 'productImage') {
                                    productImages.push(result.images[i]);
                                }
                            }

                            callback(null, productImages);
                        } else {
                            callback('error while retrieving imageset');
                        }
                    })
                    .error(function (err) {
                        callback('error while retrieving imageset');
                    });
            }
        }, function (err, results) {
            var validationResult,
                newWeartest = {},
                path;

            if (err) {
                console.log(err);
                notificationWindow.show('Error activating product test', false);

                weartest.activating = false;

                return;
            }

            validationResult = WTServices.getActivationStatus(results.weartest, results.productImages);

            if (validationResult.status === 'success') {
                newWeartest = {
                    '_id': results.weartest._id,
                    'status': 'active'
                };

                path = '/api/mesh01/weartest/' + newWeartest._id;

                $http.put(path, newWeartest)
                    .success(function (result) {
                        if (result._id === newWeartest._id && result.status === newWeartest.status) {
                            notificationWindow.show('Product test activated successfully', false);

                            removeWeartestFromList(result._id);
                        } else {
                            notificationWindow.show('Error activating product test', false);
                        }

                        weartest.activating = false;
                    })
                    .error(function (err) {
                        console.log(err);
                        notificationWindow.show('Error activating product test', false);

                        weartest.activating = false;
                    });
            } else {
                $location.path('/dashboard/weartests/' + weartestMode + '/' + results.weartest._id + '/edit/confirmation').search('activate', true);
            }
        });
    };

    $scope.openConfirmDeleteModal = function (weartest) {
        $scope.weartestToDelete = weartest;
        
        $scope.showConfirmDeleteModal = true;
    };

    $scope.closeConfirmDeleteModal = function () {
        $scope.weartestToDelete = {};
        
        $scope.showConfirmDeleteModal = false;
    };

    //Delete a weartest
    $scope.deleteWeartest = function () {
        var path;

        if (!$scope.weartestToDelete._id) {
            return;
        }

        $scope.weartestToDelete.deleting = true;

        path = '/api/mesh01/imagesets/';

        path += $scope.weartestToDelete.imageSetId;

        notificationWindow.show('Deleting product test "' + $scope.weartestToDelete.name + '"...', true);

        (function (weartest, path) {
            $http.delete(path)
                .success(function () {
                    var path = '/api/mesh01/weartest/';

                    path += weartest._id;

                    $http.delete(path)
                        .success(function () {
                            notificationWindow.show('Product test "' + weartest.name + '" has been deleted successfully', false);

                            removeWeartestFromList(weartest._id);

                            weartest.deleting = false;
                        })
                        .error(function (err) {
                            console.log(err);
                            notificationWindow.show('Error while deleting product test ' + weartest.name, false);

                            weartest.deleting = false;
                        });
                })
                .error(function (err) {
                    console.log(err);
                    notificationWindow.show('Error while deleting product test ' + weartest.name, false);

                    weartest.deleting = false;
                });
        })($scope.weartestToDelete, path);

        $scope.closeConfirmDeleteModal();
    };

    $scope.getCurrentMode = function () {
        return weartestMode;
    };
}
]);
