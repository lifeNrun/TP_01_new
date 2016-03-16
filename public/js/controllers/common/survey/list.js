dashboardApp.controller('SurveyListCtrl', ['$scope', '$routeParams', '$http', '$timeout', '$location', 'notificationWindow', 'loginState', 'Surveys',
function ($scope, $routeParams, $http, $timeout, $location, notificationWindow, loginState, Surveys) {
    'use strict';

    var mode = $routeParams['mode'],
        surveys,
        request = {},
        surveyGroups = {},            
        user;

    $scope.surveyFilter = {
        name: ''
    };

    $scope.surveyColumnOne = {};

    $scope.surveyColumnTwo = {};

    $scope.survey = {};

    $scope.surveyColumnThree = {};

    $scope.showSurveyDetailsModal = false;

    $scope.customSurveyModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
        dialogClass: 'modal surveyBuilder wider'
    };

    //Determine which group is displayed in which of the three columns
    var arrangeGroupsInColumns = function () {
        var columnNumber = 0,
            key;

        for (key in surveyGroups) {
            if (surveyGroups.hasOwnProperty(key)) {
                switch (columnNumber % 3) {
                    case 0:
                        $scope.surveyColumnOne[key] = surveyGroups[key];
                        break;

                    case 1:
                        $scope.surveyColumnTwo[key] = surveyGroups[key];
                        break;

                    case 2:
                        $scope.surveyColumnThree[key] = surveyGroups[key];
                        break;
                }

                columnNumber += 1;
            }
        }
    };

    //Group the surveys based on the activity and category
    var groupSurveys = function () {
        var groupName,
            i;

        for (i = 0; i < surveys.length; i++) {
            //Determine the group name for this survey
            //Activity surveys can be named only using activities - they don't have a category
            if (mode === 'activity') {
                if (surveys[i].activity && surveys[i].activity.length > 0) {
                    groupName = surveys[i].activity;
                } else {
                    groupName = 'Uncategorized';
                }
            } else {
                if (surveys[i].category && surveys[i].activity && surveys[i].category.length > 0 && surveys[i].activity.length > 0) {
                    groupName = surveys[i].category + ' - ' + surveys[i].activity;
                } else if (surveys[i].category && surveys[i].category.length > 0) {
                    groupName = surveys[i].category;
                } else if (surveys[i].activity && surveys[i].activity.length > 0) {
                    groupName = surveys[i].activity;
                } else {
                    groupName = 'Uncategorized';
                }
            }

            //Create a group with the group name, if one does not already exist
            if (!surveyGroups[groupName]) {
                surveyGroups[groupName] = [];
            }

            //Add the current survey to the group
            surveyGroups[groupName].push(surveys[i]);
        }
    };

    //Fetch the surveys based on mode
    var getSurveys = function () {
        var path,
            query,
            orderBy,
            limit,
            projection;

        path = '/api/mesh01/surveys';

        switch (mode) {
            case 'recent':
                query = {
                    'type': 'Wear Test Survey'
                };

                query['allowed'] = user.company

                orderBy = {
                    'modifiedDate': -1
                };

                limit = 10;

                break;

            case 'owned':
                query = {
                    'type': 'Wear Test Survey'
                };

                if (user.utype === 'Brand') {
                    query['allowed'] = user.company
                }

                break;

            case 'public':
                query = {
                    'type': 'Wear Test Survey',
                    'isPublic': true
                };

                break;

            case 'activity':
                query = {
                    'type': 'Activity'
                };

                break;

            case 'weartest':
                query = {
                    'type': 'Wear Test Survey'
                };

                break;
        }

        query['deleted'] = {
            $in: [false, null]
        };
        
        path += '?query=' + JSON.stringify(query);

        projection = {
            '_id': 1,
            'name': 1,
            'category': 1,
            'activity': 1,
            'createdDate': 1
        };

        path += '&projection=' + JSON.stringify(projection);

        if (orderBy) {
            path += '&orderBy=' + JSON.stringify(orderBy);
        }

        if (limit) {
            path += '&limit=' + JSON.stringify(limit);
        }

        notificationWindow.show('Retrieving surveys...', true);

        $http.get(path)
            .success(function (results) {
                if (angular.isArray(results)) {
                    surveys = results;

                    if (surveys.length > 0) {
                        notificationWindow.show('Surveys retrieved successfully', false);

                        groupSurveys();

                        arrangeGroupsInColumns();
                    } else {
                        notificationWindow.show('No surveys found', false);
                    }
                } else {
                    notificationWindow.show('Error. Could not retrieve the surveys.', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve the surveys.', false);
            });
    };

    notificationWindow.show('Retrieving your details...', true);

    loginState.getLoginState(function (data) {
        user = data.userInfo;

        getSurveys();
    });

    //Checks the currently active tab (mode)
    $scope.isTabActive = function (tabName) {
        return mode === tabName;
    };

    $scope.openSurveyDetailsModal = function (survey) {
        var path = '/api/mesh01/surveys/' + survey._id;

        notificationWindow.show('Retrieving details of the survey...', true);

        $http.get(path)
            .success(function (result) {
                if (result._id === survey._id) {
                    $scope.survey = result;

                    notificationWindow.show('Successfully retrieved details of survey', false);

                    $scope.showSurveyDetailsModal = true;
                } else {
                    notificationWindow.show('Error. Could not retrieve details of survey.', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve details of survey.', false);
            });
    };

    $scope.closeSurveyDetailsModal = function () {
        $scope.showSurveyDetailsModal = false;

        $scope.survey = {};
    };

    //Copies the survey
    $scope.copySurveyToMyArchive = function (callback) {
        var copiedSurvey = JSON.parse(JSON.stringify($scope.survey)),
            path,
            i;

        if (request.copyingSurveyToArchive) {
            return;
        }

        request.copyingSurveyToArchive = true;

        //Close the survey details modal before proceeding
        $scope.closeSurveyDetailsModal();

        //Remove invalid attributes of the copied survey
        delete copiedSurvey._id;
        delete copiedSurvey.id;
        delete copiedSurvey.createUserId;
        delete copiedSurvey.createUsername;
        delete copiedSurvey.modifiedUserId;
        delete copiedSurvey.modifiedUsername;

        //Delete attributes from the questions
        for (i = 0; i < copiedSurvey.questions.length; i++) {
            delete copiedSurvey.questions[i]._id;
        }

        path = '/api/mesh01/surveys';

        notificationWindow.show('Copying "' + copiedSurvey.name + '" to your archive...', true);

        $http.post(path, copiedSurvey)
            .success(function (result) {
                if (result._id && result.name === copiedSurvey.name) {
                    notificationWindow.show('Successfully copied survey to your archive. Redirecting...', false);

                    if (callback) {
                        callback(result);
                    } else {
                        $timeout(function () {
                            $location.path('/dashboard/surveys/owned')
                        }, 1000);
                    }
                } else {
                    notificationWindow.show('Error. Could not copy survey to your archive', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not copy survey to your archive', false);

                request.copyingSurveyToArchive = true;
            });
    };

    $scope.editSurvey = function (survey) {
        var surveyId = survey._id,
            type = (survey.type === 'Wear Test Survey') ? 'weartest' : 'activity';

        //Close the survey details modal before editing
        $scope.closeSurveyDetailsModal();

        //Wait for the modal to close
        $timeout(function () {
            if ($scope.isUserAdmin()) {
                $location.path('/dashboard/surveys/' + type + '/' + surveyId + '/edit');
            } else {
                $location.path('/dashboard/surveys/owned/' + surveyId + '/edit');
            }
        }, 500);
    };

    $scope.copySurveyToMyArchiveAndEditSurvey = function () {
        $scope.copySurveyToMyArchive($scope.editSurvey);
    };

    $scope.isUserAdmin = function () {
        return user.utype === 'Admin';
    };

    $scope.getQuestionNumber = function (originalIndex) {
        return Surveys.getQuestionNumber(originalIndex + 1, $scope.survey.questions);
    };
}
]);
