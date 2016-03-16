/***************************************************************
 This contains the controller for the "Product Tests" dashboard
item of a user of type Tester
***************************************************************/

dashboardApp.controller('ProductTestsItemCtrl', ['$scope', '$http', '$filter', '$timeout', 'loginState', 'store', 'checkRosterUpdates', function ($scope, $http, $filter, $timeout, loginState, store, checkRosterUpdates) {
    'use strict';

    //The currently active tab
    //1 - Current Tests
    //2 - Pending Requests
    //3 - New Product Tests
    //4 - Past Tests
    //By Default, tab 1 is active
    $scope.activeTab = 1;

    //User Details
    $scope.currentUser = {};

    //Get the user details
    loginState.getLoginState(function (data) {
        //Store the user data
        $scope.currentUser = data.userInfo;

        //Fetch the Wear Tests
        $scope.fetchWearTests();
    });

    //Loading the different Wear Tests
    $scope.loadingCurrentWearTests = true;
    $scope.loadingPendingWearTests = true;
    $scope.loadingNewWearTests = true;
    $scope.loadingPastWearTests = true;

    //User participation is confirmed
    $scope.participationConfirmed = false;

    if (store.get('testerPTItem')) {
        switch (store.get('testerPTItem')) {
            case 'pending':
                $scope.activeTab = 2;
                break;

            case 'new':
                $scope.activeTab = 3;
                break;

            case 'past':
                $scope.activeTab = 4;
                break;
        }
        store.set('testerPTItem');
    }

    //Identify if the tab is active
    $scope.isTabActive = function (tabNum) {
        return $scope.activeTab === tabNum;
    };

    //Set the tab as active tab
    $scope.setActiveTab = function (tabNum) {
        $scope.activeTab = tabNum;
    };

    //Fetch the relevant Wear Tests
    $scope.fetchWearTests = function () {
        //Initialize the different Wear Tests
        $scope.currentWearTests = [];
        $scope.pendingWearTests = [];
        $scope.newWearTests = [];
        $scope.pastWearTests = [];

        $scope.loadingCurrentWearTests = true;
        $scope.loadingPendingWearTests = true;
        $scope.loadingNewWearTests = true;
        $scope.loadingPastWearTests = true;

        //First, fetch all current wear tests
        $http.get('/query/weartest?query={"status":"active","participants":{"$elemMatch":{"userIdkey":"'+ $scope.currentUser._id + '","status":"on team"}}}')
            .success(function (record) {
                $scope.currentWearTests = record;
                $scope.loadingCurrentWearTests = false;
            });

        //Next, get all the pending wear tests
        $http.get('/query/weartest?query={"status":"active","participants":{"$elemMatch":{"userIdkey":"' + $scope.currentUser._id + '","status":{"$in":["requested","invited","confirmed","drafted","team full","removed"]}}}}')
            .success(function (record) {
                $scope.pendingWearTests = record;
                $scope.loadingPendingWearTests = false;
            });

        //Next get all the new wear tests
        //For this, we need to get tomorrow's date to get all Wear Tests whose registration end later than today or today
        var todayDate = new Date();
        var yesterdayDate = new Date(todayDate.getTime() - (24 * 60 * 60 *1000)).toISOString();
        $http.get('/query/weartest?query={"status":"active","isPrivate":false,"participants.userIdkey":{"$nin":["' + $scope.currentUser._id + '"]},"$and":[{"registrationStart":{"$lte":"' + todayDate + '"}},{"registrationDeadline":{"$gte":"' + yesterdayDate + '"}}]}')
            .success(function (record) {
                $scope.newWearTests = record;
                $scope.loadingNewWearTests = false;
            });

        //Finally, get all the past wear tests
        $http.get('/query/weartest?query={"status":"closed","participants":{"$elemMatch":{"userIdkey":"' + $scope.currentUser._id + '","status":"on team"}}}')
            .success(function (record) {
                $scope.pastWearTests = record;
                $scope.loadingPastWearTests = false;
            });
    };

    //Confirm the participation of the user
    $scope.confirmUserParticipation = function (wearTestDetails, status) {
        var update = false,
            status;

        //Get the participant's record and update it
        for (var i = 0; i < wearTestDetails.participants.length; i++) {
            if (wearTestDetails.participants[i].userIdkey === $scope.currentUser._id) {
                //Ensure that status is invited before confirming
                if (wearTestDetails.participants[i].status === "invited") {
                    update = true;
                    break;
                }
            }
        }

        if (update) {
            var rosterUpdates = {
                wearTestId: wearTestDetails._id,
                testerIds: [$scope.currentUser._id],
                userId: $scope.currentUser._id,
                newStatus: status,
                acceptedTermsAndConditions: [{
                  url: wearTestDetails.rulesLink,
                  acceptedDate: new Date().toISOString()
                }]
            };

            if (status === "confirmed" ) {
                rosterUpdates ["emailTemplateName" ] = "ROSTER_ACCEPT_EMAIL_TEMPLATE";
            }

            $http.post('/rosterUpdates', JSON.stringify(rosterUpdates))
                .success(checkRosterUpdates(rosterUpdates))
                .success(function (data) {
                    $scope.fetchWearTests();
                });
        }
    };

    //Request participation of user
    $scope.requestUserParticipation = function (wearTestDetails) {
        var rosterUpdates = {
            wearTestId: wearTestDetails._id,
            testerIds: [$scope.currentUser._id],
            userId: $scope.currentUser._id,
            newStatus: "requested",
            emailTemplateName: "PREREG_TEST_EMAIL_TEMPLATE"
        };

        $http.post('/rosterUpdates', JSON.stringify(rosterUpdates))
            .success(checkRosterUpdates(rosterUpdates))
            .success(function (data) {
                $scope.participationConfirmed = true;

                // Wait until the server has processed the data
                // 3 seconds is enough
                $timeout(function () {
                    $scope.fetchWearTests();
                }, 3000);
            });
    };

    //Update the weartest
    $scope.updateWearTest = function (wearTestDetails) {

        $http.put('/api/mesh01/weartest/' + wearTestDetails._id, wearTestDetails)
            .success(function (result) {
                //Fetch the latest data
                $scope.fetchWearTests();
            });
    };

}]);

