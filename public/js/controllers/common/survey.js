/*Controller for directive to view submitted Surveys*/
surveyApp.controller('ViewSurveyCtrl', ['$scope', '$http', function ($scope, $http) {
	'use strict';

    $scope.firstRun = true;

    $scope.canEdit = false;

    //Returns the answers of the submiited survey
	//However, it returns only half of it. Which half is determined by the paramters passed
	$scope.getSurveyAnswers = function (halfNeeded) {
		var answers;

		if ($scope.surveyDetails === null) {
			//We do not have the survey details with us. No answers exist
			answers = [];
		} else if (angular.isUndefined(halfNeeded)) {
			//Half not passed. Pass all the answers
			answers = $scope.surveyDetails.answers.slice(0);
		} else if (halfNeeded === 1) {
			//First half requested
			answers = $scope.surveyDetails.answers.slice(0, Math.ceil($scope.surveyDetails.answers.length / 2));
		} else {
			//Second half requested
			answers = $scope.surveyDetails.answers.slice(Math.ceil($scope.surveyDetails.answers.length / 2));
		}

		return answers;
	};

    $scope.$watch('surveyDetails', function (newVal, oldVal) {
        if (newVal._id === oldVal._id && !$scope.firstRun) return;
        $scope.canEdit = false;
        $scope.firstRun = false;

        $http.get('/query/surveys?query={"_id":"' + $scope.surveyDetails.surveyId + '"}')
            .then(function (data) {
                data = data.data[0];

                if (!data) {
                    $scope.canEdit = true;
                    return;
                }

                if (new Date($scope.surveyDetails.modifiedDate) < new Date(data.modifiedDate) ||
                    !$scope.surveyDetails.modifiedDate && new Date($scope.surveyDetails.createdDate) < new Date(data.modifiedDate)) {
                    for (var i = 0; i < data.questions.length; i++) {
                        var newQ = data.questions[i];
                        for (var j = 0; j < $scope.surveyDetails.answers.length; j++) {
                            var oldQ = $scope.surveyDetails.answers[j];
                            if (newQ._id === oldQ.questionId) {
                                oldQ.questionName = newQ.question;
                                oldQ.type = newQ.type;
                                oldQ.options = newQ.options;
                                break;
                            }
                        }

                        if (j === $scope.surveyDetails.answers.length) {
                            //Question is new

                            var newA = {};

                            newA.surveyId = $scope.surveyDetails.surveyId;
                            newA.questionId = newQ._id;
                            newA.questionName = newQ.question;
                            newA.type = newQ.type;
                            newA.options = newQ.options;
                            newA.comment = '';
                            if (newQ.type === "Multiple Selection") {
                                newA.valueArray = [];
                            } else {
                                newA.value = '';
                            }

                            $scope.surveyDetails.answers.splice(i, 0, newA);
                        }
                    }

                    for (var i = 0; i < $scope.surveyDetails.answers.length; i++) {
                        var oldQ = $scope.surveyDetails.answers[i];
                        for (var j = 0; j < data.questions.length; j++) {
                            var newQ = data.questions[j];
                            if (newQ._id === oldQ.questionId) break;
                        }

                        if (j === data.questions.length) {
                            //Question doesn't exist anymore

                            $scope.surveyDetails.answers.splice(i, 1);
                        }
                    }
                    $http.put('/tableControlApi/surveys_submitted/' + $scope.surveyDetails._id, $scope.surveyDetails)
                        .then(function () {
                            $scope.surveyDetails = $scope.surveyDetails;
                            $scope.canEdit = true;
                        });
                } else {
                    $scope.canEdit = true;
                }

            });
    }, true);
}]);

