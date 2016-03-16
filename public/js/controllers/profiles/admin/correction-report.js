dashboardApp.controller('AdminCorrectionReportCtrl', ['$scope', '$http', function ($scope, $http) {
    'use strict';

    $scope.issues = [448, 568];

    var surveys = [],
        submittedSurveys = [],
        submittedSurveyIds = [];

    $scope.rogueSurveys = [];

    $scope.rogueAnswers = [];

    $scope.affectedUsers = [];

    $scope.show448Details = false;

    $scope.loading = false;

    $scope.getWeartestId = false;

    $scope.weartestForDuplicateParticipants = "";

    //Find the surveys which have questions with duplicate IDs
    //Also determine the surveys from the above rogue surveys which have answers submitted for them
    var findRogueSurveys = function () {
        var questionPool = [],
            rogueSurvey = [],
            dangerousSurveys = [],
            queryBuilder = '',
            i, j;
        
        //First identify the surveys that have duplicate questions
        for (i = 0; i < surveys.length; i++) {
            questionPool = [];
            for (j = 0; j < surveys[i].questions.length; j++) {
                if (questionPool.indexOf(surveys[i].questions[j]._id) !== -1) {
                    rogueSurvey.push(surveys[i]._id);
                    break;
                } else {
                    questionPool.push(surveys[i].questions[j]._id);
                }
            }
        }

        queryBuilder = '[';
        for (i = 0; i < rogueSurvey.length; i++) {
            for (j = 0; j < submittedSurveys.length; j++) {
                if (submittedSurveys[j].surveyId === rogueSurvey[i] && angular.isDefined(submittedSurveys[j].userId)) {
                    dangerousSurveys.push(submittedSurveys[j].surveyId);

                    if (queryBuilder !== '[') {
                        queryBuilder = queryBuilder + ',';
                    }

                    queryBuilder = queryBuilder + '"' + submittedSurveys[j].userId + '"';
                    break;
                }
            }
        }
        queryBuilder = queryBuilder + ']';
        
        $http.get('/query/users?query={"_id":{"$in":' + queryBuilder +'}}')
            .success(function (us) {
                $scope.affectedUsers = us;
                $scope.loading = false;
                $scope.show448Details = true;
            });

        $scope.rogueSurveys = rogueSurvey.slice(0);

        $scope.rogueAnswers = dangerousSurveys.slice(0);
    };

    var getAllSubmittedSurveys = function (startFactor) {
        var queryBuilder = '[',
            newStartFactor = startFactor + 50;

        for (var i = startFactor; i < surveys.length; i++) {
            if (i >= newStartFactor) {
                break;
            }

            if (queryBuilder !== '[') {
                queryBuilder = queryBuilder + ',';
            }

            queryBuilder = queryBuilder + '"' + surveys[i]._id + '"';
        }
        
        if (queryBuilder !== '[') {
            queryBuilder = queryBuilder + ']';

            $http.get('/query/surveys_submitted?query={"surveyId":{"$in":' + queryBuilder + '}}')
                .success(function (ss) {
                    submittedSurveys = submittedSurveys.concat(ss);
                    getAllSubmittedSurveys(newStartFactor);
                });
        } else {
            findRogueSurveys();
        }
    };

    //Get all the surveys and the answers submitted for the surveys of type 'Activity'
    $scope.prepareFor448 = function () {

        $scope.loading = true;

        $http.get('/query/surveys?query={"type":{"$in":["Activity","Wear Test Survey"]}}')
            .success(function (s) {
                var queryBuilder = '';

                surveys = s;

                getAllSubmittedSurveys(0);
            });
    };

    //Correct the rogue surveys - issue #448
    $scope.correctRogueSurveyAndAnswer = function () {

    };

    $scope.getNameForSurvey = function (surveyId) {
        for (var i = 0; i < surveys.length; i++) {
            if (surveys[i]._id === surveyId) {
                return surveys[i].name;
            }
        }
    };

    $scope.getSurveysSubmittedByUser = function (userId) {
        var surveysSubmitted = "";

        for (var i = 0; i < submittedSurveys.length; i++) {
            if (submittedSurveys[i].userId === userId && $scope.rogueAnswers.indexOf(submittedSurveys[i].surveyId) !== -1) {
                if (surveysSubmitted !== "") {
                    surveysSubmitted = surveysSubmitted + ", ";
                }

                surveysSubmitted = surveysSubmitted + $scope.getNameForSurvey(submittedSurveys[i].surveyId);
            }
        }

        return surveysSubmitted;
    };

    //Load the necessary data for the selected ticket
    $scope.loadReportForTicket = function () {
        $scope.show448Details = false;

        switch ($scope.issueToBeCorrected) {
            case 448:
                $scope.prepareFor448();
                break;
            case 568:
                $scope.getWeartestId = true;
                break;
        }
    };

    $scope.prepareFor568 = function () {
        if (!$scope.weartestForDuplicateParticipants) {
            return;
        }

        $scope.loading = true;

        $http.get('/query/weartest?query={"_id":"' + $scope.weartestForDuplicateParticipants + '"}')
            .success(function (result) {
                var record = result[0];

                var uniqueParticipants = [],
                    duplicateParticipants = [],
                    exists;

                for (var i = 0; i < record.participants.length; i++) {
                    //The participant does not exist before
                    exists = false;
                    for (var j = 0; j < uniqueParticipants.length; j++) {
                        if (uniqueParticipants[j].userIdkey === record.participants[i].userIdkey) {
                            exists = true;
                            break;
                        }
                    }

                    if (exists) {
                        duplicateParticipants.push(JSON.parse(JSON.stringify(record.participants[i])));
                    } else {
                        uniqueParticipants.push(JSON.parse(JSON.stringify(record.participants[i])));
                    }
                }

                if (duplicateParticipants.length === 0) {
                    alert('No duplicate participants in this Weartest');

                    $scope.loading = false;
                    $scope.show448Details = false;

                    return;
                }

                record.participants = uniqueParticipants.slice(0);

                $http.put('/tableControlApi/weartest/' + $scope.weartestForDuplicateParticipants, record)
                    .success(function(data) {
                        $scope.loading = false;
                        $scope.show448Details = false;
                        
                        alert('Duplicate participants deleted successfully');
                    });
            });
    };
}]);
