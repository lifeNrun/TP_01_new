app.controller('SettingsCtrl', ['$scope', '$routeParams', '$http', 'notificationWindow',
    function ($scope, $routeParams, $http, notificationWindow) {
        var setting = $routeParams.mode;
        var path = '/api/mesh01/configuration';
        
        $scope.saveInProgress = false;

        var getSetting = function () {
            var settingKey = $scope.setting.toUpperCase();

            var query = {
                key: settingKey
            };

            var newPath = path + '?query=' + JSON.stringify(query);

            notificationWindow.show('Getting values for the selected setting...', true);

            $http.get(newPath)
                .success(function (result) {
                    if (result.key !== settingKey) {
                        notificationWindow.show('Error. Cannot retrieve the specified configuration', false);
                    } else {
                        $scope.config = result;
                        notificationWindow.show('Successfully retrieved the setting value', false);
                    }
                })
                .error(function (err) {
                    notificationWindow.show('Error. Cannot retrieve the specified configuration', false);
                    $scope.config = undefined;
                });
        };

        if (!setting) {
            $scope.listSettings = true;
        } else {
            $scope.listSettings = false;
            $scope.setting = setting;
            getSetting();
        }

        $scope.saveSetting = function () {
            if ($scope.saveInProgress) {
                return;
            }

            $scope.saveInProgress = true;

            notificationWindow.show('Saving changes...', true);

            $http.put(path, $scope.config)
                .success(function (result) {
                    notificationWindow.show('Changes saved successfully', false);
                    $scope.saveInProgress = false;
                })
                .error(function (err) {
                    notificationWindow.show('An error occurred. Changes were not saved', false);
                    $scope.saveInProgress = false;
                });
        };
    }
]);
