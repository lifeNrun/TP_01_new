dashboardApp.controller('SurveyModeCtrl', ['$scope', '$routeParams', '$timeout', '$location', '$http', 'notificationWindow', 'loginState',
function ($scope, $routeParams, $timeout, $location, $http, notificationWindow, loginState) {
    'use strict';

    var editMode = $routeParams['section'],
        mode = $routeParams['mode'],
        user = {},
        request = {};

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    $scope.showCreateSurveyModal = false;

    $scope.newSurvey = {};

    loginState.getLoginState(function (data) {
        user = data.userInfo;
    });

    $scope.isUserAdmin = function () {
        return user.utype === 'Admin';
    };

    $scope.isEditMode = function () {
        return editMode === 'edit';
    };

    $scope.isTabActive = function (tabName) {
        if ($scope.isEditMode()) {
            //Edit mode has its own tab
            return false;
        }

        return tabName === mode;
    };

    $scope.openCreateSurveyModal = function () {
        $scope.newSurvey = {};

        $scope.showCreateSurveyModal = true;
    };

    $scope.closeCreateSurveyModal = function () {
        $scope.showCreateSurveyModal = false;

        $scope.newSurvey = {};
    };

    $scope.createSurvey = function () {
        var path,
            newSurvey;

        if (request.creatingSurvey) {
            return;
        } else if ($scope.newSurvey.name.length === 0) {
            notificationWindow.show('Enter a name for the survey', false);

            return;
        }

        request.creatingSurvey = true;

        path = '/api/mesh01/surveys';

        newSurvey = JSON.parse(JSON.stringify($scope.newSurvey));

        $scope.closeCreateSurveyModal();

        notificationWindow.show('Creating survey "' + newSurvey.name + '"...', true);

        $http.post(path, newSurvey)
            .success(function (result) {
                if (result._id && result.name === newSurvey.name) {
                    notificationWindow.show('Survey successfully created. Redirecting to edit survey page...', false);

                    $timeout(function () {
                        if ($scope.isUserAdmin()) {
                            //By default, weartest type surveys are created
                            $location.path('/dashboard/surveys/weartest/' + result._id + '/edit');
                        } else {
                            $location.path('/dashboard/surveys/owned/' + result._id + '/edit');
                        }
                    }, 1000);
                } else {
                    notificationWindow.show('Error. Could not create survey.', false);
                }

                request.creatingSurvey = false;
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not create survey.', false);

                request.creatingSurvey = false;
            });
    };
}
]);
