dashboardApp.controller('ActivityLogChartBrandCtrl', ['$scope', function ($scope) {
    'use strict';

    //Defaults
    $scope.metricsType = "cumulative";
    $scope.yAxisType = "time";
    $scope.leftYAxisName = "Time";
    $scope.rightYAxisName = "";
    $scope.timeType = "hours";
    $scope.distanceType = "miles";
    $scope.WearTestDropDownMapping = $scope.$parent.WearTestDropDownMapping;
    $scope.WearTestMapping = $scope.$parent.WearTestMapping;

    $scope.$watch('$parent.choosenDropdownWT', function (choosenDropdownWT) {
        $scope.choosenDropdownWT = choosenDropdownWT;
        $scope.WearTestDropDownMapping = $scope.$parent.WearTestDropDownMapping;
        $scope.WearTestMapping = $scope.$parent.WearTestMapping;
    });

    //Watch dropDown change and show data for chosen wearTest in a dropdown
    $scope.$watch('choosenDropdownWT', function (choosenDropdownWT) {
        if (!choosenDropdownWT) {
            return;
        }

        $scope.$parent.choosenDropdownWT = $scope.choosenDropdownWT;

        $scope.tempActivityCharData = [];
        if (choosenDropdownWT.name!="All") {
            for (var i = 0; i < $scope.$parent.activityLogByUsers.length; i++) {
                if ($scope.$parent.activityLogByUsers[i].userId==choosenDropdownWT['_id']) {
                    $scope.tempActivityCharData.push($scope.$parent.activityLogByUsers[i]);
                }
            }

            $scope.$parent.searchText.userId = choosenDropdownWT['_id'];
            $scope.chartData = angular.copy($scope.tempActivityCharData);
        } else {
            for (var i = 0; i < $scope.$parent.activityLogByUsers.length; i++) {
                $scope.tempActivityCharData.push($scope.$parent.activityLogByUsers[i]);
            }

            $scope.$parent.searchText.userId = "";
            $scope.chartData = angular.copy($scope.tempActivityCharData);
        }
    });

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

    //Watch settings and update on change
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