surveyApp.controller('EditSurveyCtrl', ['$scope', '$http', function ($scope, $http) {
	'use strict';

    //Returns the integer form of the value
    $scope.getInteger = function (stringValue) {
        return parseInt(stringValue, 10);
    };

    //Divide the number of questions in the survey into groups of 2
    //and find the total number of such groups
    $scope.getDivision = function () {
        var result = [],
            count = 1;

        for (var i = 0; i < $scope.surveyDetails.answers.length; i++) {
            if (i % 2 === 0) {
                result.push(count);
                count = count + 1;
            }
        }

        return result;
    };

    //Returns the questions in a division
    $scope.getQuestionsPerDivision = function (divisionNumber) {
        var result = [],
            count = 0;

        for (var i = 0; i < $scope.surveyDetails.answers.length; i++) {
            //Divide each question into sets of two
            if (i % 2 === 0) {
                count = count + 1;
            }

            if (count === divisionNumber) {
                //Current count is same as division number provided
                //Current question belongs to the same division
                result.push($scope.surveyDetails.answers[i]);
            } else if (count > divisionNumber) {
                //No point in continuing - all questions of the requested division have been found
                break;
            }
        }

        return result;
    };

    //Update the Survey
    $scope.executeUpdateOfSurvey = function () {

        var _surveyDetails = JSON.parse(JSON.stringify($scope.surveyDetails));

        //Reset any error messages
        $scope.questionNumberWithError = -1;

        $scope.errorMessage = '';

        //First - validate the answers provided.
        for (var i = 0; i < _surveyDetails.answers.length; i++) {
            //Check if answering the question is mandatory
            if (_surveyDetails.answers[i].options.isRequired === true) {
                //Yes, it is. Has the user entered it?
                if (_surveyDetails.answers[i].type !== 'Multiple Selection' && _surveyDetails.answers[i].value.length === 0) {
                    //No value provided. Inform the user
                    $scope.errorMessage = "This field is required";
                    $scope.questionNumberWithError = i;

                    //Don't proceed
                    return;
                } else if (_surveyDetails.answers[i].type === 'Multiple Selection' && (!_surveyDetails.answers[i].valueArray || _surveyDetails.answers[i].valueArray.length === 0)) {
                    //No value provided. Inform the user
                    $scope.errorMessage = "This field is required";
                    $scope.questionNumberWithError = i;

                    //Don't proceed
                    return;
                }
            } else if (_surveyDetails.answers[i].isNumeric === true || _surveyDetails.answers[i].type === 'Numeric') {
                //The answer to the question should be a numeric value - is it?
                if (_surveyDetails.answers[i].value.toString().match(/^-?[0-9]+$/) === null) {
                    //No value provided. Inform the user
                    $scope.errorMessage = "Only numeric values are allowed";
                    $scope.questionNumberWithError = i;

                    //Don't proceed
                    return;
                }
            }
        }

        _surveyDetails.id = _surveyDetails._id;
        delete _surveyDetails._id;

        $http.put('/tableControlApi/surveys_submitted/' + _surveyDetails.id, _surveyDetails)
            .success(function (result) {
                if (!angular.isUndefined(result.data._id)) {

                    if (!angular.isUndefined($scope.updateSurveyInfo)) {
                        //Inform the parent to update the list of surveys yet to be submitted
                        $scope.updateSurveyInfo();

                        //Switch to display mode
                        if (!angular.isUndefined($scope.changeDisplayMode)) {
                            $scope.changeDisplayMode({newMode: 'viewSurvey'});
                        }
                    }
                }
            });
    };

    //Add multiple values to the answer
    $scope.addMultipleAnswer = function ($event, answer, value) {
        if (!answer.valueArray) {
            answer.valueArray = [];
        }

        var checkbox = $event.target,
            index = answer.valueArray.indexOf(value);

        //Should we add the selection or remove the selection?
        if (checkbox.checked === true) {
            //Add the option, if not already added
            if (index === -1) {
                answer.valueArray.push(value);
            }
        } else {
            //Remove the value, if exists
            if (index !== -1) {
                answer.valueArray.splice(index, 1);
            }
        }
    };

    //Is the option selected
    $scope.isOptionChecked = function (answer, value) {
        if (answer.type !== "Multiple Selection") {
            return;
        }

        if (answer.valueArray.indexOf(value) === -1) {
            return false;
        } else {
            return true;
        }
    };
}]);

