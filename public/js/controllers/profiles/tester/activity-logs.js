/***************************************************************
 This contains the controller for the "Activity Logs" dashboard
item of a user of type Tester
***************************************************************/

dashboardApp.controller('ActivityLogsItemCtrl', ['$scope', '$http', '$filter', 'loginState', 'profileDetailCompletion', function ($scope, $http, $filter, loginState, profileDetailCompletion) {
    'use strict';

    //Contains the information on the current user
    $scope.currentUser = {};

    //Controls the display of the Activity Log create / edit modal
    $scope.showActivityLogModal = false;

    //The activity log displayed in the modal
    $scope.logData = {};

    //Already existing activity logs
    $scope.activityLog = [];

    //The Wear Tests for which the current user is a participant (on team)
    $scope.wearTests = [];

    //% of completion of the user profile details
    $scope.completed = 0;

    //Loading Wear Tests
    $scope.loadingWearTests = true;

    //Loading Activity Logs
    $scope.loadActivityLogs = false;

    $scope.loadingActivityLogs = true;

    //Default sort by column is the date column for activity log table
    $scope.currentSortColumn = "date";

    //Ascending or Descending sort
    $scope.reverse = true; //Descending

    $scope.latestLog = {};

    //Model of an individual activity log
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
        activityDate: new Date(),
        notes: ""
    };

    //Get the logged in users info
    loginState.getLoginState(function (data) {
        //Store the user data
        $scope.currentUser = data.userInfo;

        //Fetch the activity logs of the current user
        $http.get('/activityLogs/' + $scope.currentUser._id)
            .success(function (data) {
                $scope.activityLogs = data.data;

                getLatestLog();

                $scope.loadingActivityLogs = false;
            });

        //Now, load all the Wear Tests that are"
        //a) Active
        //b) The current user is a participant with status "On Team"
        $http.get('/query/weartest?query={"status":"active","participants":{"$elemMatch":{"userIdkey":"'+ $scope.currentUser._id + '","status":"on team"}}}')
            .success(function (data) {
                $scope.wearTests = data;
                $scope.loadingWearTests = false;
            });
    });

    var getLatestLog = function () {
        var latestLog,
            i;

        if ($scope.activityLogs.length === 0) {
            return;
        }

        latestLog = $scope.activityLogs[0];

        for (i = 1; i < $scope.activityLogs.length; i++) {
            if (latestLog.activityDate < $scope.activityLogs[i].activityDate) {
                latestLog = $scope.activityLogs[i];
            }
        }

        $scope.latestLog = latestLog;
    };

    //Create a new activity log
    $scope.createNewLog = function () {
        //Reset the buffer data containing information logged by the user
        angular.copy(newLogData, $scope.logData);

        //Update the currently active modal
        $scope.activeLogModalIndex = 1;

        //Yes, we are creating a new log
        $scope.activityLogMode = "create";

        //Show the activity log modal
        $scope.showActivityLogModal = true;
    };

    //Opens the Activity Log Modals in edit mode with pre determined data
    $scope.editActivityLog = function (logEntry, indexOfModalToOpen) {

        //Copy the data in the log entry to the scope of the modal
        angular.copy(logEntry, $scope.logData);

        //Set the modal index to be displayed
        $scope.activeLogModalIndex = indexOfModalToOpen;

        //We are now updating an existing log
        $scope.activityLogMode = "edit";

        //Show the activity log modal
        $scope.showActivityLogModal = true;
    };

    //Determines the column to sort by
    $scope.predicate = function (logEntry) {
        var wearTestNames = [],
            totalTimeInSeconds = 0,
            distanceInKms = 0;

        switch ($scope.currentSortColumn) {
            case "date":
                return logEntry.activityDate;

            case "productTest":
                for (var i = 0; i < logEntry.wearTests.length; i++) {
                    wearTestNames.push(logEntry.wearTests[i].name);
                }
                return wearTestNames;

            case "activity":
                return logEntry.activityType;

            case "intensity":
                return logEntry.intensity;

            case "time":
                //Calculate the total time in seconds
                totalTimeInSeconds = logEntry.durationHours * 3600;
                totalTimeInSeconds = totalTimeInSeconds + logEntry.durationMinutes * 60;
                totalTimeInSeconds += logEntry.durationSeconds;

                return totalTimeInSeconds;

            case "distance":
                //Conver the distance to kilometers before sorting
                if (logEntry.distanceUnits === "miles") {
                    distanceInKms = logEntry.distance * 1.6;
                } else {
                    distanceInKms = logEntry.distance;
                }

                return distanceInKms;

            case "terrain":
                return logEntry.terrain;

            case "condition":
                return logEntry.conditions;

            case "note":
                return logEntry.notes;

            default:
                //Default sorting is based on the date
                return logEntry.activityDate;
        }
    };

    //Current sort by column
    $scope.changeSortOrder = function (sortByColumn) {
        //If the sortByColumn is the current column that we are sorting
        //by, then toggle the ascending / descending sort feature
        if ($scope.currentSortColumn === sortByColumn) {
            $scope.reverse = !$scope.reverse;
        } else {
            $scope.currentSortColumn = sortByColumn;
            $scope.reverse = true;
        }
    };

    //Check if the column provided is the sort by column
    $scope.checkSortOrder = function (sortByColumn, sortNature) {
        if ($scope.currentSortColumn === sortByColumn) {
            //Check the ascending nature
            if ($scope.reverse === false && sortNature === "ascending") {
                return true;
            } else if ($scope.reverse === true && sortNature === "descending") {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    //Returns the minutes appending a zero for single digit minute
    $scope.getCorrectMinute = function (minute) {
        //Check if it is a single digit
        if (minute % 10 === minute) {
            //It is - append a zero to it
            return "0" + minute.toString();
        } else {
            //It is not - just return the value as it is
            return minute;
        }
    };

    //Load the activity logs when asked to
    $scope.$watch('loadActivityLogs', function () {

        //Check if we need to (re)load the activity log table
        if ($scope.loadActivityLogs === true) {
            //Update the activity logs table
            $http.get('/activityLogs/' + $scope.currentUser._id)
                .success(function (data) {
                    $scope.activityLogs = data.data;

                    getLatestLog();

                    //We are no longer updating activity log table
                    $scope.loadActivityLogs = false;
                });
        }
    });

    //Each time the user information gets updated, update the % of completion
    $scope.$watch('currentUser', function () {
        var total = 0;
        if ($scope.currentUser === undefined || $scope.currentUser === null) {
            return;
        }

        $scope.completed = profileDetailCompletion.getPercentageOfCompletion($scope.currentUser);
    }, true);
}]);

dashboardApp.controller('ActivityLogsMaintainCtrl', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
    'use strict';

    //The questions that will be asked when filling out the activity log
    $scope.questions = [];

    //Different activity types
    //Provide the possible choices for the professions
    $http.get('/js/static-data.json')
        .success(function (result) {
            $scope.activityTypes = result.activities;
        });

    //Possible Hours in a week
    $scope.possibleHours = [];

    for (var i = 0; i < 169; i++) {
        $scope.possibleHours.push(i);
    }

    //Possible minutes in an hour
    $scope.possibleMinutes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59];

    $scope.possibleSeconds = [];

    //Possible seconds in a minute
    for (var i = 0; i < 60; i++) {
        $scope.possibleSeconds.push(i);
    }

    //Behaviour of the modal
    $scope.activityLogModalOptions = {
        keyboard: false,
        backdropClick: false,
        backdropFade: true,
        dialogFade: true
    };

    //Is the wear test selected
    $scope.isWearTestSelected = function (weartestId) {
        var weartests = $scope.logData.wearTests;
        for (var i = 0; i < weartests.length; i++) {
            if (weartests[i]._id === weartestId) {
                return true;
            }
        }

        //No such wear test entry found
        return false;
    };

    //Select the wear test
    $scope.selectWearTest = function (weartestId) {
        for (var i = 0; i < $scope.wearTests.length; i++) {
            if ($scope.wearTests[i]._id === weartestId) {
                $scope.logData.wearTests.push($scope.wearTests[i]);
                break;
            }
        }
    };

    //Remove the wear test from the selection
    $scope.unSelectWearTest = function (weartestId) {
        var weartests = $scope.logData.wearTests;

        for (var i = 0; i < weartests.length; i++) {
            if (weartests[i]._id === weartestId) {
                $scope.logData.wearTests.splice(i, 1);
                break;
            }
        }
    };

    //Checks if the condition (for a new activity log) is selected or not
    $scope.isConditionTypeSelected = function (conditionType) {
        return $scope.logData.conditions === conditionType;
    };

    //Selects the conditon
    $scope.selectCondition = function (conditionType) {
        if ($scope.logData.conditions !== conditionType) {
            $scope.logData.conditions = conditionType;
        }
    };

    //Checks if the terrain (for a new activity log) is selected or not
    $scope.isTerrainSelected = function (terrainType) {
        return $scope.logData.terrain === terrainType;
    };

    //Selects the terrain
    $scope.selectTerrain = function (terrainType) {
        if ($scope.logData.terrain !== terrainType) {
            $scope.logData.terrain = terrainType;
        }
    };

    //Checks if the temperature unit is selected (for a new activity log)
    $scope.isTemperatureUnit = function (unit) {
        return $scope.logData.temperatureUnits === unit;
    };

    //Sets the temperature unit
    $scope.setTemperatureUnit = function (unit) {
        //Set only if not already set
        if ($scope.logData.temperatureUnits !== unit) {
            $scope.logData.temperatureUnits = unit;
        }
    };

    //Checks the distance unit (for a new activity log)
    $scope.isDistanceUnit = function (unit) {
        return $scope.logData.distanceUnits === unit;
    };

    //Sets the distance unit
    $scope.setDistanceUnit = function (unit) {
        //Set if not already set
        if ($scope.logData.distanceUnits !== unit) {
            $scope.logData.distanceUnits = unit;
        }
    };

    //Update the existing log
    $scope.updateActivityLog = function () {
        //Put / update the data
        $http.put('/api/mesh01/activityLogs/' + $scope.logData._id, $scope.logData)
            .success(function (data) {

                //Close the modal
                $scope.cancelLogCreation();

                //Inform consumer to update its log records
                $scope.updateLogInfo = true;
            });
    };

    //Returns the wear test names present in the activity log
    $scope.getWeartestNames = function () {
        var names = "";

        for (var i = 0; i < $scope.logData.wearTests.length; i++) {
            if (i === 0) {
                names = names + $scope.logData.wearTests[i].name;
            } else {
                names = names + ", " + $scope.logData.wearTests[i].name;
            }
        }

        return names;
    };

    //Loads the next log modal
    $scope.loadNextLogItem = function () {
        //Load only if we are not in the last question
        if ($scope.isLastQuestion()) {
            //We are in the last question
            //Cannot proceed to the next log item
            return;
        }

        $scope.questionNumber = $scope.questionNumber + 1;
    };

    //Loads the previous log modal
    $scope.loadPreviousLogItem = function () {
        //Load only if we are not in the first question
        if ($scope.isFirstQuestion()) {
            //We are in the first question
            //There is nothing to load
            return;
        }

        $scope.questionNumber = $scope.questionNumber - 1;
    };

    //Submit the activity log
    $scope.createActivityLog = function () {
        //Update the created by for the activity log
        $scope.logData.userId = $scope.currentUser._id;

        //Post the data
        $http.post('/api/mesh01/activityLogs', $scope.logData)
            .success(function (data) {
                //Close the modal
                $scope.cancelLogCreation();

                //Inform consumer to update its log records
                $scope.updateLogInfo = true;
            });
    };

    //Cancel's the creation of the activity log
    $scope.cancelLogCreation = function () {
        //Hide the modal
        $scope.showActivityLogModal = false;
    };

    //Returns true if an existing log is being edited
    $scope.showEditLogControls = function () {
        return $scope.activityLogMode === "edit";
    };

    //Checks if we are in the last question of the activity log
    $scope.isLastQuestion = function () {
        //Check if the Wear Test Selection screen is to be hidden
        if ($scope.hideWearTestSelection) {
            //Yes it has to. The Question count is reduced in such a case
            return $scope.questionNumber === $scope.questions.length + 1;
        } else {
            return $scope.questionNumber === $scope.questions.length;
        }
    };

    //Checks if we are in the first question of the activity log
    $scope.isFirstQuestion = function () {
        //Check if the Wear Test Selection screen is to be hidden
        if ($scope.hideWearTestSelection) {
            //Yes, it has to be hidden
            //In such a case, the question count is shortened
            return $scope.questionNumber === 2;
        } else {
            return $scope.questionNumber === 1;
        }
    };

    //Returns the current question number
    $scope.getCurrentQuestionNumber = function () {
        //Check if the Wear Test Selection screen is to be hidden
        if ($scope.hideWearTestSelection) {
            //yes, it is hidden
            //The current question is one less than expected
            return $scope.questionNumber - 1;
        } else {
            return $scope.questionNumber;
        }
    };

    //Returns the question
    $scope.getQuestion = function () {
        //Check if the Wear Test Selection screen is hidden
        if ($scope.hideWearTestSelection) {
            //Yes it is
            //In such a case, adjust the question index
            return $scope.questions[$scope.questionNumber - 2];
        } else {
            return $scope.questions[$scope.questionNumber - 1];
        }
    };
}]);