dashboardApp.controller('CurrentProductTestsCtrl', ['$scope', '$http', '$filter', 'activityLogCount', 'wearTestScorePolicy','$location','$anchorScroll', function ($scope, $http, $filter, activityLogCount, wearTestScorePolicy,$location,$anchorScroll) {
    'use strict';

    //Details of a newly create activity log
    var newLogData = {
        activityType: "Running",
        conditions: "Sun",
        intensity: 1,
        terrain: "Flat",
        temperature: 70,
        temperatureUnits: "F",
        distance: "0.0",
        distanceUnits: "miles",
        durationHours: "00",
        durationMinutes: "00",
        durationSeconds: "00",
        wearTests: [],
        activityDate: new Date().toISOString(),
        notes: ""
    };

    //Model which controls the display of the modal for Wear Test details
    $scope.displayInfo = false;

    $scope.wearTestInfo = {};

    //The Image Set modal control
    $scope.showImageSetModal = false;

    $scope.imageSetModalOptions = {
        keyboard: false,
        backDropClick: false,
        backdropFade: true,
        dialogFade: true,
        dialogClass: 'modal wider'
    };

    $scope.modalSurveyOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
        dialogClass: 'modal surveyBuilder wider'
    };

    //Details of the Image Set of a specific Wear Test
    $scope.imageSetDetails = {};

    //Identifies if we need to update the data when the user is done updating
    //the image set
    $scope.updateImageSetInfoPostModalClose = false;

    //The log that a user will create
    $scope.logData = {};

    //We consider only single Wear Tests during activity log creation
    //Thus, we hide the Wear Test selections screen from the Activity Logs
    $scope.hideWearTestSelection = true;

    //Keeps track of when a Wear Test needs to be updated
    $scope.updateWearTestInfoPostActivityLogCreation = false;

    //Do not show the activity log modals initially
    $scope.showActivityLogModal = false;

    $scope.dialogOptions = {
        backdropFade: true,
        dialogFade: true
    };

    $scope.completionStatus = {
        activityLogs: false,
        surveys: false,
        wearAndTear: false
    };

    $scope.activityLogsCount = [];

    $scope.wearTestIds = [];
    $scope.surveyIds = [];

    $scope.productSurveys = [];

    $scope.imageSets = [];

    //Data Points Editor controls
    $scope.showDataPointsEditor = false;

    $scope.dataPointsEditorModalOptions = {
        backdropFade: true,
        dialogFade: true,
        dialogClass: 'modal data-point wider'
    };

    $scope.completed = [];

    //Set the % of completion by the participant for each wear test
    $scope.setCompletionPercentage = function () {
        var value;

        $scope.completed = [];

        for (var i = 0; i < $scope.weartests.length; i++) {
            value = $scope.getParticipationScore($scope.weartests[i], true);
            $scope.completed.push(value);
        }
    };

    //Update the participants score for the given wear test
    $scope.updateParticipantScore = function (weartest) {
        var surveyCount = 0,
            wearAndTearCount = 0,
            performanceZoneCount = 0,
            logCount = 0,
            totalScore = 0,
            result,
            i;

        //Calculate the contribution of surveys towards the score
        for (i = 0; i < weartest.productSurveys.length; i++) {
            //Assume first that this survey has not been submitted
            result = false;

            //See if the survey has been submitted
            result = $scope.checkSurveyStatus(2, weartest.productSurveys[i].survey_id, weartest._id);

            if (result === true) {
                //Survey has been submitted. Consider it for scoring
                surveyCount = surveyCount + 1;
            }
        }

        //Calculate the contribution of wear and tear towards the score
        for (i = 0; i < weartest.productWearAndTearDates.length; i++) {
            //Assume that the wear and tear image has not bee uploaded
            result = false;

            //See if the image has been submitted
            result = $scope.checkWearAndTearStatus(2, weartest._id, i);

            if (result === true) {
                //Wear and Tear image has been submitted
                wearAndTearCount = wearAndTearCount + 1;
            }
        }

        //Calculate the contribution of performance zone towards the score
        for (i = 0; i < weartest.performanceZonesDates.length; i++) {
            //Assume the data points have not been submitted
            result = false;

            //See if the data points have been added
            result = $scope.checkPerformanceZoneStatus(2, weartest._id, i);

            if (result === true) {
                //Data points have been added
                performanceZoneCount = performanceZoneCount + 1;
            }
        }

        //Calculate the contribution of activity logs towards the score
        logCount = $scope.getActualActivityLogCount(weartest._id);

        //Finally, calculate the score for the participant;
        totalScore = (surveyCount * wearTestScorePolicy.surveyScore) + (wearAndTearCount * wearTestScorePolicy.wearAndTearScore) + (performanceZoneCount * wearTestScorePolicy.performanceZoneScore) + (logCount * wearTestScorePolicy.activityLogScore);

        //Now, get the participant in the wear test and update its score
        for (i = 0; i < weartest.participants.length; i++) {
            if (weartest.participants[i].userIdkey === $scope.userDetails._id) {
                weartest.participants[i].scoreReceived = totalScore;
                break;
            }
        }

        //Request the parent to update the weartest information
        $scope.updateData({
            wearTestDetails: weartest
        });
    };

    //Get the activity logs for the current Wear Test of the current user
    $scope.getUserActivityLogsForWearTest = function (updateScoreForParticipant) {
        var activityLogs = [],
            found,
            countRecord,
            queryBuilder = '';

        $scope.completionStatus.activityLogs = false;

        //Proceed only if we have Wear Tests
        if ($scope.wearTestIds.length === 0) {
            $scope.completionStatus.activityLogs = true;
            return;
        }

        //Prepare the query string
        queryBuilder = '[';
        for (var i = 0; i < $scope.wearTestIds.length; i++) {
            if (i > 0) {
                queryBuilder = queryBuilder + ',';
            }

            queryBuilder = queryBuilder + '"' + $scope.wearTestIds[i] + '"';
        }
        queryBuilder = queryBuilder + ']';

        //Get the activity logs of the current user for the provided Wear Test
        $http.get('/query/activityLogs?query={"userId":"' + $scope.userDetails._id + '","wearTests._id":{"$in":' + queryBuilder + '}}')
            .success(function (result) {
                activityLogs = result;
                $scope.activityLogsCount = [];

                //We are only concerned with the count of the activity logs
                //Organize the activity logs by grouping them based on the Wear Test they are
                //associated with
                for (var i = 0; i < activityLogs.length; i++) {
                    //Loop over the Wear Tests associated with this log
                    for (var j = 0; j < activityLogs[i].wearTests.length; j++) {
                        //Loop over the existing counts of Wear Tests.
                        //If Wear Test is found, simply increment the count
                        //Else, create and store a new count record

                        //Initially, we did not find any count record yet
                        found = false;

                        for (var k = 0; k < $scope.activityLogsCount.length; k++) {
                            if ($scope.activityLogsCount[k].wearTestId === activityLogs[i].wearTests[j]._id) {
                                //Found the count record. Simply increment the count
                                found = true;
                                $scope.activityLogsCount[k].count = $scope.activityLogsCount[k].count + 1;
                                break;
                            }
                        }

                        //If count record is not found
                        if (!found) {
                            //Create a new one
                            countRecord = {};
                            countRecord.wearTestId = activityLogs[i].wearTests[j]._id;
                            countRecord.count = 1;
                            $scope.activityLogsCount.push(countRecord);
                        }
                    }
                }

                if (updateScoreForParticipant) {
                    //Update the participant score
                    $scope.updateParticipantScore($scope.wearTestDetails);
                }

                if (updateScoreForParticipant !== true) {
                    $scope.completionStatus.activityLogs = true;
                }
            });

    };

    //Get the surveys of the current Wear Test and completed by the current user
    $scope.getProductSurveys = function (updateScoreForParticipant) {
        var queryBuilder = '',
            surveyRecord;

        $scope.completionStatus.surveys = false;

        //Return if we do not have any Survey IDs with us
        if ($scope.surveyIds.length === 0) {
            $scope.completionStatus.surveys = true;
            return;
        }

        //Prepare the query string
        queryBuilder = '[';
        for (var i = 0; i < $scope.surveyIds.length; i++) {
            if (i > 0) {
                queryBuilder = queryBuilder + ',';
            }

            queryBuilder = queryBuilder + '"' + $scope.surveyIds[i] + '"';
        }
        queryBuilder = queryBuilder + ']';

        //Get the Surveys - Surveys that the current user has submitted for the Surveys
        //existing in the Wear Tests
        $http.get('/query/surveys_submitted?query={"createUserId":"' + $scope.userDetails._id + '","surveyId":{"$in":' + queryBuilder + '}}')
            .success(function (result) {
                var surveysSubmitted,
                    found,
                    weartest;
                //Organize the Surveys by grouping them to the Wear Test that they are associated with
                surveysSubmitted = result;

                for (var i = 0; i < surveysSubmitted.length; i++) {
                    found = false;
                    //Look for the Wear Test ID associated with the Survey
                    for (var j = 0; j < $scope.productSurveys.length; j++) {
                        if ($scope.productSurveys[j].wearTestId === surveysSubmitted[i].weartestId) {

                            //Wear Test Record already exists. Add the current surey to associate
                            //it with the Wear Test
                            $scope.productSurveys[j].submittedSurvey.push(surveysSubmitted[i]);
                            found = true;
                            break;
                        }
                    }

                    //Check if the Wear Test record associated with the Survey is found or not
                    if (!found) {
                        //Record not found. Create one.
                        surveyRecord = {};
                        surveyRecord.wearTestId = surveysSubmitted[i].weartestId;
                        surveyRecord.submittedSurvey = [];
                        surveyRecord.submittedSurvey.push(surveysSubmitted[i]);
                        $scope.productSurveys.push(surveyRecord);
                    }
                }

                //Update the participant score
                if (updateScoreForParticipant) {
                    for (var i = 0; i < $scope.weartests.length; i++) {
                        if ($scope.weartests[i]._id === $scope.weartestIdToCompile) {
                            weartest = $scope.weartests[i];
                            break;
                        }
                    }

                    if (weartest) {
                        $scope.updateParticipantScore(weartest);
                    }
                }

                //If score is being calculated, wait for it to complete
                if (updateScoreForParticipant !== true) {
                    $scope.completionStatus.surveys = true;
                }
            });
    };

    //Calculate the number of activity logs expected for the provided Wear Test
    $scope.getExpectedActivityLogCount = function (wearTestDetails) {
        return activityLogCount.get(wearTestDetails);
    };

    //Return the available Activity Logs of the current user for the provided Wear Test
    $scope.getActualActivityLogCount = function (wearTestId) {
        //Find the count associated with the Wear Test Id
        for (var i = 0; i < $scope.activityLogsCount.length; i++) {
            if ($scope.activityLogsCount[i].wearTestId === wearTestId) {
                return $scope.activityLogsCount[i].count;
            }
        }

        //No record found. No activity log exists
        return 0;
    };

    //Checks the status of a Survey for a Wear Test
    $scope.checkSurveyStatus = function (status, surveyId, wearTestId) {
        //First - check if the survey has been completed

        for (var i = 0; i < $scope.productSurveys.length; i++) {
            //console.log($scope.productSurveys[i].wearTestId)
            if ($scope.productSurveys[i].wearTestId === wearTestId) {
                for (var j = 0; j < $scope.productSurveys[i].submittedSurvey.length; j++) {
                    if ($scope.productSurveys[i].submittedSurvey[j].surveyId === surveyId) {
                        //Survey has been completed
                        return status === 2;
                    }
                }
            }
        }

        //Next, check if the Survey Delivery date is earlier than today
        for (var i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                for (var j = 0; j < $scope.weartests[i].productSurveys.length; j++) {
                    if ($scope.weartests[i].productSurveys[j].survey_id === surveyId) {
                        if (new Date($scope.weartests[i].productSurveys[j].triggerDate) <= new Date()) {
                            //Delivery Date is earlier than /equal to todays date.
                            //Also, survey does not seem to have been submitted / completed
                            //Survey is still available
                            return status === 0;
                        } else {
                            //Delivery Date of Survey is in the future.
                            //Survey still not available
                            return status === 1;
                        }
                    }
                }
            }
        }
    };

    //Returns the date of Survey Completion
    $scope.getSurveyCompletionDate = function (surveyId, wearTestId) {
        for (var i = 0; i < $scope.productSurveys.length; i++) {
            if ($scope.productSurveys[i].wearTestId === wearTestId) {
                for (var j = 0; j < $scope.productSurveys[i].submittedSurvey.length; j++) {
                    if ($scope.productSurveys[i].submittedSurvey[j].surveyId === surveyId) {
                        return $scope.productSurveys[i].submittedSurvey[j].createdDate;
                    }
                }
            }
        }
    };

    //Checks if all the data needed for the View are loaded or not
    $scope.isLoadingComplete = function () {
        var result = true;

        //Combine the loading of all the sections and provide the final loading result
        for (var key in $scope.completionStatus) {
            if ($scope.completionStatus.hasOwnProperty(key)) {
                result = result && $scope.completionStatus[key];
            }
        }

        return result;
    };

    //Get the images in the Image Set corresponding to the Wear Tests
    $scope.getImagesInImageSetOfWearTest = function (updateScoreForParticipant) {
        var imageSetIds = [],
            queryBuilder = '',
            i;

        $scope.completionStatus.wearAndTear = false;

        //First collect all the Image Set Ids
        for (i = 0; i < $scope.weartests.length; i++) {
            if (imageSetIds.indexOf($scope.weartests[i].imageSetId) === -1) {
                imageSetIds.push($scope.weartests[i].imageSetId);
            }
        }

        //Proceed only if we have Image Sets to retrieve
        if (imageSetIds.length === 0) {
            $scope.imageSets = [];
            $scope.completionStatus.wearAndTear = true;
            return;
        }

        //Prepare the query string
        queryBuilder = '[';
        for (i = 0; i < imageSetIds.length; i++) {
            if (i > 0) {
                queryBuilder = queryBuilder + ',';
            }

            queryBuilder = queryBuilder + '"' + imageSetIds[i] + '"';
        }
        queryBuilder = queryBuilder + ']';

        //Now, get the Image Set details
        $http.get('/query/imagesets?query={"_id":{"$in":' + queryBuilder + '}}')
            .success(function (result) {
                $scope.imageSets = result;

                if (updateScoreForParticipant) {
                    //Update the participant score
                    $scope.updateParticipantScore($scope.wearTestDetails);
                } else {
                    //Loading is now completed
                    $scope.completionStatus.wearAndTear = true;
                }
            });
    };

    //Checks the status of a Wear and Tear Delivery Date for a Wear Test
    $scope.checkWearAndTearStatus = function (status, wearTestId, count) {
        var images = [],
            wearTestDetails = {},
            imageSetDetails = {},
            i;

        //First get the corresponding Wear Test details
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                wearTestDetails = $scope.weartests[i];
                //Found our Wear Test. Look no further
                break;
            }
        }

        //Next, check if the delivery date is later than today's date
        if (new Date(wearTestDetails.productWearAndTearDates[count]) > new Date()) {
            return status === 1;
        }

        //Now, get the Details of the Image Set of the Wear Test
        for (i = 0; i < $scope.imageSets.length; i++) {
            if (wearTestDetails.imageSetId === $scope.imageSets[i]._id) {
                imageSetDetails = $scope.imageSets[i];
                //Found the Image Set. Look no further
                break;
            }
        }

        if (angular.isUndefined(imageSetDetails.images)) {
            //No Images exist / data is still being loaded.
            //Initialize images in the imageset
            imageSetDetails.images = [];
        }

        //Now, get the images of type Wear and Tear
        for (i = 0; i < imageSetDetails.images.length; i++) {
            if (imageSetDetails.images[i].type === "wearAndTear" && imageSetDetails.images[i].uploadedById === $scope.userDetails._id) {
                //Add it to the list
                images.push(imageSetDetails.images[i]);
            }
        }

        //First - check the count of Wear and Tear images
        //If the count is greater than or equal to the count passed to this
        //function, then return status 2 else return 0
        if (images.length >= (count + 1)) {
            return status === 2;
        } else {
            return status === 0;
        }
    };

    //Returns the date of upload for an image associated with a Wear and Tear
    $scope.getImageUploadedDate = function (wearTestId, count) {
        var wearTestDetails = {},
            imageSetDetails = {},
            imageCount = 0,
            i;

        //First check that we have some Wear Tests loaded
        if ($scope.weartests.length === 0 || $scope.imageSets.length === 0) {
            return "N/A";
        }

        //First get the corresponding Wear Test details
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                wearTestDetails = $scope.weartests[i];
                //Found our Wear Test. Look no further
                break;
            }
        }

        //Now, get the Details of the Image Set of the Wear Test
        for (i = 0; i < $scope.imageSets.length; i++) {
            if (wearTestDetails.imageSetId === $scope.imageSets[i]._id) {
                imageSetDetails = $scope.imageSets[i];
                //Found the Image Set. Look no further
                break;
            }
        }

        if (angular.isUndefined(imageSetDetails.images)) {
            //No Images exist / data is still being loaded.
            //Initialize images in the imageset
            imageSetDetails.images = [];
        }

        //Now, get the images of type Wear and Tear
        for (i = 0; i < imageSetDetails.images.length; i++) {
            if (imageSetDetails.images[i].type === "wearAndTear" && imageSetDetails.images[i].uploadedById === $scope.userDetails._id) {
                //Check if the count passed matches the count of images found
                if (count === imageCount) {
                    return $filter('date')(imageSetDetails.images[i].createdDate, 'MM/dd/yyyy');
                } else {
                    //Increase the count of the images found
                    imageCount = imageCount + 1;
                }
            }
        }
    };

    //Returns the date of creation of the first data point associated with an image
    $scope.getDataPointCreatedDate = function (wearTestId, count) {
        var wearTestDetails = {},
            imageSetDetails = {},
            dataPointCount = 0,
            i;

        //First check that we have some Wear Tests loaded
        if ($scope.weartests.length === 0 || $scope.imageSets.length === 0) {
            return "N/A";
        }

        //First get the corresponding Wear Test details
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                wearTestDetails = $scope.weartests[i];
                //Found our Wear Test. Look no further
                break;
            }
        }

        //Now, get the Details of the Image Set of the Wear Test
        for (i = 0; i < $scope.imageSets.length; i++) {
            if (wearTestDetails.imageSetId === $scope.imageSets[i]._id) {
                imageSetDetails = $scope.imageSets[i];
                //Found the Image Set. Look no further
                break;
            }
        }

        if (angular.isUndefined(imageSetDetails.images)) {
            //No Images exist / data is still being loaded.
            //Initialize images in the imageset
            imageSetDetails.images = [];
        }

        //Now get the first Data Point uploaded by the current user
        for (i = 0; i < imageSetDetails.images.length; i++) {
            if (imageSetDetails.images[i].type === "productImage" && !angular.isUndefined(imageSetDetails.images[i].dataPoints)) {
                //Now check if the current user has created any data points in the image
                for (var k = 0; k < imageSetDetails.images[i].dataPoints.length; k++) {
                    if (imageSetDetails.images[i].dataPoints[k].userId === $scope.userDetails._id) {
                        //Check if the count passed matches the count of data points found
                        if (count === dataPointCount) {
                            return $filter('date')(imageSetDetails.images[i].dataPoints[k].createdDate, 'MM/dd/yyyy');
                        } else {
                            //Increase the count of the data points found
                            dataPointCount = dataPointCount + 1;
                        }
                    }
                }
            }
        }

    };

    //Upload an image to the Image Set associated with the Wear Test for a Wear and Tear survey
    $scope.uploadWearAndTearImage = function (wearTestId) {
        var wearTestDetails = {},
            imageSetDetails = {},
            i;

        //Reset the Image Set data
        $scope.imageSetDetails = {};

        //First get the corresponding Wear Test details
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                wearTestDetails = $scope.weartests[i];
                //Found our Wear Test. Look no further
                break;
            }
        }

        $scope.wearTestDetails = wearTestDetails;

        //Now, get the Details of the Image Set of the Wear Test
        for (i = 0; i < $scope.imageSets.length; i++) {
            if (wearTestDetails.imageSetId === $scope.imageSets[i]._id) {
                imageSetDetails = $scope.imageSets[i];
                //Found the Image Set. Look no further
                break;
            }
        }

        //Proceed only if the Image Set is found
        if (angular.isUndefined(imageSetDetails._id)) {
            return;
        } else {
            $scope.imageSetDetails = imageSetDetails;
        }

        //Proceed to display the Image Set modal
        $scope.displayImageSetModal();
    };

    //Allow the user to create an activity log for the supplied Wear Test
    $scope.enterActivityLog = function (wearTestDetails) {
        $scope.wearTestDetails = wearTestDetails;

        //Supply the data of a newly created log
        angular.copy(newLogData, $scope.logData);

        //Since this log is associated with a Wear Test, we assign the details to the log
        $scope.logData.wearTests.push(wearTestDetails);

        //The first question will do
        $scope.questionNumber = 2;

        //We are creating a new activity log - mode => "create"
        $scope.activityLogMode = "create";

        //Finally, show the activity log modal
        $scope.showActivityLogModal = true;
    };

    //Checks the status of a Performance Zone Delivery Date for a Wear Test
    $scope.checkPerformanceZoneStatus = function (status, wearTestId, count) {
        var dataPointsCount = 0,
            wearTestDetails = {},
            imageSetDetails = {},
            i;

        //First get the corresponding Wear Test details
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                wearTestDetails = $scope.weartests[i];
                //Found our Wear Test. Look no further
                break;
            }
        }

        //Next, check if the delivery date is later than today's date
        if (new Date(wearTestDetails.performanceZonesDates[count]) > new Date()) {
            return status === 1;
        }

        //Now, get the Details of the Image Set of the Wear Test
        for (i = 0; i < $scope.imageSets.length; i++) {
            if (wearTestDetails.imageSetId === $scope.imageSets[i]._id) {
                imageSetDetails = $scope.imageSets[i];
                //Found the Image Set. Look no further
                break;
            }
        }

        if (angular.isUndefined(imageSetDetails.images)) {
            //No Images exist / data is still being loaded.
            //Initialize images in the imageset
            imageSetDetails.images = [];
        }

        //Now, get the images of type Product Image
        for (i = 0; i < imageSetDetails.images.length; i++) {
            if (imageSetDetails.images[i].type === "productImage" && !angular.isUndefined(imageSetDetails.images[i].dataPoints)) {
                //Now check if the current user has created any data points in the image
                for (var k = 0; k < imageSetDetails.images[i].dataPoints.length; k++) {
                    if (imageSetDetails.images[i].dataPoints[k].userId === $scope.userDetails._id) {
                        dataPointsCount = dataPointsCount + 1;
                    }
                }
            }
        }

        //First - check the count of Wear and Tear images
        //If the count is greater than or equal to the count passed to this
        //function, then return status 2 else return 0
        if (dataPointsCount >= (count + 1)) {
            return status === 2;
        } else {
            return status === 0;
        }
    };

    //Prepares the information needed for the Data Points editor
    $scope.openDataPointsEditor = function (wearTestId) {
        var wearTestDetails = {},
            imageSetDetails = {},
            i;

        //Reset the Image Set data
        $scope.imageSetDetails = {};

        //First get the corresponding Wear Test details
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                wearTestDetails = $scope.weartests[i];
                //Found our Wear Test. Look no further
                break;
            }
        }

        $scope.wearTestDetails = wearTestDetails;

        //Now, get the Details of the Image Set of the Wear Test
        for (i = 0; i < $scope.imageSets.length; i++) {
            if (wearTestDetails.imageSetId === $scope.imageSets[i]._id) {
                imageSetDetails = $scope.imageSets[i];
                //Found the Image Set. Look no further
                break;
            }
        }

        //Proceed only if the Image Set is found
        if (angular.isUndefined(imageSetDetails._id)) {
            return;
        } else {
            $scope.imageSetDetails = imageSetDetails;
        }

        //Proceed to display the Data Points editor
        $scope.displayDataPointsEditor();
    };

    //Show the Performance Zone Data Point Editor modal
    $scope.displayDataPointsEditor = function () {
        $scope.showDataPointsEditor = true;
    };

    //Hide the Performance Zone Data Point Editor modal
    $scope.hideDataPointsEditor = function () {
        //Check if the user made any changes to the Image Set
        if ($scope.updateImageSetInfoPostModalClose === true) {
            //Update the Image Set information that we have
            $scope.getImagesInImageSetOfWearTest(true);

            //Reset information
            $scope.updateImageSetInfoPostModalClose = false;
        }

        $scope.showDataPointsEditor = false;
    };

    //Show the Image Set Management modal
    $scope.displayImageSetModal = function () {
        $scope.showImageSetModal = true;
    };

    //Hide the Image Set Management modal
    $scope.closeImageSetModal = function () {
        //Check if the user made any changes to the Image Set
        if ($scope.updateImageSetInfoPostModalClose === true) {
            //Update the Image Set information that we have
            $scope.getImagesInImageSetOfWearTest(true);

            //Reset information
            $scope.updateImageSetInfoPostModalClose = false;
        }

        $scope.showImageSetModal = false;
    };

    //Returns true if current wear tests exist
    $scope.entriesExist = function () {
        if (angular.isArray($scope.weartests)) {
            return $scope.weartests.length > 0;
        } else {
            //Not an array. Invalid data?
            return false;
        }
    };

    //Get the scaled image
    $scope.getScaledWearTestImage = function (fullSizeImageUrl) {
        //Check if URL is provided
        if (fullSizeImageUrl === undefined) {
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

        var width = "w_209";
        var height = "h_175";
        var transformMode = "c_fit";
        // change  above is shown on test:My Current tests

        //Finally return the URL
        return hostUrl + '/' + width +',' + height + ',' + transformMode + '/' + imageIdUrl;
    };

    //Show the modal to display the info on the Wear Test
    $scope.showInfoModal = function (wearTestDetails) {
        $scope.displayInfo = true;

        $scope.wearTestInfo = wearTestDetails;
    };

    //answerQuestions
    $scope.answerQuestions = function (survey, weartest) {
        $scope.surveyToCompile = survey;
        $scope.weartestIdToCompile = weartest._id;

        $scope.displayAnswerSurveyModal();
    };

    $scope.$on("surveySubmited", function() {
        $scope.getProductSurveys(true);

        $scope.hideAnswerSurveyModal();
    });

    //answerQuestions
    $scope.submitSurvey = function (survey) {
        $scope.$broadcast("submitSurvey");
    };

    //Hide the Answering Survey modal
    $scope.hideAnswerSurveyModal = function () {
        $scope.showSurvey = false;
        $scope.$broadcast("clearActiveSurvey");
    };

    //Show the Answer Survey modal
    $scope.displayAnswerSurveyModal = function () {
        $scope.showSurvey = true;
        $location.hash(0);
        $anchorScroll();
    };

    //Get the score of the participant for the provided Wear Test
    $scope.getParticipationScore = function (weartest, inPercent) {
        var score = 0;

        for (var i = 0; i < weartest.participants.length; i++) {
            if (weartest.participants[i].userIdkey === $scope.userDetails._id) {
                if (angular.isDefined(weartest.participants[i].scoreReceived)) {
                    score = weartest.participants[i].scoreReceived;
                }
                break;
            }
        }

        //Get the % of participation / completion
        if (angular.isDefined(weartest.availablePoints)) {
            if (inPercent) {
                score = Math.round(score / weartest.availablePoints * 100);
            }
        } else {
            score = 0;
        }

        return score;
    };
    $scope.openVideoManagerLinkForWeartest = function (weartestId) {
        var wearTestDetails = {},
            imageSetDetails = {},
            i;

        //Reset the Image Set data
        $scope.imageSetDetails = {};

        //First get the corresponding Wear Test details
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === weartestId) {
                wearTestDetails = $scope.weartests[i];
                //Found our Wear Test. Look no further
                break;
            }
        }

        $scope.wearTestDetails = wearTestDetails;

        //Now, get the Details of the Image Set of the Wear Test
        for (i = 0; i < $scope.imageSets.length; i++) {
            if (wearTestDetails.imageSetId === $scope.imageSets[i]._id) {
                imageSetDetails = $scope.imageSets[i];
                //Found the Image Set. Look no further
                break;
            }
        }

        //Navigate to the link

        $location.path('/dashboard/weartest/current/' + weartestId + '/videos/' + imageSetDetails._id);
    };
}]);

