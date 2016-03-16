/**********************************************************
    This file contains the directives used to build
    or compile a survey

    Module: surveyApp
***********************************************************/

surveyApp.directive('compileSurvey', function ($http, Surveys) {
    return {
        restrict: 'E',
        scope: {
            surveyid: "=",
            weartestid: "=",
            userInfo: '=',
            errorFlag: '='
        },
        templateUrl: '/partials/restricted/common/survey/compile-survey.html',
        link: function (scope, iElement, iAttr) {
            //The predicate to sort the survey template table
            scope.predicate = ["name", "typeName", "type"];

            //The existing surveys
            scope.surveyTemplates = [];

            //Different survey types
            scope.surveyTypes = [
                {
                    _id: 1,
                    group: 'Profile',
                    name: 'User Profile'
                },
                {
                    _id: 2,
                    group: 'Activity',
                    name: 'Golf'
                },
                {
                    _id: 3,
                    group: 'Activity',
                    name: 'Basketball'
                },
                {
                    _id: 4,
                    group: 'Activity',
                    name: 'Running'
                },
                {
                    _id: 5,
                    group: 'Wear Test Survey',
                    name: 'Test Survey 1'
                },
                {
                    _id: 6,
                    group: 'Design Project Scoring',
                    name: 'Design Project Scoring 1'
                }
            ];

            //Errors at the time of submission of compiled survey
            scope.questionErrors = [];

            //Prevents user from submitting compiled survey more
            //than once
            scope.surveySubmitInProgress = false;

            //Keeps track of a survey being compiled
            scope.compileInProgress = false;

            scope.userId = scope.userInfo._id;

            scope.loading = false;

            scope.noQuestions = false;

            /*OBSOLETE*/
            //Load the surveys
            /*scope.loadSurveyTemplates = function () {
                scope.loading = true;

                $http.get('/tableControlApi/Surveys')
                    .success(function (response) {
                        scope.surveyTemplates = response.data;

                        for (var i = 0; i < scope.surveyTemplates.length; i++) {
                            for (var j = 0; j < scope.surveyTypes.length; j++) {

                                if (scope.surveyTemplates[i].type === "Profile" && scope.surveyTemplates[i].ref && scope.surveyTemplates[i].ref.userId === scope.surveyTypes[j]._id) {
                                    scope.surveyTemplates[i].typeName = scope.surveyTypes[j].name;
                                    break;
                                } else if (scope.surveyTemplates[i].type === "Activity" && scope.surveyTemplates[i].ref && scope.surveyTemplates[i].ref.activityId === scope.surveyTypes[j]._id) {
                                    scope.surveyTemplates[i].typeName = scope.surveyTypes[j].name;
                                    break;
                                } else if (scope.surveyTemplates[i].type === "Wear Test Survey" && scope.surveyTemplates[i].ref && scope.surveyTemplates[i].ref.wearTestId === scope.surveyTypes[j]._id) {
                                    scope.surveyTemplates[i].typeName = scope.surveyTypes[j].name;
                                    break;
                                } else if (scope.surveyTemplates[i].type === "Design Project Scoring" && scope.surveyTemplates[i].ref && scope.surveyTemplates[i].ref.designProjectId === scope.surveyTypes[j]._id) {
                                    scope.surveyTemplates[i].typeName = scope.surveyTypes[j].name;
                                    break;
                                }
                            }
                        }

                        scope.loading = false;
                    })
                    .error(function (error) {
                        console.log(reason);
                        scope.loading = false;
                    });
            };*/

            //scope.loadSurveyTemplates();

            //Get the survey details
            scope.getSurveyById = function (surveyId) {
                scope.loading = true;

                $http.get('/query/surveys?query={"_id":"' + surveyId + '"}')
                    .success(function (response) {
                        var surveyFetched = response[0];

                        if (surveyFetched) {
                            scope.compileInProgress = true;
                            scope.compileSurvey(response[0]);
                        } else {
                            scope.noQuestions = true;
                        }
                        scope.loading = false;
                    })
                    .error(function (error) {
                        console.log(reason);
                        scope.loading = false;
                    });
            };

            if (scope.surveyid) {
                scope.getSurveyById(scope.surveyid);
            }

            //Sets a survey for the "compile" phase
            scope.compileSurvey = function (surveyDetails) {
                var questionCounter = 0,
                    sectionCounter = 0;

                for (var i = 0; i < surveyDetails.questions.length; i++) {
                    surveyDetails.questions[i].answer = {};

                    if (surveyDetails.questions[i].type !== "Section") {
                        surveyDetails.questions[i].id = ++questionCounter;

                        if (surveyDetails.questions[i].type === 'Multiple Selection') {
                            surveyDetails.questions[i].answer.values = [];
                        } else if (surveyDetails.questions[i].type === 'Rating') {
                            surveyDetails.questions[i].answer.value = surveyDetails.questions[i].options.defaultValue;
                        } else if (surveyDetails.questions[i].type !== 'Range') {
                            surveyDetails.questions[i].answer.value = '';
                        }
                    }
                }

                scope.activeSurvey = surveyDetails;
            };

            //Submit the survey
            scope.submitSurvey = function () {
                var question,
                    questionError,
                    errorFound = false,
                    answer,
                    i;

                //If survey submission is in progress, do not proceed
                if (scope.surveySubmitInProgress) {
                    return;
                } else {
                    scope.surveySubmitInProgress = true;
                }

                scope.questionErrors = [];

                //Check answers of all questions
                for (i = 0; i < scope.activeSurvey.questions.length; i++) {
                    question = scope.activeSurvey.questions[i];
                    questionError = [];

                    if (question.type === "Multiple Selection") {
                        if (question.options.isRequired && (!question.answer.valueArray || question.answer.valueArray.length === 0)) {
                            questionError.push('Value required.');
                        }
                    } else if (question.type !== 'Title / Header') {
                        if((question.answer.value === undefined || question.answer.value === null || question.answer.value.toString().trim().length === 0)) {
                            if(question.options.isRequired) {
                                questionError.push('Value required.');
                            }
                        } else if((question.options.isNumeric || question.type === 'Numeric') && question.answer.value.toString().match(/^\d+(\.\d+)?$/) === null) {
                            questionError.push('Value must be numeric ');
                        }
                    }

                    errorFound |= questionError.length > 0;
                    scope.questionErrors[i] = questionError;
                }

                if (errorFound) {
                    scope.errorFlag = true;
                    scope.surveySubmitInProgress = false;
                    return;
                }

                scope.errorFlag = false;

                var survey = {
                    surveyId: scope.activeSurvey._id,
                    weartestId: scope.weartestid,
                    userId: scope.userId,
                    surveyName : scope.activeSurvey.name,
                    surveyType : scope.activeSurvey.type,
                    answers: []
                };

                for (i = 0; i < scope.activeSurvey.questions.length; i++) {
                    if (scope.activeSurvey.questions[i].type === 'Title / Header') {
                        //Don't record answer for this question type
                        continue;
                    }

                    answer = JSON.parse(JSON.stringify(scope.activeSurvey.questions[i].answer));
                    answer.userId = scope.userId;
                    answer.surveyId = scope.activeSurvey._id;
                    answer.questionName = scope.activeSurvey.questions[i].question;
                    answer.questionId = scope.activeSurvey.questions[i]._id;
                    answer.type = scope.activeSurvey.questions[i].type;
                    answer.options = scope.activeSurvey.questions[i].options;
                    survey.answers.push(answer);
                }

                //Save template from server (promise)
                $http.post('/api/mesh01/surveys_submitted', survey)
                    .success(function (result) {
                        //if (angular.isUndefined(JSON.parse(response.data)._id)) {
                        if (angular.isUndefined(result._id)) {
                            scope.surveySubmitInProgress = false;
                        } else {
                            scope.surveySubmitInProgress = false;
                            scope.surveyHasBeenSubmitted = true;
                            scope.activeSurvey=[];
                            scope.$emit("surveySubmited");

                        }
                    })
                    .error(function (reason) {
                        scope.surveySubmitInProgress = false;
                    });
            };

            scope.addMultipleAnswer = function ($event, answerArray, value) {
                if (!answerArray.valueArray) {
                    answerArray.valueArray = [];
                }

                var checkbox = $event.target,
                    index = answerArray.valueArray.indexOf(value);

                //Should we add the selection or remove the selection?
                if (checkbox.checked === true) {
                    //Add the option, if not already added
                    if (index === -1) {
                        answerArray.valueArray.push(value);
                    }
                } else {
                    //Remove the value, if exists
                    if (index !== -1) {
                        answerArray.valueArray.splice(index, 1);
                    }
                }
            };

            //Decides when to show the survey compilation
            scope.showSurveyCompilation = function () {
                if (scope.loading) {
                    return false;
                } else if (scope.compileInProgress) {
                    return true;
                } else {
                    return false;
                }
            };

            /*OBSOLETE*/
            //Close the info message modal
            /*scope.closeInfoModal = function () {
                scope.showInfoErrorModal = false;
            };*/

            //Opens the info message modal
            /*scope.displayInfoModal = function () {
                scope.showInfoErrorModal = true;
            };*/

            //Decides if view containing all views should be shown
            /*scope.showSurveyList = function () {
                //Firstly, only admin users should be able to see the list
                if (scope.userInfo) {
                    if (scope.userInfo.utype !== 'Admin') {
                        return false;
                    }
                } else {
                    //No info on the user type available.
                    //Be safe - do not show the list
                    return false;
                }

                //Waiting to load something?
                if (scope.loading) {
                    return false;
                } else if (scope.compileInProgress) {
                    return false;
                }

                //All checks passed. Safe to show the list
                return true;
            };*/

            //Display error messages
            /*var handleError = function (message) {
                scope.infoMessage = message;
                scope.displayInfoModal();
            };*/

            //Display non-error messages
            /*var handleSuccess = function (message) {
                scope.infoMessage = message;
                scope.displayInfoModal();
            };*/

            scope.$on("submitSurvey", function() {
               scope.submitSurvey();
            });

            /*OBSOLETE*/
            //scope.testvalue = 350;

            // to clear active survey
            scope.$on("clearActiveSurvey", function() {
               scope.activeSurvey=[];
            });

            scope.getQuestionNumber = function (originalIndex) {
                return Surveys.getQuestionNumber(originalIndex + 1, scope.activeSurvey.questions);
            };
        }
    };
});
