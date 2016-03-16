dashboardApp.controller('VideoManagerCtrl', ['$scope', '$http', '$routeParams', '$timeout', 'notificationWindow', 'Media', 'async', 'loginState',
    function ($scope, $http, $routeParams, $timeout, notificationWindow, Media, async, loginState) {
        'use strict';

        var weartestId = $routeParams['itemId'],
            imagesetId = $routeParams['subSection'],
            path,
            projection,
            uploadedVideos = [],
            conversionCheckInProgress = false,
            checkVideos = [],
            imageset = {};

        $scope.weartest = {};

        $scope.imageset = {};

        $scope.videosExist = true;

        $scope.videoFilter = {
            type: 'productVideo'
        };

        $scope.uploadingVideo = false;

        $scope.uploadedVideo = {
            type: 'productVideo',
            newVideo: true
        };

        $scope.disableChanges = false;

        $scope.conversionPendingVideos = [];

        //Uploaded videos have to be converted by Vimeo first
        //This function determines if the video is converted and if the user can see it
        var verifyIfVideoBeingConverted = function (allVideos, selectedVideos) {
            var path = '/api/misc/video',
                i;

            if (allVideos) {
                checkVideos = [];

                for (i = 0; i < $scope.imageset.images.length; i++) {
                    if ($scope.imageset.images[i].type === 'productVideo') {
                        checkVideos.push($scope.imageset.images[i].url);
                    }
                }
            }

            conversionCheckInProgress = true;

            async.each(checkVideos,
                function (vimeoVideoId, callback) {
                    $http.get(path + '/' + vimeoVideoId + '?status=1')
                        .success(function (result) {
                            var videoAtIndex;

                            if (result === 'available') {
                                videoAtIndex = $scope.conversionPendingVideos.indexOf(vimeoVideoId);

                                if (videoAtIndex !== -1) {
                                    $scope.conversionPendingVideos.splice(videoAtIndex, 1);

                                    $scope.refreshVideo(vimeoVideoId);
                                }
                            } else {
                                //Try checking status again
                                if ($scope.conversionPendingVideos.indexOf(vimeoVideoId) === -1) {
                                    $scope.conversionPendingVideos.push(vimeoVideoId);
                                }
                            }

                            callback(null);
                        })
                        .error(function (err, status) {
                            //Try checking status again
                            if ($scope.conversionPendingVideos.indexOf(vimeoVideoId) === -1) {
                                $scope.conversionPendingVideos.push(vimeoVideoId);
                            }

                            callback(null);
                        });
                },
                function (err) {
                    if (err) {
                        //Ignore any errors.
                        //An error here would mean that the user will have to manually refresh
                        //and hence not required to handle errors
                        conversionCheckInProgress = false;

                        return;
                    }

                    //If there are videos still being converted, check their status again
                    if ($scope.conversionPendingVideos.length > 0) {
                        checkVideos = $scope.conversionPendingVideos.slice(0);

                        //If any videos were uploaded while this function was busy determining
                        //video conversion status, include them as well
                        if (uploadedVideos.length > 0) {
                            checkVideos.push.apply(checkVideos, uploadedVideos);

                            uploadedVideos = [];
                        }

                        //Check status again in 4 seconds
                        $timeout(function () {
                            verifyIfVideoBeingConverted(false, true);                            
                        }, 4000);
                    } else if (uploadedVideos.length > 0) {
                        checkVideos = uploadedVideos.slice(0);

                        uploadedVideos = [];

                        //Check status again in 4 seconds
                        $timeout(function () {
                            verifyIfVideoBeingConverted(false, true);                            
                        }, 4000);
                    } else {
                        conversionCheckInProgress = false;
                    }
                }
            );
        };

        var getImagesetDetails = function () {
            var path = '/api/mesh01/imagesets/' + imagesetId,
                projection = {
                    '_id': 1,
                    'images': 1
                };

            path += '?projection=' + JSON.stringify(projection);

            notificationWindow.show('Getting information on the videos uploaded by you...', true);

            $http.get(path)
                .success(function (result) {
                    var videosExist = false,
                        i;

                    if (result._id === imagesetId) {
                        $scope.imageset = result;

                        imageset = JSON.parse(JSON.stringify(result));

                        for (i = 0; i < imageset.images.length; i++) {
                            if (imageset.images[i].type === 'productVideo') {
                                videosExist = true;

                                break;
                            }
                        }

                        if (!videosExist) {
                            $scope.videosExist = false;

                            verifyIfVideoBeingConverted(true, false);
                        }

                        notificationWindow.show('Video Manager is ready for your use', false);
                    } else {
                        notificationWindow.show('Error. Could not fetch details on the videos uploaded');
                    }
                })
                .error(function (err) {
                    notificationWindow.show('Error. Could not fetch details on the videos uploaded');
                    console.error(err);
                });
        };

        loginState.getLoginState(function (data) {
            $scope.user = data.userInfo;

            //Update the video filter to include only videos uploaded by current tester
            $scope.videoFilter.uploadedById = $scope.user._id;
        });

        path = '/api/mesh01/weartest/' + weartestId;

        projection = {
            '_id': 1,
            'name': 1
        };

        path += '?projection=' + JSON.stringify(projection);

        notificationWindow.show('Getting information on the product test...', true);

        $http.get(path)
            .success(function (result) {
                if (result._id === weartestId) {
                    $scope.weartest = result;

                    getImagesetDetails();
                } else {
                    notificationWindow.show('Error. Could not fetch details on the product test', false);
                }
            })
            .error(function (err) {
                notificationWindow.show('Error. Could not fetch details on the product test', false);
                console.error(err);
            });

        $scope.updateVideo = function (video, isNewVideo) {
            var updateRequired = false,
                videoFound = false,
                path,
                key;

            if (!isNewVideo) {
                //Verify if there are any changes made
                $scope.imageset.images.forEach(function (item) {
                    if (item.type !== 'productVideo') {
                        return;
                    }

                    if (item._id === video._id) {
                        videoFound = true;

                        imageset.images.forEach(function (entry) {
                            if (entry._id !== item._id) {
                                return;
                            }

                            for (key in item) {
                                if (key === 'name' || key === 'description') {
                                    if (item[key] !== entry[key]) {
                                        updateRequired = true;
                                    }
                                }
                            }
                        });
                    }
                });
            }

            if (updateRequired || !videoFound) {
                if (!isNewVideo) {
                    notificationWindow.show('Saving changes...', true);
                } else {
                    notificationWindow.show('Saving uploaded video...', true);

                    $scope.disableChanges = true;
                }

                path = '/api/mesh01/imagesets/' + imageset._id;

                $http.put(path, $scope.imageset)
                    .success(function (result) {
                        var newVideoFound,
                            newVideoIds = [],
                            i, j;

                        if (result._id === imagesetId) {
                            //Save the changes into the old record
                            imageset = result;

                            if (isNewVideo) {
                                //Update the ID of the uploaded video
                                newVideoFound = false;

                                for (i = 0; i < $scope.imageset.images.length; i++) {
                                    if ($scope.imageset.images[i].newVideo === true) {
                                        for (j = 0; j < imageset.images.length; j++) {
                                            if (imageset.images[j].url === $scope.imageset.images[i].url) {
                                                newVideoFound = true;

                                                $scope.imageset.images[i].newVideo = false;
                                                $scope.imageset.images[i]._id = imageset.images[j]._id;

                                                newVideoIds.push($scope.imageset.images[i].url);

                                                break;
                                            }
                                        }
                                    }
                                }

                                if (!newVideoFound) {
                                    notificationWindow.show('Error occurred in saving video. Attempting to save again...', false);

                                    return $scope.updateVideo(null, true);
                                } else {
                                    notificationWindow.show('Uploaded video saved successfully.', false);

                                    $scope.disableChanges = false;

                                    if (!$scope.videosExist) {
                                        $scope.videosExist = true;
                                    }

                                    uploadedVideos.push.apply(uploadedVideos, newVideoIds);

                                    //Check conversion status
                                    if (!conversionCheckInProgress) {
                                        checkVideos = uploadedVideos.slice(0);

                                        verifyIfVideoBeingConverted(false, true);
                                    } else {
                                        //Nothing to do. The uploaded video will be picked up through
                                        //uploadedVideos
                                    }
                                }
                            } else {
                                notificationWindow.show('Changes saved successfully.', false);
                            }
                        } else {
                            notificationWindow.show('Error. Could not save changes.', false);
                        }
                    })
                    .error(function (err) {
                        notificationWindow.show('Error. Could not save changes.', false);

                        console.error(err);
                    });
            }
        };

        $scope.deleteVideo = function (video) {
            var i;

            for (i = 0; i < $scope.imageset.images.length; i++) {
                if ($scope.imageset.images[i]._id === video._id) {
                    $scope.imageset.images.splice(i, 1);
                }
            }

            $scope.updateVideo(video);

            Media.delete(video.url, 'video');
        };

        $scope.saveUploadedVideo = function (videoDetails) {
            if (videoDetails.vimeoVideoId) {
                $scope.uploadedVideo.url = videoDetails.vimeoVideoId;

                $scope.uploadedVideo.uploadedById = $scope.user._id;

                $scope.imageset.images.unshift(JSON.parse(JSON.stringify($scope.uploadedVideo)));

                $scope.uploadingVideo = false;

                $scope.updateVideo(null, true);

                $scope.uploadedVideo = {
                    type: 'productVideo',
                    name: '',
                    description: '',
                    newVideo: true
                };
            } else {
                notificationWindow.show('Error. Did not get information on uploaded video', false);
            }
        };

        $scope.refreshVideo = function (vimeoVideoId) {
            var i;

            function removeVideoFromReadyState (index, vimeoVideoId) {
                $timeout(function() {
                    $scope.imageset.images[index].url = vimeoVideoId;
                }, 500);
            }

            for (i = 0; i < $scope.imageset.images.length; i++) {
                if ($scope.imageset.images[i].type === 'productVideo') {
                    if ($scope.imageset.images[i].url === vimeoVideoId) {
                        $scope.imageset.images[i].url = '';

                        removeVideoFromReadyState(i, vimeoVideoId);
                        break;
                    }
                }
            }
        };
    }
]);