dashboardApp.controller('PendingProductTestsCtrl', ['$scope', function ($scope) {
    'use strict';

    //Model to keep control over the display of the Terms of Conditions Modal
    $scope.showTOCModal = false;

    //Model which keeps track of the Wear Test whose TOC is about to be accepted
    $scope.wearTestInAcceptance = {};

    //Model which controls the display of the modal for Wear Test details
    $scope.displayInfo = false;
    $scope.wearTestInfo = {};

    //Modal control for Terms and Conditions display
    $scope.TOCDialogOptions = {
        backdropFade: true,
        dialogFade: true,
        dialogClass: 'modal modal-rules'
    };

    //Modal control for Decline Test
    $scope.modalOptions = {
        backdropFade: true,
        dialogFade: true
    };
    //Get the scaled image
    var getScaledImage = function (fullSizeImageUrl, width, height, transformMode) {
        //Check if URL is provided
        if (fullSizeImageUrl === undefined) {
            return;
        }

        // if transformode is not supplied set it to c_fit
        if (transformMode === undefined )  transformMode  = 'c_fit';

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
        return hostUrl + '/' + width +',' + height + ',' + transformMode + '/' + imageIdUrl;
    };

    //Returns true if current wear tests exist
    $scope.entriesExist = function () {
        if (angular.isArray($scope.weartests)) {
            return $scope.weartests.length > 0;
        } else {
            //Not an array. Invalid data?
            return false;
        }
    };

    //Checks if the user is invited to participate in the Wear Test
    $scope.isUserInvited = function (wearTestId) {
        var weartestDetails = null,
            i;

        //If data is still being loaded, return
        if ($scope.loadingData) {
            return;
        }

        //Get the Wear Test Details and find out about the participant
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                weartestDetails = $scope.weartests[i];
                break;
            }
        }

        for (i = 0; i < weartestDetails.participants.length; i++) {
            if (weartestDetails.participants[i].userIdkey === $scope.userId) {
                //Check if the status says "invited"
                if (weartestDetails.participants[i].status === "invited") {
                    return true;
                }
            }
        }

        return false;
    };

    //Returns the status of the current user in the Wear Test
    $scope.getParticipantStatus = function (wearTestId) {
        var weartestDetails = null,
            i;

        //If data is still being loaded, return
        if ($scope.loadingData) {
            return;
        }

        //Get the Wear Test Details and find out about the participant
        for (i = 0; i < $scope.weartests.length; i++) {
            if ($scope.weartests[i]._id === wearTestId) {
                weartestDetails = $scope.weartests[i];
                break;
            }
        }

        for (i = 0; i < weartestDetails.participants.length; i++) {
            if (weartestDetails.participants[i].userIdkey === $scope.userId) {
                //Return the participants status
                return weartestDetails.participants[i].status;
            }
        }
    };

    //Get the scaled image for the Wear Test
    $scope.getScaledWearTestImage = function (fullSizeImageUrl) {
        return getScaledImage(fullSizeImageUrl, "w_158", "h_84", "c_fit");
    };

    //Show the Terms of Conditions modal
    $scope.displayTOCModal = function (wearTestDetails) {
        $scope.wearTestInAcceptance = wearTestDetails;
        $scope.showTOCModal = true;
    };

    //Close the Terms of Condtions modal
    $scope.closeTOCModal = function () {
        $scope.wearTestInAcceptance = {};
        $scope.showTOCModal = false;
    };

    //Accept the invite to join the weartest
    $scope.acceptTOC = function () {
        $scope.confirmUserParticipation($scope.wearTestInAcceptance, "confirmed");
        $scope.closeTOCModal();
    };

    //Show the modal to display the info on the Wear Test
    $scope.showInfoModal = function (wearTestDetails) {
        $scope.displayInfo = true;

        $scope.wearTestInfo = wearTestDetails;
    };

    //Show the Decline modal
    $scope.displayDeclineModal = function (wearTestDetails) {
        $scope.wearTestInDecline = wearTestDetails;
        $scope.showDeclineModal = true;
    };

    //Close the Decline modal
    $scope.closeDeclineModal = function () {
        $scope.wearTestInDecline = {};
        $scope.showDeclineModal = false;
    };

      //decline Test
    $scope.declineTest = function () {
        $scope.confirmUserParticipation($scope.wearTestInDecline, "declined");
        $scope.closeDeclineModal();
    };

}]);

