dashboardApp.controller('WeartestActivityLogsCtrl', ['$scope', '$http', '$filter', '$routeParams', 'downloadAsCSV', 'notificationWindow',
function ($scope, $http, $filter, $routeParams, downloadAsCSV, notificationWindow) {
    'use strict';

    var path,
        query,
        orderBy,
        weartestId = $routeParams['itemId'],
        userDetails = [];

    $scope.WearTestMapping = {};

    $scope.activityLogByUsers = [];

    $scope.WearTestDropDownMapping = [
        {
            'name': 'All',
            '_id': -1
        }
    ];

    $scope.searchText = {};

    //Ascending or Descending sort (default descending)
    $scope.reverse = true;

    //Default sort by column is the date column for activity log table
    $scope.currentSortColumn = 'date';

    //Link to export the activity logs
    $scope.exportLink = '';

    $scope.preparingDataForExport = true;

    $scope.activityLogDisplayLimit = 20;

    //Get the details of the users who created the activity logs
    var getParticipatingUsersInformation = function () {
        var path,
            query,
            key,
            projection,
            userIds = [],
            i = 0;

        for (key in $scope.WearTestMapping) {
            if ($scope.WearTestMapping.hasOwnProperty(key)) {
                userIds.push(key);
            }
        }

        path = '/api/mesh01/users';

        query = {
            '_id': {
                '$in': userIds
            }
        };

        path += '?query=' + JSON.stringify(query);

        projection = {
            '_id': 1,
            'username': 1
        };

        path += '&projection=' + JSON.stringify(projection);

        notificationWindow.show('Gettting information on testers who created the activity logs', true);

        $http.get(path)
            .success(function (result) {
                if (angular.isArray(result)) {
                    var wtTempObject,
                        i;

                    userDetails = result;

                    $scope.WearTestDropDownMapping = [
                        {
                            "name": "All",
                            "_id": -1
                        }
                    ];

                    for (i = 0; i < result.length; i++) {
                        wtTempObject = {};

                        wtTempObject.name = result[i].username;
                        wtTempObject._id = result[i]._id;
                        wtTempObject.id = result[i].id;

                        $scope.WearTestDropDownMapping.push(wtTempObject);
                    }

                    $scope.choosenDropdownWT = $scope.WearTestDropDownMapping[0];

                    notificationWindow.show('Retrieved information on testers', false);
                } else {
                    notificationWindow.show('Error retrieving information on testers', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error retrieving information on testers', false);
            });
    };

    //Group the activity logs based on the user which created them.
    var createWTMapping = function (data) {
        var i;

        $scope.activityLogByUsers = data;

        //Reset the ordered data
        $scope.WearTestMapping = {};

        //Order the activity logs based on the user which created them
        for (i = 0; i < data.length; i++) {
            //Check if the user is already mapped
            if (angular.isUndefined($scope.WearTestMapping[data[i].userId])) {
                $scope.WearTestMapping[data[i].userId] = [];
            }

            //Associate the current Activity log with the user
            $scope.WearTestMapping[data[i].userId].push(angular.copy(data[i]));
        }

        //Get information on the participating users and map them to the models
        getParticipatingUsersInformation();
    };

    path = '/api/mesh01/activityLogs';

    query = {
        'wearTests._id': weartestId
    };

    path += '?query=' + JSON.stringify(query);

    orderBy = {
        'activityDate': 1
    };

    path += '&orderBy=' + JSON.stringify(orderBy);

    notificationWindow.show('Retrieving activity logs for product test. Depending on the amount of logs recorded, this may take some time.', true);

    //Get the Activity Logs for the current Wear Test
    $http.get(path)
        .success(function (result) {
            if (angular.isArray(result)) {
                if (result.length > 0) {
                    //Create mapping for dropDown and format date
                    createWTMapping(result);

                    notificationWindow.show('All activity logs have been retrieved. Preparing chart for display.', true);
                } else {
                    notificationWindow.show('No activity logs found', false);
                }
            } else {
                notificationWindow.show('Error retrieving activity logs', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error retrieving activity logs', false);
        });

    //Determines the column to sort by
    $scope.predicate = function (logEntry) {
        switch ($scope.currentSortColumn) {
            case "date":
                return logEntry.activityDate;

            case "activity":
                return logEntry.activityType;

            case "time":
                return $scope.getTimeInMinutes(logEntry);

            case "distance":
                return $scope.getDistanceInMiles(logEntry);

            case "intensity":
                return logEntry.intensity;

            case "temperature":
                return $scope.getTemperatureInFahrenheit(logEntry);

            case "terrain":
                return logEntry.terrain;

            case "condition":
                return logEntry.conditions;

            case "note":
                return logEntry.notes;

            case "userId":
                return logEntry.userId;

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
            $scope.reverse = false;
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

    //Returns the username for the provided user ID
    $scope.getUserName = function (userId) {
        var i;

        for (i = 0; i < userDetails.length; i++) {
            if (userDetails[i]._id === userId) {
                return userDetails[i].username;
            }
        }
    };

    //Returns the distance in miles
    $scope.getDistanceInMiles = function (logEntry) {
        var distanceInMiles;

        if (logEntry.distanceUnits === 'miles') {
            //Distance already in miles. Return as it it
            distanceInMiles = logEntry.distance;
        } else {
            //Convert distance to miles
            distanceInMiles = logEntry.distance * 1.6;
        }

        return distanceInMiles;
    };

    //Returns the time in minutes
    $scope.getTimeInMinutes = function (logEntry) {
        var timeInMinutes = 0;

        if (!angular.isUndefined(logEntry.durationHours)) {
            timeInMinutes = logEntry.durationHours * 60;
        }

        if (!angular.isUndefined(logEntry.durationMinutes)) {
            timeInMinutes = timeInMinutes + logEntry.durationMinutes;
        }

        return timeInMinutes;
    };

    //Returns the temperaturn in fahrenheit
    $scope.getTemperatureInFahrenheit = function (logEntry) {
        var temperatureInFahrenheit;

        if (logEntry.temperatureUnits === "F") {
            temperatureInFahrenheit = logEntry.temperature;
        } else {
            temperatureInFahrenheit = parseInt(logEntry.temperature * 9 / 5, 10) + 32;
        }

        return temperatureInFahrenheit;
    };

    //Prepare the data for export
    $scope.prepareDataForExport = function () {
        var columnHeaders,
            columnKeys,
            submissions = [],
            csvString,
            rowEntry;

        $scope.preparingDataForExport = true;

        columnHeaders = ["Date", "User", "Activity", "Miles", "Minutes", "Temperature (F)", "Terrain", "Intensity", "Conditions", "Notes"];

        columnKeys = ["activityDate", "user", "activityType", "miles", "minutes", "temperature", "terrain", "intensity", "conditions", "notes"];

        for (var i = 0; i < $scope.activityLogByUsers.length; i++) {
            if ($scope.searchText.userId !== "") {
                if ($scope.activityLogByUsers[i].userId !== $scope.searchText.userId) {
                    continue;
                }
            }

            rowEntry = {};

            rowEntry.activityDate = $filter('UTCDate')($scope.activityLogByUsers[i].activityDate, 'MM/dd/yy');
            rowEntry.user = $scope.getUserName($scope.activityLogByUsers[i].userId);
            rowEntry.activityType = $scope.activityLogByUsers[i].activityType;
            rowEntry.miles = $scope.getDistanceInMiles($scope.activityLogByUsers[i]);
            rowEntry.minutes = $scope.getTimeInMinutes($scope.activityLogByUsers[i]);
            rowEntry.temperature = $scope.getTemperatureInFahrenheit($scope.activityLogByUsers[i]);
            rowEntry.terrain = $scope.activityLogByUsers[i].terrain;
            rowEntry.intensity = $scope.activityLogByUsers[i].intensity;
            rowEntry.conditions = $scope.activityLogByUsers[i].conditions;
            rowEntry.notes = $scope.activityLogByUsers[i].notes;

            submissions.push(rowEntry);
        }

        csvString = downloadAsCSV(columnHeaders, columnKeys, submissions);

        $scope.exportLink = csvString;

        $scope.preparingDataForExport = false;
    };

    $scope.increaseLogLimit = function () {
        if ($scope.activityLogDisplayLimit > $scope.activityLogByUsers.length) {
            return;
        }

        $scope.activityLogDisplayLimit += 10;
    };
}
]);
