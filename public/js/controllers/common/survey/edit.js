dashboardApp.controller('SurveyEditCtrl', ['$scope', '$routeParams', '$http', '$timeout', '$window', 'notificationWindow', 'async', 'loginState', 'Media', 'Surveys',
function ($scope, $routeParams, $http, $timeout, $window, notificationWindow, async, loginState, Media, Surveys) {
    'use strict';

    var surveyId = $routeParams['itemId'],
        oldSurvey,
        user = {},
        request = {},
        deletedImages = [],
        path;

    $scope.loadingSurvey = true;

    $scope.categories = [];

    $scope.activities = [];

    $scope.survey = {};

    $scope.questionTypes = ['Numeric', 'Rating', 'Single Selection', 'Multiple Selection', 'Free form text', 'Title / Header'];

    $scope.uploadedButNotSavedImages = {
        images: []
    };

    $scope.ratingGroups = ['Comfort', 'Design', 'Durability', 'Features', 'Fit', 'Odor', 'Performance', 'Quality', 'Slip Resistance', 'Value', 'Waterproof', 'Would You Buy?'];

    $scope.singleSelectionWeights = [0, 1, 2, 3, 4 , 5];

    var updateSurveysInWeartests = function () {
        notificationWindow.show('Survey updated successfully. Change in survey name detected. Identifying the product tests that contain the current survey...', true);

        async.waterfall([
            function (callback) {
                var path = '/api/mesh01/weartest',
                    projection = {
                        '_id': 1,
                        'productSurveys': 1
                    },
                    query = {
                        'productSurveys.survey_id': $scope.survey._id
                    };

                path += '?query=' + JSON.stringify(query);

                path += '&projection=' + JSON.stringify(projection);

                $http.get(path)
                    .success(function (results) {
                        if (angular.isArray(results)) {
                            callback(null, results);
                        } else {
                            callback(new Error('Error. Could not identify the product tests that contain the current survey'));
                        }
                    })
                    .error(function (err) {
                        console.log(err);

                        callback(new Error('Error. Could not identify the product tests that contain the current survey'));
                    });

                $scope.$apply();
            },
            function (results, callback) {
                var i, j;

                for (i = 0; i < results.length; i++) {
                    for (j = 0; j < results[i].productSurveys.length; j++) {
                        if (results[i].productSurveys[j].survey_id === $scope.survey._id) {
                            results[i].productSurveys[j].surveyName = $scope.survey.name;

                            break;
                        }
                    }
                }

                if (results.length > 0) {
                    $scope.$apply(function () {
                        notificationWindow.show('Detected ' + results.length + ' product tests. Updating the survey name in each product test...', true);
                        async.each(results,
                            function (weartest, callback) {
                                var path = '/api/mesh01/weartest/' + weartest._id;

                                $http.put(path, weartest)
                                    .success(function (result) {
                                        if (result._id === weartest._id) {
                                            callback(null, true);
                                        } else {
                                            callback(new Error('Error. Could not update product test with id' + weartest._id));
                                        }
                                    })
                                    .error(function (err) {
                                        console.log(err);

                                        callback(new Error('Error. Could not update product test with id' + weartest._id));
                                    });
                            },
                            function (err) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null, true);
                                }
                            }
                        );
                    });
                } else {
                    callback(null, false);
                }
            }
        ],  function (err, found) {
            if (err) {
                console.log(err);

                notificationWindow.show('Error. Could not update all product tests that contain the current survey', false);
            } else {
                if (found) {
                    notificationWindow.show('Product tests containing the current survey updated successfully. Redirecting...', false);
                } else {
                    notificationWindow.show('No product tests found that contain the current survey. Redirecting...', false);
                }

                $timeout(function () {
                    $window.history.back();
                }, 1000);
            }
        });
    };

    loginState.getLoginState(function (data) {
        user = data.userInfo;
    });

    $http.get('/js/static-data.json')
        .success(function (data) {
            $scope.categories = data.categories;
            $scope.activities = data.activities;
        });

    path = '/api/mesh01/surveys/' + surveyId;

    notificationWindow.show('Retrieving details of the survey...', true);

    $http.get(path)
        .success(function (result) {
            if (result._id === surveyId) {
                $scope.survey = result;

                oldSurvey = JSON.parse(JSON.stringify($scope.survey));

                $scope.loadingSurvey = false;

                notificationWindow.show('Successfully retrieved survey details', false);
            } else {
                notificationWindow.show('Error. Could not retrieve details of the survey', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error. Could not retrieve details of the survey', false);
        });

    // Check if any weartest is using the Survey
    path = '/api/mesh01/weartest';

    var query = {
        'productSurveys.survey_id': surveyId
        };

    path += '?query=' + JSON.stringify(query);

    $scope.surveyUsedinweartest = false;

    $http.get(path)
        .success(function (result) {
            if (result.length > 0) {
                $scope.surveyUsedinweartest = true;
            } else {
                $scope.surveyUsedinweartest = false;
            }
        })
        .error(function (err) {
            $scope.surveyUsedinweartest = false;
        });

    // Check if any answers have been submitted for the Survey
    path = '/api/mesh01/surveys_submitted';

    var query = {
        'surveyId': surveyId
        };

    path += '?query=' + JSON.stringify(query);

    $scope.surveyHasanswers = false;

    $http.get(path)
        .success(function (result) {
            if (result.length > 0) {
                $scope.surveyHasanswers = true;
            } else {
                $scope.surveyHasanswers = false;
            }
        })
        .error(function (err) {
            $scope.surveyHasanswers = false;
        });

    //Save changs to the survey
    $scope.saveChanges = function () {
        var errorMessage,
            question,
            minValue,
            maxValue,
            defaultValue,
            path,
            i;

        if (request.savingSurvey) {
            return;
        }

        request.savingSurvey = true;

        //Ensure the survey has a title
        if (!$scope.survey.name || $scope.survey.name.length === 0) {
            notificationWindow.show('Provide a name for the survey', false);

            request.savingSurvey = false;

            return;
        }

        //Ensure the survey has an activity
        if ($scope.survey.type === 'Activity' && !$scope.survey.activity) {
            notificationWindow.show('Provide an activity for the survey', false);

            request.savingSurvey = false;

            return;
        }

        for (i = 0; i < $scope.survey.questions.length; i++) {
            question = $scope.survey.questions[i];

            if (!question.question || question.question.length === 0) {
                errorMessage = 'question ' + (i + 1) + ': There is no text for the question';

                break;
            }

            if (question.type === 'Rating') {
                if (question.options.minValue.length === 0) {
                    errorMessage = 'question ' + (i + 1) + ': Provide a valid minimum value';

                    break;
                } else if (question.options.minValue.toString().match(/^-?[0-9]+$/) === null) {
                    errorMessage = 'question ' + (i + 1) + ': Minimum value must only be a number';

                    break;
                } else if (question.options.minValueLabel.length === 0) {
                    errorMessage = 'question ' + (i + 1) + ': Provide a label for the minimum value';

                    break;
                }

                if (question.options.maxValue.length === 0) {
                    errorMessage = 'question ' + (i + 1) + ': Provide a valid maximum value';

                    break;
                } else if (question.options.maxValue.toString().match(/^-?[0-9]+$/) === null) {
                    errorMessage = 'question ' + (i + 1) + ': Maximum value must only be a number';

                    break;
                } else if (question.options.maxValueLabel.length === 0) {
                    errorMessage = 'question ' + (i + 1) + ': Provide a label for the maximum value';

                    break;
                }

                if (question.options.defaultValue.length === 0) {
                    errorMessage = 'question ' + (i + 1) + ': Provide a valid default value';

                    break;
                } else if (question.options.defaultValue.toString().match(/^-?[0-9]+$/) === null) {
                    errorMessage = 'question ' + (i + 1) + ': Default value must only be a number';

                    break;
                }

                minValue = parseInt(question.options.minValue, 10);

                maxValue = parseInt(question.options.maxValue, 10);

                defaultValue = parseInt(question.options.defaultValue, 10);

                if (minValue >= maxValue) {
                    errorMessage = 'question ' + (i + 1) + ': Minimum value must be less than maximum value';

                    break;
                }

                if (defaultValue < minValue || defaultValue > maxValue) {
                    errorMessage = 'question ' + (i + 1) + ': Default value should be between minimum and maximum value (inclusive)';

                    break;
                }
            } else if (question.type === 'Single Selection') {
                if (question.options.considerForRating === true) {
                    //Make sure that the question has a rating group associated with it
                    if (!question.ratingGroup || $scope.ratingGroups.indexOf(question.ratingGroup) === -1) {
                        errorMessage = 'question ' + (i + 1) + ': Select a valid rating group';

                        break;
                    }
                }
            }
        }

        if (errorMessage) {
            notificationWindow.show('Error in ' + errorMessage, false);

            request.savingSurvey = false;

            return;
        }

        path = '/api/mesh01/surveys/' + $scope.survey._id;

        notificationWindow.show('Saving changes to survey...', true);

        $scope.survey.deleted = false;
        $http.put(path, $scope.survey)
            .success(function (result) {
                var i;

                if (result._id === $scope.survey._id) {
                    if (oldSurvey.name !== $scope.survey.name) {
                        //Update the name of the survey which is present in weartest(s) as product surveys
                        updateSurveysInWeartests();
                    } else {
                        //Check if there are images that were deleted - if so, then delete them from Cloudinary
                        for (i = 0; i < deletedImages.length; i++) {
                            Media.delete(deletedImages[i], 'image');
                        }

                        notificationWindow.show('Changes to survey successfuly saved. Redirecting to previous screen...', false);

                        $timeout(function () {
                            $window.history.back();
                        }, 1000);
                    }
                } else {
                    notificationWindow.show('Error. Could not save changes to survey', false);
                }

                request.savingSurvey = false;
            })
            .error(function (err) {
                console.log(err);

                request.savingSurvey = false;

                notificationWindow.show('Error. Could not save changes to survey', false);
            });
    };

    //Exit without changing survey
    $scope.cancelChanges = function () {
        var i;

        if (request.cancellingChanges) {
            return;
        }

        request.cancellingChanges = true;

        //Before returning, check for uploaded images that were not saved
        if ($scope.uploadedButNotSavedImages.images.length > 0) {
            //Found images. Delete them from Cloudinary
            for (i = 0; i < $scope.uploadedButNotSavedImages.images.length; i++) {
                Media.delete($scope.uploadedButNotSavedImages.images[i].url, 'images');
            }
        }

        $window.history.back();
    };

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    $scope.openDeleteSurveyModal = function () {

        $scope.showDeleteSurveyModal = true;
    };

    $scope.closeDeleteSurveyModal = function () {
        $scope.showDeleteSurveyModal = false;

        $scope.newSurvey = {};
    };

    //Do a Soft Delete of the survey
    $scope.deleteSurvey = function () {
        var path;

        if (request.deletingSurvey) {
            return;
        }

        request.deletingSurvey = true;

        path = '/api/mesh01/surveys/' + $scope.survey._id;

        notificationWindow.show('Deleting survey...', true);

        $scope.survey.deleted = true;
        $http.put(path, $scope.survey)
            .success(function (result) {
                if (result.deleted) {
                    notificationWindow.show('Survey successfully deleted. Redirecting to previous page...', false);

                    $timeout(function () {
                        $window.history.back();
                    }, 1000);
                } else {
                    notificationWindow.show('Error. Could not delete survey.', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not delete survey.', false);
            })
    };

    //Add a question at the specific index
    $scope.insertQuestionAtIndex = function (index) {
        var questionId,
            newQuestion;

        if (request.addingQuestion) {
            return;
        }

        request.addingQuestion = true;

        newQuestion = {
            type: 'Numeric',
            options: {
                isRequired: true,
                showCommentFlag: false
            },
            question: '',
            helpText: ''
        };

        $scope.survey.questions.splice(index, 0, newQuestion);

        request.addingQuestion = false;
    };

    //Remove question at the specified index
    $scope.removeQuestionAtIndex = function (index) {
        if (request.removingQuestion) {
            return;
        }

        request.removingQuestion = true;

        $scope.survey.questions.splice(index, 1);

        request.removingQuestion = false;
    };

    //Move question up and down
    $scope.moveQuestionUp = function (index) {
        var tempQuestion;

        if (request.movingQuestionUp) {
            return;
        } else if (index <= 0) {
            //Can't move up anymore
            return;
        }

        request.movingQuestionUp = true;

        //Remove the question from that location
        tempQuestion = $scope.survey.questions.splice(index, 1);

        //Now, insert it to the next location
        $scope.survey.questions.splice(index - 1, 0, tempQuestion[0]);

        request.movingQuestionUp = false;
    };

    $scope.moveQuestionDown = function (index) {
        var tempQuestion;

        if (request.movingQuestionDown) {
            return;
        } else if (index >= $scope.survey.questions.length - 1) {
            //Can't move down any further
            return;
        }

        request.movingQuestionDown = true;

        //Remove the question from that location
        tempQuestion = $scope.survey.questions.splice(index, 1);

        //Now, insert it to the next location
        $scope.survey.questions.splice(index + 1, 0, tempQuestion[0]);

        request.movingQuestionDown = false;
    };

    //Copy the provided question and insert after the provided index
    $scope.copyAndInsertQuestionAfterIndex = function (question, index) {
        var newQuestion;

        if (request.copyingQuestion) {
            return;
        }

        request.copyingQuestion = true;

        newQuestion = JSON.parse(JSON.stringify(question));

        delete newQuestion._id;

        $scope.survey.questions.splice(index + 1, 0, newQuestion);

        request.copyingQuestion = false;
    };

    //Depending on the question type, populate the question attributes
    $scope.updateQuestionAttributes = function (question) {
        var newOption;

        switch (question.type) {
            case 'Rating':
                question.options.defaultValue = 5;
                question.options.minValue = 0;
                question.options.minValueLabel = 'Min';
                question.options.maxValue = 10;
                question.options.maxValueLabel = 'Max';

                break;

            case 'Single Selection':
            case 'Multiple Selection':
                question.options.values = [];
                //Insert one option
                newOption = {
                    key: '',
                    value: ''
                };
                question.options.values.push(newOption);
                question.options.values.push(JSON.parse(JSON.stringify(newOption)));

                break;

            case 'Free form text':
                question.options.isSingleLine = true;
                question.hintText = '';
                break;

            case 'Title / Header':
                question.options.isRequired = false;
                question.options.showCommentFlag = false;
                break;
        }
    };

    //Move the choice up at the provided index for the question
    $scope.moveChoiceUp = function (question, index) {
        var tempChoice;

        if (index <=0) {
            //Can't move up any more
            return;
        }

        tempChoice = question.options.values.splice(index, 1);

        question.options.values.splice(index - 1, 0, tempChoice[0]);
    };

    //Move the choice down at the provided index for the question
    $scope.moveChoiceDown = function (question, index) {
        var tempChoice;

        if (index >= question.options.values.length - 1) {
            //Can't move up any more
            return;
        }

        tempChoice = question.options.values.splice(index, 1);

        question.options.values.splice(index + 1, 0, tempChoice[0]);
    };

    //Insert a answer choice after the provided index
    $scope.insertChoiceAfterIndex = function (question, index) {
        var newChoice = {
            key: '',
            value: ''
        };

        question.options.values.splice(index + 1, 0, newChoice);
    };

    //Removes the answer choice at the provided index
    $scope.removeChoiceAtIndex = function (question, index) {
        if (question.options.values.length < 3) {
            //Cannot remove choices. Such a question needs at least 2 choices
            return;
        }

        question.options.values.splice(index, 1);
    };

    $scope.isUserAdmin = function () {
        return user.utype === 'Admin';
    };

    $scope.isActivitySurvey = function () {
        if (user.utype === 'Admin' && $scope.survey.type === 'Activity') {
            return true;
        }

        return false;
    };

    //Removes the image from the question and deletes the image from Cloudinary
    //if image was not saved in the survey
    $scope.deleteImageForQuestion = function (question) {
        var imageUrl,
            i;

        if (question.supportingImage && question.supportingImage.length > 0) {
            imageUrl = question.supportingImage;
            question.supportingImage = '';

            for (i = 0; i < $scope.uploadedButNotSavedImages.images.length; i++) {
                if ($scope.uploadedButNotSavedImages.images[i].url === imageUrl) {
                    //Image was uploaded but survey not saved. Delete image from cloudinary as well then.
                    Media.delete(imageUrl, 'image');

                    //Image is no longer present in cloudinary - forget about it.
                    $scope.uploadedButNotSavedImages.images.splice(i, 1)

                    //We are done here
                    return;
                }
            }

            //Looks like image was saved in survey. Wait for user to save changes to survey before deleting from cloudinary
            deletedImages.push(imageUrl);
        }
    };

    $scope.getQuestionNumber = function (originalIndex) {
        return Surveys.getQuestionNumber(originalIndex + 1, $scope.survey.questions);
    };

    $scope.setWeight = function (option, value) {
        if (option.weight === value) {
            option.weight = 0;
        } else {
            option.weight = value;
        }
    };
}
]);
