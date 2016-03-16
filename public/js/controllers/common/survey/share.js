dashboardApp.controller('SurveyShareCtrl', ['$scope', '$window', '$routeParams', '$http', '$location', '$timeout', '$filter', 'notificationWindow',
function ($scope, $window, $routeParams, $http, $location, $timeout, $filter, notificationWindow) {
    'use strict';

    var weartestId = $routeParams['itemId'],
        surveyId = $routeParams['surveyId'],
        projection = {
            '_id': 1,
            name: 1,
            wearTestEndDate: 1,
            brandLogoLink: 1
        },
        sendingEmail = false,
        path = '/api/mesh01/weartest/' + weartestId + '?projection=' + JSON.stringify(projection);

    $scope.weartest = {};
    $scope.survey = {};
    $scope.email = {
        weartestId: weartestId,
        surveyId: surveyId,
        host: $location.host()
    };
    $scope.includeLogo = false;

    $scope.successModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    $scope.showSuccessModal = false;

    $scope.updateBody = function () {
        //TinyMCE doesn't seem to update the body if (any) function is not called
        $scope.email.body = $scope.email.body;
    };

    $scope.closeSuccessModal = function () {
        $scope.showSuccessModal = false;
    };

    $scope.goBack = function () {
        $scope.showSuccessModal = false;

        $timeout(function () {
            $window.history.back();
        }, 500);
    };

    //Send the email
    $scope.sendEmail = function () {
        var path = '/api/mesh01/shareSurvey';

        if (!sendingEmail) {
            sendingEmail = true;
        } else {
            return;
        }

        //Make sure that there is placeholder to include answer survey link
        var stringForLink = new RegExp('&lt;%unique_survey_link%&gt;', 'g');

        var positionFound = $scope.email.body ? $scope.email.body.search(stringForLink) >= 0 : false;
        
        var brandLogoImage = $filter('getScaledImage')($scope.weartest.brandLogoLink, 129, 79, 'c_fit');

        if (!positionFound) {
            notificationWindow.show("Can't send email. Ensure that your email body has placeholder <%unique_survey_link%>");

            sendingEmail = false;

            return;
        }
        
        if ($scope.includeLogo) {
        	 $scope.bodyWithoutLogo = $scope.email.body;
           $scope.email.body = '<img src="'+brandLogoImage+'" alt="logo">'+$scope.email.body;
        }
        
        notificationWindow.show('Sending list of emails to share survey with...', true);

        $http.post(path, $scope.email)
            .success(function (result, status) {
                notificationWindow.show('Emails sent!', false);
                $scope.showSuccessModal = true;
                sendingEmail = false;
                $scope.email.body = $scope.bodyWithoutLogo;
            })
            .error(function (err) {
                console.log(err);
                notificationWindow.show('Survey could not shared at this time. Try again.', false);
                sendingEmail = false;
            });

    };

    notificationWindow.show('Getting product test info...', true);

    $http.get(path)
        .success(function (result) {
            var projection,
                path;
            if (result._id === weartestId) {
                $scope.weartest = result;

                projection = {
                    '_id': 1,
                    name: 1
                };

                path = '/api/mesh01/surveys/' + surveyId + '?projection=' + JSON.stringify(projection);

                notificationWindow.show('Getting survey information...', true);

                $http.get(path)
                    .success(function (result) {
                        if (result._id === surveyId) {
                            $scope.survey = result;
                            $scope.email.surveyName = $scope.survey.name;

                            notificationWindow.show('Survey information retrieved successfully', false);
                        } else {
                            notificationWindow.show('Error. Could not get survey information', false);
                        }
                    })
                    .error(function (err) {
                        console.log(err);
                        notificationWindow.show('Error. Could not get survey information', false);
                    });
            } else {
                notificationWindow.show('Error. Could not get product test information', false);
            }
        })
        .error(function (err) {
            console.log(err);
            notificationWindow.show('Error. Could not get product test information', false);
        });
}]);
