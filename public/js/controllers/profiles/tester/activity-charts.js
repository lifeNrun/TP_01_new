/***************************************************************
	This contains the controller for the Chart inside 
	"Activity Logs" dashboard item of a user of type Tester
***************************************************************/

dashboardApp.controller('ActivityLogChartCtrl', ['$scope', '$http', '$filter', 'loginState', function ($scope, $http, $filter, loginState) {
	'use strict';

	//Initialization
	$scope.metricsType = "cumulative";

	$scope.yAxisType = "time";

	$scope.leftYAxisName = "Time";

	$scope.rightYAxisName = "";

	$scope.timeType = "hours";

	$scope.distanceType = "miles";

	$scope.WearTestDropDownMapping =[
		{
			name: "All",
			"_id": -1
		}
	];

	$scope.choosenDropdownWT = $scope.WearTestDropDownMapping[0];

	$scope.WearTestMapping = {};

	//Get the user data
	loginState.getLoginState(function (data) {
		//Store the user data
		$scope.currentUser = data.userInfo;

		//Fetch the activity logs of the current user
		$scope.getChartData();
	});

	//Get the chart data
	$scope.getChartData = function () {
		//Fetch the activity logs of the current user
		$http.get('/activityLogs/' + $scope.currentUser._id)
			.success(function (data) {
				//Sort the data based on the activity date
				data = $filter('orderBy')(data.data, "activityDate");
				$scope.chartData = data;
				//convert values in one format
				$scope.createMilesKilo(data);
				//create mapping for dropDown and format date
				$scope.createWTMapping(data);
				//save the originalData to another variable because we will want to show it on "All" dropdown option
				$scope.originalChartData = angular.copy(data);
			});
	};

	//Keep an eye on the selection - the chart needs to be displayed
	//for all wear tests or for a specific wear test
	$scope.$watch('choosenDropdownWT', function (choosenDropdownWT) {
		if (choosenDropdownWT.name !== "All") {
			$scope.chartData = $scope.WearTestMapping[choosenDropdownWT['_id']];
		} else {
			$scope.chartData = angular.copy($scope.originalChartData);
		}
	});

	//Create wearTest mapping which is later used for accesing activityLogs 
	//for specific wearTest
	//We map it in this format {wearTestId:[activityLogs]}
	$scope.createWTMapping = function (data) {
		for (var i = 0; i < data.length; i++) {
			for (var wearTestCounter = 0; wearTestCounter < data[i].wearTests.length; wearTestCounter++) {
				if (!$scope.WearTestMapping[data[i].wearTests[wearTestCounter]['_id']]) {
					$scope.WearTestMapping[data[i].wearTests[wearTestCounter]['_id']] = [];
				}

				//add logTest activity to the wearTest ID in the mapping
				$scope.WearTestMapping[data[i].wearTests[wearTestCounter]['_id']].push(angular.copy(data[i]));

				//create temp wearTest object
				var wtTempObject = {};
				wtTempObject.name = data[i].wearTests[wearTestCounter].name;
				wtTempObject['_id'] = data[i].wearTests[wearTestCounter]['_id'];

				//if it doesn't exist yet push it the WTDropDownMapping
				if (!$scope.containsObject(wtTempObject,$scope.WearTestDropDownMapping)) {
					$scope.WearTestDropDownMapping.push(wtTempObject);
				}
			}
		}
	};

	//Simple method to check if wearTest already exists in the mapping
	$scope.containsObject = function (obj, list) {
		var i;
		for (i = 0; i < list.length; i++) {
			if (list[i]['_id'] === obj['_id']) {
				return true;
			}
		}

		return false;
	};

	//Simple method which creates parameters for miles and kilometers on the object
	$scope.createMilesKilo = function (data) {
		for (var i = 0; i < data.length; i++) {
			if (data[i].distanceUnits == "kilometers") {
				data[i].normalizedDistanceKPH = data[i].distance;
				data[i].normalizedDistanceMPH = data[i].distance * 0.621371;
			} else {
				data[i].normalizedDistanceKPH = data[i].distance * 1.60934;
				data[i].normalizedDistanceMPH = data[i].distance;
			}

			//parse date in proper date object
			data[i].activityDate = $scope.parseDate(data[i].activityDate);
		}
	};

	//Watch yAxisTypeTime and set it to appropriate value based on what is checked
	$scope.$watch('yAxisTypeTime', function (choosenYAxisType) {
		if ($scope.yAxisTypeDistance && choosenYAxisType) {
			$scope.yAxisType = "both";
		} else if ($scope.yAxisTypeDistance && !choosenYAxisType) {
			$scope.yAxisType = "distance";
		} else {
			$scope.yAxisType = "time";
			$scope.yAxisTypeTime = true;
		}
	});

	//Watch yAxisTypeDistance and set it to appropriate value based on what is checked
	$scope.$watch('yAxisTypeDistance', function (choosenYAxisType) {
		if ($scope.yAxisTypeTime && choosenYAxisType) {
			$scope.yAxisType = "both";
		} else if ($scope.yAxisTypeTime && !choosenYAxisType) {
			$scope.yAxisType = "time";
		} else {
			$scope.yAxisType = "distance";
			$scope.yAxisTypeDistance = true;
		}
	});

	// Parse the date int object with d3s parser
	$scope.parseDate = function (date) {
		return d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ").parse(date);
	};

	// Watch settings and update on change
	$scope.$watch('metricsType', function () {
		$scope.updateMetrics();
	});

	$scope.$watch('yAxisType', function () {
		$scope.updateMetrics();
	});

	$scope.$watch('distanceType', function () {
		$scope.updateMetrics();
	});

	$scope.$watch('timeType', function () {
		$scope.updateMetrics();
	});
}]);