surveyApp.controller('AnswerSurveyCtrl', ['$scope', '$http', 'Surveys', function ($scope, $http, Surveys) {
    'use strict';

    //Contains the survey information
    $scope.survey = null;

    //Contains the user information
    $scope.userInfo = null;

    //Question number having issues with the answer
    $scope.questionNumberWithError = -1;

    //Error message, in case there is an issue with an answer to a question
    $scope.errorMessage = '';

    //Survey submission success confirmation modal
    $scope.surveySuccessfullySubmitted = false;

    $scope.surveySubmitInProgress = false;

    //Submits the answers of the survey
    $scope.submitSurvey = function () {
        if ($scope.surveySubmitInProgress) {
            return;
        } else {
            $scope.surveySubmitInProgress = true;
        }

        //Reset any error messages
        $scope.questionNumberWithError = -1;

        $scope.errorMessage = '';

        //First - validate the answers provided.
        for (var i = 0; i < $scope.surveyAnswers.length; i++) {
            //Check if answering the question is mandatory
            if ($scope.surveyAnswers[i].options.isRequired === true) {
                //Yes, it is. Has the user entered it?
                if ($scope.surveyAnswers[i].type !== 'Multiple Selection' && $scope.surveyAnswers[i].value.length === 0) {
                    //No value provided. Inform the user
                    $scope.errorMessage = "This field is required";
                    $scope.questionNumberWithError = i;
                    $scope.surveySubmitInProgress = false;

                    //Don't proceed
                    return;
                } else if ($scope.surveyAnswers[i].type === 'Multiple Selection' && (!$scope.surveyAnswers[i].valueArray || $scope.surveyAnswers[i].valueArray.length === 0)) {
                    //No value provided. Inform the user
                    $scope.errorMessage = "This field is required";
                    $scope.questionNumberWithError = i;
                    $scope.surveySubmitInProgress = false;

                    //Don't proceed
                    return;
                }
            } else if ($scope.surveyAnswers[i].isNumeric === true || $scope.surveyAnswers[i].type === 'Numeric') {
                //The answer to the question should be a numeric value - is it?
                if ($scope.surveyAnswers[i].value.toString().match(/^-?[0-9]+$/) === null) {
                    //No value provided. Inform the user
                    $scope.errorMessage = "Only numeric values are allowed";
                    $scope.questionNumberWithError = i;
                    $scope.surveySubmitInProgress = false;

                    //Don't proceed
                    return;
                }
            }
        }

        //All validations passed. Submit the answer
        var surveySubmission = {};

        surveySubmission.userId = $scope.userInfo._id;
        surveySubmission.surveyId = $scope.survey._id;
        surveySubmission.answers = [];

        for (var i = 0; i < $scope.surveyAnswers.length; i++) {
            if ($scope.surveyAnswers[i].type === 'Title / Header') {
                //Do not record answer for this question type
                continue;
            }

            surveySubmission.answers.push($scope.surveyAnswers[i]);
        }

        $http.post('/tableControlApi/surveys_submitted', surveySubmission)
            .success(function (result) {
                var changed = false;

                if (!angular.isUndefined(result.data._id)) {
                    var userDetails = {};
                    //Update only those fields that have changed
                    //Associate the activity with the user
                    userDetails._id = $scope.userInfo._id;

                    userDetails.activity = $scope.userInfo.activity;
                    userDetails.winter = $scope.userInfo.winter || [];
                    userDetails.summer = $scope.userInfo.summer || [];

                    //user.activity subdoc when test submits a profile survey
                    var userActivity = {};
                    userActivity.name = $scope.survey.name;
                    userActivity.surveyId = $scope.survey._id;
                    userActivity.survey_submittedId = result.data._id;
                    if(angular.isUndefined(userDetails.activity) || userDetails.activity === null){
                        userDetails.activity = [];
                    }
                    userDetails.activity.push(userActivity);

                    if ($scope.activityInfo.activityType) {
                        switch ($scope.activityInfo.activityType) {
                            case 'winter':
                                if (userDetails.winter.indexOf($scope.activityInfo.activity) !== -1) {
                                    delete userDetails.winter;
                                } else {
                                    userDetails.winter.push($scope.activityInfo.activity);
                                    changed = true;
                                }

                                delete userDetails.summer;
                                break;

                            case 'summer':
                                if (userDetails.summer.indexOf($scope.activityInfo.activity) !== -1) {
                                    delete userDetails.summer;
                                } else {
                                    userDetails.summer.push($scope.activityInfo.activity);
                                    changed = true;
                                }

                                delete userDetails.summer;
                                break;

                            case 'both':
                                if (userDetails.winter.indexOf($scope.activityInfo.activity) === -1) {
                                    userDetails.winter.push($scope.activityInfo.activity);

                                    changed = true;
                                } else {
                                    delete userDetails.winter;
                                }
                                
                                if (userDetails.summer.indexOf($scope.activityInfo.activity) === -1) {
                                    userDetails.summer.push($scope.activityInfo.activity);

                                    changed = true;
                                } else {
                                    delete userDetails.summer;
                                }
                                break;
                        }

                    }

                    if (!changed) {
                        delete userDetails.winter;
                        delete userDetails.summer;
                    }

                    //Update the user details
                    $http.put('/api/updateUser', JSON.stringify(userDetails))
                        .success(function (result) {
                            //Update the user details that we have
                             $scope.surveySuccessfullySubmitted = true;
                             if (!angular.isUndefined($scope.updateSurveyInfo)) {
                                //Inform the parent to update the list of surveys yet to be submitted
                                $scope.updateSurveyInfo();
                             }
                        })
                        .error(function (err) {
                            console.log(err);
                        });

                }

                $scope.surveySubmitInProgress = false;
            });
    };

    //Add multiple values to the answer
    $scope.addMultipleAnswer = function ($event, answer, value) {
        if (!answer.valueArray) {
            answer.valueArray = [];
        }

        var checkbox = $event.target,
            index = answer.valueArray.indexOf(value);

        //Should we add the selection or remove the selection?
        if (checkbox.checked === true) {
            //Add the option, if not already added
            if (index === -1) {
                answer.valueArray.push(value);
            }
        } else {
            //Remove the value, if exists
            if (index !== -1) {
                answer.valueArray.splice(index, 1);
            }
        }
    };

    $scope.getQuestionNumber = function (originalIndex) {
        return Surveys.getQuestionNumber(originalIndex + 1, $scope.surveyAnswers);
    };
}]);
