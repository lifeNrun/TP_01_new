dashboardApp.controller('WeartestModeCtrl', ['$scope', '$routeParams', '$http', '$location', '$timeout', 'notificationWindow', 'async', 'loginState',
function ($scope, $routeParams, $http, $location, $timeout, notificationWindow, async, loginState) {
    'use strict';

    var weartestMode = $routeParams['mode'],
        section = $routeParams['section'],
        user,
        creatingWeartest = false;

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    $scope.weartestName = '';

    $scope.showCreateWeartestModal = false;

    //Get the currently logged in user's details
    loginState.getLoginState(function (data) {
        user = data.userInfo;
    });

    $scope.isModeActive = function (mode) {
        if (section === 'edit') {
            //Edit section has its own tab
            return false;
        } else {
            return mode === weartestMode;
        }
    };

    $scope.isEditMode = function () {
        return section === 'edit';
    };

    $scope.openCreateWeartestModal = function () {
        if (creatingWeartest) {
            //Another weartest is being created. Do no allow new weartest creation
            return;
        }

        $scope.weartestName = '';

        $scope.showCreateWeartestModal = true;
    };

    $scope.closeCreateWeartestModal = function () {
        $scope.showCreateWeartestModal = false;
    };

    //Create the weartest
    $scope.createWeartest = function () {
        var weartest = {},
            path;

        if (creatingWeartest) {
            return;
        }

        creatingWeartest = true;

        weartest.name = $scope.weartestName;

        if (weartest.name.length === 0) {
            return;
        }

        notificationWindow.show('Creating product test...', true);

        //Close weartest creation modal before proceeding
        $scope.closeCreateWeartestModal();

        // Creation has multiple steps:
        // 1. Create the weartest itself
        // 2. Create imageset for the weartest
        // 3. Associate the created imageset with the weartest
        // 4. Check if the user has a profile image. If so,
        //   a. Assign the profile image as the brand logo link for the created weartest
        //   b. Upload the profile image to the imageset associated with the created weartest
        // Only when ALL the above steps succeed, weartest creation is successful.
        async.waterfall([
            function (callback) {
                var path = '/api/mesh01/weartest';

                $http.post(path, weartest)
                    .success(function (result) {
                        if (result._id && result.name === weartest.name) {
                            notificationWindow.show('Successfully created product test. Creating image collection to hold images for product test...', true);

                            callback(null, result);
                        } else {
                            callback(new Error('Error. Could not create product test'));
                        }
                    })
                    .error(function (err) {
                        callback(err);
                    });

                $scope.$apply();
            },
            function (weartest, callback) {
                var imageset = {},
                    path;

                imageset.name = 'weartest-' + weartest._id;

                imageset.description = 'Auto generated imageset for Product Test-'+ weartest._id;

                imageset.status = 'active';

                imageset.type = 'WearTest';

                path = '/api/mesh01/imagesets';

                $http.post(path, imageset)
                    .success(function (result) {
                        if (result._id) {
                            notificationWindow.show('Container successfully created. Making product test use this container...', true);

                            callback(null, weartest, result);
                        } else {
                            callback(new Error('Error. Container to hold images for product test could not be created.'));
                        }
                    })
                    .error(function (err) {
                        callback(err);
                    });

                $scope.$apply();
            },
            function (weartest, imageset, callback) {
                var path = '/api/mesh01/weartest/' + weartest._id;

                weartest.imageSetId = imageset._id;

                $http.put(path, weartest)
                    .success(function (result) {
                        if (result._id && result._id === weartest._id && result.imageSetId === weartest.imageSetId) {
                            notificationWindow.show('Checking if your brand has a logo...', true);

                            callback(null, result._id, imageset._id);
                        } else {
                            callback(new Error('Error. Could not make product test use the created container'));
                        }
                    })
                    .error(function (err) {
                        callback(err);
                    });

                $scope.$apply();
            },
            function (weartestId, imagesetId, callback) {
                var path,
                    projection;

                if (user.user_imageset && user.user_imageset !== null) {
                    path = '/api/mesh01/imagesets/' + user.user_imageset,
                    projection = {
                        '_id': 1,
                        'coverPhoto': 1
                    };

                    path += '?projection=' + JSON.stringify(projection);

                    $http.get(path)
                        .success(function (result) {
                            if (result._id === user.user_imageset) {
                                if (result.coverPhoto && result.coverPhoto.length > 0) {
                                    notificationWindow.show('Found brand logo. Associating logo with weartest...', true);

                                    callback(null, weartestId, imagesetId, result.coverPhoto);
                                } else {
                                    callback(null, weartestId, undefined, undefined);
                                }
                            } else {
                                callback(new Error('Error. Could not associate brand logo with weartest'));
                            }
                        })
                        .error(function (err) {
                            callback(err);
                        });

                    $scope.$apply();
                } else {
                    $scope.$apply(function () {
                        callback(null, weartestId, undefined, undefined);
                    });
                }
            },
            function (weartestId, imagesetId, brandLogoLink, callback) {
                if (brandLogoLink) {
                    async.parallel([
                        function (callback) {
                            var path = '/api/mesh01/weartest/' + weartestId,
                                weartest = {
                                    '_id': weartestId,
                                    'brandLogoLink': brandLogoLink
                                };

                            $http.put(path, weartest)
                                .success(function (result) {
                                    if (result._id === weartestId && result.brandLogoLink === brandLogoLink) {
                                        callback(null);
                                    } else {
                                        callback(new Error('Error. Could not associate brand logo with weartest'));
                                    }
                                })
                                .error(function (err) {
                                    callback(err);
                                });

                            $scope.$apply();
                        },
                        function (callback) {
                            var path = '/api/mesh01/imagesets/' + imagesetId,
                                imageset = {
                                    '_id': imagesetId,
                                    'images': []
                                },
                                image = {
                                    'url': brandLogoLink,
                                    'type': 'brandLogo'
                                };

                            imageset.images.push(image);

                            $http.put(path, imageset)
                                .success(function (result) {
                                    if (result._id === imagesetId && angular.isArray(result.images) && result.images.length > 0) {
                                        callback(null);
                                    } else {
                                        callback(new Error('Error. Could not upload brand logo to image container associated with product test'));
                                    }
                                })
                                .error(function (err) {
                                    callback(err);
                                });

                            $scope.$apply();
                        }
                    ], function (err, results) {
                        if (err) {
                            console.log(err);

                            notificationWindow.show('Error. One or more steps failed in associating brand logo with product test', false);
                        } else {
                            callback(null, weartestId)
                        }
                    });
                } else {
                    callback(null, weartestId);
                }
            }
        ], function (err, weartestId) {
            if (err) {
                console.log(err);

                notificationWindow.show('Error. One or more steps in creation of product test failed. Try again.', false);

                creatingWeartest = false;
            } else {
                notificationWindow.show('All set. Redirecting to edit product test page', false);

                creatingWeartest = false;

                $timeout(function () {
                    $location.path('/dashboard/weartests/draft/' + weartestId + '/edit/overview');
                }, 1000);
            }
        });
    };
}
]);
