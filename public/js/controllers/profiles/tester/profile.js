/***************************************************************
 This contains the controller(s) for the "Profile" dashboard
item of a user of type Tester
***************************************************************/

dashboardApp.controller('TesterProfileItemCtrl', ['$scope', '$http', 'loginState', function ($scope, $http, loginState) {
    'use strict';

    var initialDisplay = true,
        imagesInImageSet = [],
        surveys;

    //Keeps track of the active tab
    //Default, the bio tab is active
    $scope.activeTab = "tabBio";

    //Logged in user's details
    $scope.user = {};

    //Control to display the edit / upload images to Image Set moda
    $scope.showImageSetModal = false;

    $scope.imageSetModalOptions = {
        backdropFade: true,
        dialogFade: true,
        dialogClass: 'modal wider'
    };

    $scope.modalOptions = {
        backdropFade: true,
        dialogFade: true
    };

    //The Primary Image shown in the image gallery
    $scope.primaryImage = null;

    //Default Tags for uploaded images
    $scope.defaultTags = [];

    //Default tags for Bio
    $scope.defaultBioTabs = ['bio'];

    //Image Set Details
    $scope.imageSetDetails = {};

    //Loading the survey related data
    $scope.loadingProfileSurveys = true;

    $scope.showSurveyActivityClassificationModal = false;

    $scope.activityType = null;

    $scope.activitySurvey = {};

    $scope.surveyActivityClassification = {};

    //Get information on the logged in user
    var fetchUserDetails = function () {
        loginState.getLoginState(function (data) {
            $scope.user = data.userInfo;

            //Get the Image Set of the user
            $scope.getImageSet();

            //Get the Survey related information
            $scope.getProfileSurveys();
        });
    };

    //Returns the scaled version of the image
    var getScaledImage = function (fullSizeImageUrl, width, height, cropMode) {

        //Prepare the regular expression for the host URL
        var hostUrlRe = /\/[^\/]+\/[^\/]+$/;

        //Get the host URL
        var hostUrl = fullSizeImageUrl.split(hostUrlRe)[0];

        //Get the remaining part of the URL
        var tempString = fullSizeImageUrl.split(hostUrl + '/')[1];

        var imageIdUrlRe = /\//;

        //Get the public ID of the image along with the extension
        var imageIdUrl = tempString.split(imageIdUrlRe)[1];

        if (!cropMode) {
            cropMode = 'c_scale';
        }

        //Finally return the URL
        return hostUrl + '/' + width +',' + height + ',' + cropMode + '/' + imageIdUrl;
    };

    //Fetches all surveys of type "profile"
    $scope.getProfileSurveys = function () {
        $http.get('/query/surveys?query={"type":"Activity"}')
            .success(function (result) {
                var queryBuilder = '';

                surveys = result;

                //Now, acccumulate the survey Ids
                queryBuilder = '[';
                for (var i = 0; i < surveys.length; i++) {
                    if (i > 0) {
                        queryBuilder = queryBuilder + ',';
                    }

                    queryBuilder = queryBuilder + '"' + surveys[i]._id + '"';
                }
                queryBuilder = queryBuilder + ']';

                //And get all the submitted surveys of the current user
                $http.get('/query/surveys_submitted?query={"userId":"' + $scope.user._id + '","surveyId":{"$in":' + queryBuilder + '}}')
                    .success(function (result) {
                        var found = false,
                            surveyBeingProcessed = {},
                            i;

                        $scope.submittedSurveys = result;

                        //Now, identify the surveys that the user has NOT taken
                        $scope.pendingSurveys = [];

                        for (i = 0; i < surveys.length; i++) {
                            found = false;

                            for (var k = 0; k < $scope.submittedSurveys.length; k++) {
                                // set survey name used for sorting
                                $scope.submittedSurveys[k].name=$scope.getSurveyName($scope.submittedSurveys[k].surveyId);
                                if ($scope.submittedSurveys[k].surveyId === surveys[i]._id) {
                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                $scope.pendingSurveys.push(surveys[i]);
                            }
                        }

                        //If a survey is being answered or viewed, update the details present with the view
                        if (!angular.isUndefined($scope.surveyDetails)) {
                            if ($scope.activeTab === 'viewEditSurvey') {
                                for (i = 0; i < $scope.submittedSurveys.length; i++) {
                                    if ($scope.submittedSurveys[i]._id === $scope.surveyDetails._id) {
                                        surveyBeingProcessed = JSON.parse(JSON.stringify($scope.submittedSurveys[i]));
                                        $scope.viewEditSurvey(surveyBeingProcessed);
                                    }
                                }
                            }
                        }

                        $scope.getUserDetails();
                        //Done loading
                        $scope.loadingProfileSurveys = false;
                    });

            });
    };

    //Returns the Name of the Survey given the survey ID
    $scope.getSurveyName = function (surveyId) {
        for (var i = 0; i < surveys.length; i++) {
            if (surveys[i]._id === surveyId) {
                return surveys[i].name;
            }
        }
    };

    //Set the active tab
    $scope.setActiveTab = function (tabName) {
        $scope.activeTab = tabName;
    };

    //Check if the passed tab is the active tab
    $scope.isTabActive = function (tabName) {
        return $scope.activeTab === tabName;
    };

    //Get the Image Set
    $scope.getImageSet = function () {
        //Check if the user has an Image Set associated with it
        if (angular.isUndefined($scope.user.user_imageset)) {
            //Yes, user_imageset not yet created.
            //No Images exist
            imagesInImageSet = [];

            //Created an empty Image Set
            var imageset = {
                name: $scope.user.username,
                type: "Profile",
                status: "active",
                createdDate: new Date(),
                modifiedDate: new Date()
            };

            $http.post('/tableControlApi/imagesets', imageset)
                .success(function (result) {
                    var userDetails = {};
                    //Store the imageset details
                     // Same as above,   dont need to parse this it is now retruned as json
                    //$scope.imageSetDetails = JSON.parse(result.data);
                    $scope.imageSetDetails = result.data;

                    //Associate the Image Set with the user
                    angular.copy($scope.user, userDetails);
                    userDetails.user_imageset = $scope.imageSetDetails._id;

                    //Update the user details
                    $http.put('/api/updateUser', JSON.stringify(userDetails))
                        .success(function (result) {
                            //Update the user details that we have
                            $scope.user = result;
                        })
                        .error(function (err) {
                            console.log("Error");
                            console.log(err);
                            $scope.infoText = "Error while updating Image Set association with the current user. Check logs.";
                            $scope.displayInfoModal();
                        });
                })
                .error(function (err) {
                    console.log("Error");
                    console.log(err);
                    $scope.infoText = "Error while creating Image Set for this account. Check logs";
                    $scope.displayInfoModal();
                });
        } else {
            //Retrieve the details of the Image Set
            $http.get('/query/imagesets?query={"_id":"' + $scope.user.user_imageset + '"}')
                .success(function (result) {
                    //Store the Image Set details
                    $scope.imageSetDetails = result[0];
                    angular.copy($scope.imageSetDetails.images, imagesInImageSet);
                })
                .error(function (err) {
                    console.log("Error");
                    console.log(err);
                    $scope.infoText = "Error while retrieving information on the Image Set associated with this account. Check logs.";
                    $scope.displayInfoModal();
                });
        }
    };

    //Show the Image Set Edit / Upload modal
    $scope.displayImageSetModal = function (subNav) {
        $scope.showImageSetModal = true;

        //Set the default tag for any uploaded images
        if (subNav === "bio") {
            $scope.defaultTags = $scope.defaultBioTabs;
        }
    };

    //Close the Image Set Edit / Upload modal
    $scope.closeImageSetModal = function () {
        $scope.showImageSetModal = false;
    };

    //Update the Image Set
    $scope.putImageSet = function () {
        //Update only if the Image Set has changed
        if ($scope.imageSetDetails.dirty === false) {
            return;
        } else {
            //Updating Image Set. Image Set is no longer dirty
            $scope.imageSetDetails.dirty = false;
        }

        var _imageset = {};
        angular.copy($scope.imageSetDetails, _imageset);

        if (!_imageset.coverPhoto && _imageset.images.length > 0) {
            _imageset.coverPhoto = _imageset.images[0].url;
        }

        //Fixing internal server error on the api side
        _imageset.id = _imageset._id;
        delete _imageset._id;

        $http.put('/tableControlApi/imagesets/' + _imageset.id, _imageset)
            .success(function (result) {
                //Update the Image Set
                // the resulting line should not use JSON.parse since it is already a json object
                //$scope.imageSetDetails = JSON.parse(result.data);
                $scope.imageSetDetails = result.data;

                angular.copy($scope.imageSetDetails.images, imagesInImageSet);

                //Update the details of the Primary Image (needed if the Primary Image was edited)
                if (!angular.isUndefined($scope.primaryImage) && $scope.primaryImage !== null) {
                    for (var i = 0; i < imagesInImageSet.length; i++) {
                        if ($scope.primaryImage._id === imagesInImageSet[i]._id) {
                            $scope.setPrimaryImage(imagesInImageSet[i]);
                            break;
                        }
                    }
                }
            });
    };

    //Set the provided image as the primary image
    $scope.setPrimaryImage = function (imageDetails) {
        $scope.primaryImage = imageDetails;
    };

    //Get the scaled Image Url
    $scope.getImageUrl = function (url, imageType) {
        if (!url) {
            return;
        } else if (url === undefined) {
            return;
        }

        var height,
            width;
        //Depending on the image type, vary the dimension of the image
        if (imageType === "thumb") {
            height = "h_77";
            width = "w_100";
        } else if (imageType === "large") {
            height = "h_321";
            width = "w_422";
        }

        return getScaledImage(url, width, height, 'c_fit');
    };

    //Get the tags of the image in String format
    $scope.getImageTagsAsString = function (tags) {
        if (!tags) {
            return;
        }

        var result = "";
        for (var i = 0; i < tags.length; i++) {
            if (result.length > 0) {
                result = result + ", ";
            }

            result = result + tags[i];
        }

        return result;
    };

    //Returns images in the Image Set with the Cover Photo image as the first
    //image in the set
    $scope.getOrderedImages = function () {
        var coverPhotoDetails = null;

        //If the cover photo for this Image Set does not exist, then
        //return the images as it is, without changing the order
        if (angular.isUndefined($scope.imageSetDetails)) {
            return;
        } else if (angular.isUndefined($scope.imageSetDetails.coverPhoto) || $scope.imageSetDetails.coverPhoto === null) {
            //Set the first image as the primary image
            if (imagesInImageSet.length > 0) {
                $scope.setPrimaryImage(imagesInImageSet[0]);
            }
            return imagesInImageSet;
        } else {
            //Retrieve the cover photo and place it at the top of the list
            for (var i = 0; i < imagesInImageSet.length; i++) {
                if ($scope.imageSetDetails.coverPhoto === imagesInImageSet[i].url) {
                    coverPhotoDetails = imagesInImageSet[i];
                    imagesInImageSet.splice(i, 1);
                    break;
                }
            }
        }

        //Add the cover photo to the beginning of the image
        if (coverPhotoDetails === null) {
            return imagesInImageSet;
        } else {
            imagesInImageSet.unshift(coverPhotoDetails);

            //Also, set the coverPhoto as the primary image for the initial display
            if (initialDisplay) {
                $scope.setPrimaryImage(coverPhotoDetails);
                //No longer the initial display
                initialDisplay = false;
            }
            return imagesInImageSet;
        }
    };

    //Answer a survey
    $scope.answerSurvey = function (surveyDetails) {
        if ($scope.showSurveyActivityClassificationModal) {
            $scope.surveyActivityClassification.activityType = $scope.activityType;

            $scope.surveyActivityClassification.activity = surveyDetails.activity;

            $scope.closeSurveyActivityClassificationModal();
        } else {
            //Reset the activity classification details
            $scope.surveyActivityClassification = {};
        }

        $scope.surveyDetails = surveyDetails;

        //Show the answer survey screen
        $scope.setActiveTab('answerSurvey');
    };

    //View or edit a survey
    $scope.viewEditSurvey = function (surveyDetails) {
        $scope.surveyDetails = surveyDetails;

        //Show the relevant screen
        $scope.setActiveTab('viewEditSurvey');
    };

    //Watch the Image Set for changes
    //'dirty' attribute is set whenever that happens
    $scope.$watch('imageSetDetails.dirty', function () {
        if (angular.isUndefined($scope.imageSetDetails)) {
            return;
        } else if ($scope.imageSetDetails.dirty === true) {
            $scope.putImageSet();
        }
    });

    //get User Details when user update activity
    $scope.getUserDetails = function () {
        loginState.getLoginState(function (data) {
            $scope.user = data.userInfo;
      });
    };

    $scope.openSurveyActivityClassificationModal = function (surveyDetails) {
        $scope.activitySurvey = surveyDetails;
        $scope.showSurveyActivityClassificationModal = true;
    };

    $scope.closeSurveyActivityClassificationModal = function () {
        $scope.showSurveyActivityClassificationModal = false;

        $scope.activityType = null;

        $scope.activitySurvey = {};
    };

    //Initially, fetch the user details
    fetchUserDetails();
}]);

dashboardApp.controller('TesterProfileBioCtrl', ['$scope', '$http', '$timeout', '$route', 'loginState', 'notificationWindow', function ($scope, $http, $timeout, $route, loginState, notificationWindow) {
    'use strict';

    var loadingSurvey;

    //Control to display any information / messages to the user
    $scope.showInfoModal = false;

    $scope.infoText = "";

    $scope.infoModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    //% of completion of the profile
    $scope.completed = 0;

    //The logged in user's details
    $scope.user = {};

    //Activity Surveys which the user has not yet filled out
    //and where the activity is indicated as a preference by the user
    $scope.pendingActivitySurveys = [];

    $scope.pendingClassificationSurveys = [];

    $scope.showActivitySurveyClassifyModal = false;

    $scope.updatingUserActivity = false;

    var processSubmittedSurveys = function () {
        var userId = $scope.user._id,
            activitySurveys = [],
            winterActivityPreferences = $scope.user.winter.slice(0),
            summerActivityPreferences = $scope.user.summer.slice(0);

        $scope.pendingActivitySurveys = [];
        $scope.pendingClassificationSurveys = [];

        $http.get('/query/surveys?query={"type":"Activity"}&projection={"name":1,"activity":1}')
            .success(function (surveyResult) {
                var queryBuilder = '';

                //Retain only those activity surveys who are in the
                //winter and summer activity preferences of the user
                for (var i = 0; i < surveyResult.length; i++) {
                    if (surveyResult[i].activity && surveyResult[i].activity !== null && surveyResult[i].activity !== '') {
                        if (summerActivityPreferences.indexOf(surveyResult[i].activity) !== -1 || winterActivityPreferences.indexOf(surveyResult[i].activity) !== -1) {
                            activitySurveys.push(surveyResult[i]);
                        }
                    }
                }

                //Now, acccumulate the survey Ids
                queryBuilder = '[';
                for (var i = 0; i < surveyResult.length; i++) {
                    if (i > 0) {
                        queryBuilder = queryBuilder + ',';
                    }

                    queryBuilder = queryBuilder + '"' + surveyResult[i]._id + '"';
                }
                queryBuilder = queryBuilder + ']';

                //And get all the submitted surveys of the current user
                $http.get('/query/surveys_submitted?query={"userId":"' + userId + '","surveyId":{"$in":' + queryBuilder + '}}&projection={"surveyId":1}')
                    .success(function (submittedSurveyResult) {
                        var found,
                            i, j;

                        //We have with us the activity surveys that the user has already
                        //filled out. Using this, we find the activity surveys whose activity the
                        //user has indicated as a preference, but has not filled out yet
                        for (i = 0; i < activitySurveys.length; i++) {
                            found = false;
                            for (j = 0; j < submittedSurveyResult.length; j++) {
                                if (submittedSurveyResult[j].surveyId === activitySurveys[i]._id) {
                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                $scope.pendingActivitySurveys.push(activitySurveys[i]);
                            }
                        }

                        //Determine activities whose surveys were submitted but who activity is not present in the user's
                        //activity list
                        for (i = 0; i < submittedSurveyResult.length; i++) {
                            for (j = 0; j < surveyResult.length; j++) {
                                if (surveyResult[j]._id === submittedSurveyResult[i].surveyId) {
                                    if (summerActivityPreferences.indexOf(surveyResult[j].activity) === -1 && winterActivityPreferences.indexOf(surveyResult[j].activity) === -1) {
                                        $scope.pendingClassificationSurveys.push(surveyResult[j]);
                                    }
                                }
                            }
                        }

                        if ($scope.pendingClassificationSurveys.length > 0) {
                            $scope.openActivitySurveyClassifyModal();
                        }
                    });
            });
    };

    //Get information on the logged in user
    $scope.fetchUserDetails = function () {
        loginState.getLoginState(function (data) {
            $scope.user = data.userInfo;

            //Get information about the profile surveys filled by the user
            //and then identify the surveys that have yet to be filled
            //based on the winter and summer activity preferences of the user
            processSubmittedSurveys();
        });
    };

    //Display the information modal
    $scope.displayInfoModal = function () {
        $scope.showInfoModal = true;
    };

    //Close the information modal
    $scope.closeInfoModal = function () {
        $scope.showInfoModal = false;
    };

    $scope.showPendingActivitySurveyNotification = function () {
        return $scope.pendingActivitySurveys.length > 0;
    };

    $scope.answerActivityProfileSurvey = function (surveyInfo) {
        loadingSurvey = surveyInfo._id;

        $http.get('/query/surveys?query={"_id":"' + surveyInfo._id + '"}')
            .success(function (result) {
                if (result.length === 1) {
                    $scope.answerActivitySurvey({surveyInformation: result[0]});

                    loadingSurvey = undefined;
                }
            });
    };

    $scope.isSurveyLoading = function (surveyId) {
        return loadingSurvey === surveyId;
    };

    $scope.openActivitySurveyClassifyModal = function () {
        $scope.showActivitySurveyClassifyModal = true;
    };

    $scope.closeActivitySurveyClassifyModal = function () {
        $scope.showActivitySurveyClassifyModal = false;
    };

    //Update the activities of the tester based on the classification of submitted activity surveys (that were not classified
    //earlier)
    $scope.updateActivitiesOfTester = function () {
        var userRecord = {},
            i;

        $scope.updatingUserActivity = true;

        userRecord._id = $scope.user._id;

        userRecord.winter = $scope.user.winter || [];

        userRecord.summer = $scope.user.summer || [];

        for (i = 0; i < $scope.pendingClassificationSurveys.length; i++) {
            switch ($scope.pendingClassificationSurveys[i].activityType) {
                case 'winter':
                    if (userRecord.winter.indexOf($scope.pendingClassificationSurveys[i].activity) === -1) {
                        userRecord.winter.push($scope.pendingClassificationSurveys[i].activity);
                    }
                    break;

                case 'summer':
                    if (userRecord.summer.indexOf($scope.pendingClassificationSurveys[i].activity) === -1) {
                        userRecord.summer.push($scope.pendingClassificationSurveys[i].activity);
                    }
                    break;

                case 'both':
                    if (userRecord.winter.indexOf($scope.pendingClassificationSurveys[i].activity) === -1) {
                        userRecord.winter.push($scope.pendingClassificationSurveys[i].activity);
                    }

                    if (userRecord.summer.indexOf($scope.pendingClassificationSurveys[i].activity) === -1) {
                        userRecord.summer.push($scope.pendingClassificationSurveys[i].activity);
                    }
                    break;
            }
        }

        $http.put('/api/updateUser', userRecord)
            .success(function (result) {
                $scope.closeActivitySurveyClassifyModal();

                //Refresh the screen to get latest details
                $timeout(function () {
                    $route.reload();
                }, 700);
            })
            .error(function (err) {
                console.log('ERR');
                console.log(err);
            });
    };

    //Update the tester availability
    $scope.updateAvailability = function () {
        var user = {
                _id: $scope.user._id,
                unavailableToTest: $scope.user.unavailableToTest
            },
            path = '/api/mesh01/users/' + user._id;

        notificationWindow.show('Updating your testing availability status...', true);

        $http.put(path, user)
            .success(function (result) {
                if (result._id === user._id && result.unavailableToTest === user.unavailableToTest) {
                    notificationWindow.show('Testing availability status updated successfully', false);
                    //Update our record too
                    $scope.user = result;
                } else {
                    notificationWindow.show('Failed to update your testing availability status', false);
                }
            })
            .error(function (err) {
                notificationWindow.show('Failed to update your testing availability status', false);
            });
    };

    //Initially, fetch the user details
    $scope.fetchUserDetails();
}]);

dashboardApp.controller('TesterProfileSubmittedSurveyCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    'use strict';

    //Object to ensure two-way changes
    $scope.obj = {canEdit: false};

    //Controls the display of the survey - edit or view
    $scope.displayMode = "viewSurvey";

    //Copy of the provided submitted-survey details
    //We need a clone of it to avoid changes to the submitted survey to reflect in the consumer
    //The change in the consumer should also happen only when an explicit update is triggered
    $scope.surveyDetailsClone = {};

    //Change the display mode
    $scope.changeDisplayMode = function (mode) {
        $scope.displayMode = mode;
    };

    //Update the survey
    $scope.updateSurvey = function () {
        //Since the child directive is responsible for the same, notify it
        $scope.executeUpdate =  true;

        //Reset the notification after some time
        $timeout(function () {
            $scope.executeUpdate = false;
        }, 300);
    };
}]);
