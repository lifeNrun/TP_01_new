dashboardApp.controller('brandProfileItemCtrl', ['$scope', '$http', 'notificationWindow', function($scope, $http, notificationWindow) {
    'use strict';

    $scope.status = {};

    $scope.loading = true;

    var getUserImageSetDetails = function () {
        $scope.loading = true;

        //Verify that we have the Image Set ID with us
        if (angular.isUndefined($scope.userInfo.user_imageset)) {
            //No Image Set exists - create one.
            var newImageset = {
                name: $scope.userInfo.username,
                type: 'Profile',
                status: 'active',
            };

            var path = '/api/mesh01/imagesets';

            notificationWindow.show('Creating a collection for you to upload a profile photo...', true);

            $http.post(path, newImageset)
                .success(function (result) {
                    if (result._id && result.name === newImageset.name) {
                        //Store the imageset details
                        $scope.userImageSetDetails = result;
                        
                        $scope.userInfo.user_imageset = $scope.userImageSetDetails._id;

                        path = '/api/mesh01/users/' + $scope.userInfo._id;

                        var newUser = {
                            '_id': $scope.userInfo._id,
                            'user_imageset': $scope.userInfo.user_imageset
                        };

                        notificationWindow.show('Collection created successfully. Proceeding to update your details with the new collection...', true);

                        //Update the user details
                        $http.put(path, newUser)
                            .success(function (result) {
                                if (result._id === $scope.userInfo._id && result.user_imageset === $scope.userInfo.user_imageset) {
                                    notificationWindow.show('Collection has been successfully added to your profile', false);
                                } else {
                                    notificationWindow.show('Error updating your profile with the collection', false);
                                }

                                $scope.loading = false;
                            })
                            .error(function (err) {
                                console.log(err);

                                notificationWindow.show('Error updating your profile with the collection', false);

                                $scope.loading = false;
                            });
                    } else {
                        notificationWindow.show('Error creating a collection. You may not be able to use rules', false);

                        $scope.loading = false;
                    }
                })
                .error(function (err) {
                    console.log(err);

                    notificationWindow.show('Error creating a collection. You may not be able to use rules', false);

                    $scope.loading = false;
                });
        } else {
            //Get the details of the Image Set
            $http.get('/query/imagesets?query={"_id":"' + $scope.userInfo.user_imageset + '"}')
                .success(function (result) {
                    $scope.userImageSetDetails = result[0];
                    $scope.loading = false;
                });
        }
    };

    var getUserData = function() {
        $http.get('/authenticationState').then(function(data) {
            $scope.userInfo = data.data.userInfo;
            $scope.oldUserInfo = angular.copy($scope.userInfo);

            //Get the details of the user's image set
            getUserImageSetDetails();
        });
    };

    var updateUserImageSet = function () {
        var _imageset = {};
        angular.copy($scope.userImageSetDetails, _imageset);

        _imageset.id = _imageset._id;

        delete _imageset._id;

        $scope.loading = true;

        $http.put('/tableControlApi/imagesets/' + _imageset.id, _imageset)
            .success(function (result) {
                //Update the Image Set
                $scope.userImageSetDetails = result.data;

                $scope.loading = false;
            });
    };

    $scope.onUpdate = function() {
        $scope.oldUserInfo = angular.copy($scope.userInfo);
    };

    $scope.onDiscard = function() {
        $scope.userInfo = angular.copy($scope.oldUserInfo);
    };

    $scope.startEditing = function() {
        $scope.status.editing = true;
    };

    //Returns the scaled version of the image
    $scope.getScaledImage = function (fullSizeImageUrl, width, height) {

        if (fullSizeImageUrl === undefined || fullSizeImageUrl === null || fullSizeImageUrl === "") {
            return;
        }

        //Prepare the regular expression for the host URL
        var hostUrlRe = /\/[^\/]+\/[^\/]+$/;

        //Get the host URL
        var hostUrl = fullSizeImageUrl.split(hostUrlRe)[0];

        //Get the remaining part of the URL
        var tempString = fullSizeImageUrl.split(hostUrl + '/')[1];

        var imageIdUrlRe = /\//;

        //Get the public ID of the image along with the extension
        var imageIdUrl = tempString.split(imageIdUrlRe)[1];

        //Finally return the URL
        return hostUrl + '/' + height + ',c_fit' + '/' + imageIdUrl;
    };

    //Keep an eye over the user Image Set details (specific for rules upload only)
    $scope.$watch('userImageSetDetails.dirty', function () {
        if (angular.isUndefined($scope.userImageSetDetails)) {
            return;
        } else if ($scope.userImageSetDetails.dirty === true) {
            $scope.userImageSetDetails.dirty = false;

            updateUserImageSet();
        }
    });

    getUserData();
}]);