dashboardApp.controller('NewProductTestsCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
    'use strict';

    var wearTestIdForRequest;

    //To keep track of a request to join wear test
    $scope.requestInProgress = false;

    //Model which controls the display of the modal for Wear Test details
    $scope.displayInfo = false;
    $scope.wearTestInfo = {};

    $scope.participationConfirmDialogOptions = {
        backdropFade: true,
        dialogFade: true
    };

    //Model which controls display of confirmation to user's request of participation
    $scope.showParticipationConfirmation = false;

    //Returns true if current wear tests exist
    $scope.entriesExist = function () {
        if (angular.isArray($scope.weartests)) {
            return $scope.weartests.length > 0;
        } else {
            //Not an array. Invalid data?
            return false;
        }
    };

    //Get the scaled image
    $scope.getScaledWearTestImage = function (fullSizeImageUrl) {
        //Check if URL is provided
        if (fullSizeImageUrl === undefined) {
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

        var width = "w_158";
        var height = "h_84";
        var transormMode = "c_fit";

        //Finally return the URL
        return hostUrl + '/' + width +',' + height + ',' + transormMode + '/' + imageIdUrl;
    };

    //Show the modal to display the info on the Wear Test
    $scope.showInfoModal = function (wearTestDetails) {
        $scope.displayInfo = true;

        $scope.wearTestInfo = wearTestDetails;
    };

    //Join the wear test
    $scope.joinWearTest = function (wearTestDetails) {
        if ($scope.requestInProgress) {
            //A request is in progress.
            return;
        }

        //Notify that a request is in progress
        $scope.requestInProgress = true;
        //Remember the ID of the Wear Test for which the request has been made
        wearTestIdForRequest = wearTestDetails._id;

        $scope.wearTestInfo = wearTestDetails;

        $scope.requestUserParticipation(wearTestDetails);
    };

    //Show the participation confirmed modal
    $scope.displayParticipationConfirmationModal = function () {
        $scope.showParticipationConfirmation = true;
    };

    //Close the participation confirmed modal
    $scope.closeParticipationConfirmationModal = function () {
        $scope.showParticipationConfirmation = false;
    };

    //Verifies if a request is in progress for joining a Wear Test
    $scope.isRequestInProgress = function (wearTestRecord) {
        if ($scope.requestInProgress) {
            return wearTestRecord._id === wearTestIdForRequest;
        }

        //No request in progress
        return false;
    };
}]);

dashboardApp.controller('PastProductTestsCtrl', ['$scope', function ($scope) {
    'use strict';

    //Model which controls the display of the modal for Wear Test details
    $scope.displayInfo = false;
    $scope.wearTestInfo = {};

    $scope.dialogOptions = {
        backdropFade: true,
        dialogFade: true
    };

    //Returns true if current wear tests exist
    $scope.entriesExist = function () {
        if (angular.isArray($scope.weartests)) {
            return $scope.weartests.length > 0;
        } else {
            //Not an array. Invalid data?
            return false;
        }
    };

    //Get the scaled image
    $scope.getScaledWearTestImage = function (fullSizeImageUrl) {
        //Check if URL is provided
        if (fullSizeImageUrl === undefined) {
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

        var width = "w_158";
        var height = "h_84";
        var transformMode = "c_fit";

        //Finally return the URL
        return hostUrl + '/' + width +',' + height + ',' + transformMode + '/' + imageIdUrl;
    };

    //Show the modal to display the info on the Wear Test
    $scope.showInfoModal = function (wearTestDetails) {
        $scope.displayInfo = true;

        $scope.wearTestInfo = wearTestDetails;
    };
}]);
