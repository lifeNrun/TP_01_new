dashboardApp.controller('WeartestCreateEditCtrl', ['$scope', '$routeParams', '$http', '$filter', '$timeout', '$location', 'loginState', 'notificationWindow', 'async', 'WTServices', 'activityLogCount', 'wearTestScorePolicy', 'Surveys',
function ($scope, $routeParams, $http, $filter, $timeout, $location, loginState, notificationWindow, async, WTServices, activityLogCount, wearTestScorePolicy, Surveys) {
    'use strict';

    var path,
        user,
        mode = $routeParams['mode'],
        weartestId = $routeParams['itemId'],
        section = $routeParams['subSection'],
        oldWeartest,
        request = {},
        surveysInWeartest,
        newSurveyId,
        projection;

    $scope.weartest = {};

    $scope.imagesetForWeartest = {};

    $scope.imagesetForUser = {};

    $scope.categoriesForDropdown = [];

    $scope.activitiesForDropdown = [];

    $scope.showManageProductImagesModal = false;

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    $scope.customStrictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
        dialogClass: 'modal wider'
    };

    $scope.performanceZonesDates = [];

    $scope.productWearAndTearDates = [];

    $scope.surveyList = [];

    $scope.customSurveyModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
        dialogClass: 'modal surveyBuilder wider'
    };

    $scope.showSurveyModal = false;

    $scope.control = {};

    $scope.control.surveyFilter = '';

    $scope.loadingSurveys = true;

    $scope.surveyListSortColumn = '';

    $scope.surveyListSortReverse = false;

    $scope.surveyListDisplayLimit = 30;

    $scope.showSurveyListFilteredResults = false;

    $scope.rulesForWeartest = [];

    $scope.customRuleDetailsModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
        dialogClass: 'modal modal-rules'
    };

    $scope.showRuleDetailsModal = false;

    $scope.selectedRuleDetails = {};

    $scope.showRulesManageModal = false;

    $scope.weartestValidationResult = {};

    $scope.showSurveyDetailsModal = false;

    $scope.survey = {};

    $scope.showCreateSurveyModal = false;

    $scope.newSurvey = {};

    $scope.editRatingGroupWeights = false;

    //Infinite scroll - increase limit on displayed weartests
    $scope.increaseSurveyDisplayLimit = function () {
        if ($scope.surveyListDisplayLimit > $scope.surveyList.length) {
            return;
        } else {
            $scope.surveyListDisplayLimit += 15;
        }
    };

    if (!section) {
        section = 'overview';
    }

    //Calculates the total score of the weartest based on certain attributes
    var getWeartestScore = function () {
        var score = 0,
            logCount = 0;

        //Calculate the contribution of the activity logs to the score
        if (angular.isDefined($scope.weartest.wearTestStartDate) && angular.isDefined($scope.weartest.wearTestEndDate) && angular.isDefined($scope.weartest.frequencyActivityLog)) {
            logCount = activityLogCount.get($scope.weartest);

            score = score + (logCount * wearTestScorePolicy.activityLogScore);
        }

        //Calculate the contribution of the performance zones to the score
        if (angular.isDefined($scope.weartest.performanceZonesDates)) {
            score = score + ($scope.weartest.performanceZonesDates.length * wearTestScorePolicy.performanceZoneScore);
        }

        //Calculate the contribution of the Wear and Tear to the score
        if (angular.isDefined($scope.weartest.productWearAndTearDates)) {
            score = score + ($scope.weartest.productWearAndTearDates.length * wearTestScorePolicy.wearAndTearScore);
        }

        //Calculate the contribution of the surveys to the score
        if (angular.isDefined($scope.weartest.productSurveys)) {
            score = score + $scope.weartest.productSurveys.length * wearTestScorePolicy.surveyScore;
        }

        return score;
    };

    //Retrieve all the rules uploaded by the user
    var getRules = function () {
        var newImageset,
            newUser,
            path,
            projection;

        $scope.rulesForWeartest = [];

        //Each user is associated with an Image Set
        //Get the image set of the current user and then proceed to
        //fetch all the rule based images
        if (user.user_imageset) {
            path = '/api/mesh01/imagesets/' + user.user_imageset;

            projection = {
                '_id': 1,
                'images': 1
            };

            path += '?projection=' + JSON.stringify(projection);

            notificationWindow.show('Retrieving rules for product test...', true);

            $http.get(path)
                .success(function (result) {
                    var i;

                    if (result._id === user.user_imageset) {
                        $scope.imagesetForUser = result;

                        for (i = 0; i < $scope.imagesetForUser.images.length; i++) {
                            if ($scope.imagesetForUser.images[i].type === 'rules') {
                                //Add the rule to the list
                                $scope.rulesForWeartest.push($scope.imagesetForUser.images[i]);
                            }
                        }

                        if ($scope.rulesForWeartest.length > 0) {
                            notificationWindow.show('Rules retrieved successfully', false);
                        } else {
                            notificationWindow.show('No rules found. Upload rules for product test before activating product test', false);
                        }
                    } else {
                        notificationWindow.show('Error retrieving rules for product test', false);
                    }
                })
                .error(function (err) {
                    console.log(err);

                    notificationWindow.show('Error retrieving rules for product test', false);
                });
        } else {
            //No Image Set exists - create one.
            newImageset = {
                name: user.username,
                type: 'Profile',
                status: 'active',
            };

            path = '/api/mesh01/imagesets';

            notificationWindow.show('Creating a collection for you to upload your rules...', true);

            $http.post(path, newImageset)
                .success(function (result) {
                    if (result._id && result.name === newImageset.name) {
                        //Store the imageset details
                        $scope.imagesetForUser = result;
                        
                        user.user_imageset = $scope.imagesetForUser._id;

                        path = '/api/mesh01/users/' + user._id;

                        newUser = {
                            '_id': user._id,
                            'user_imageset': user.user_imageset
                        };

                        notificationWindow.show('Collection created successfully. Proceeding to update your details with the new collection...', true);

                        //Update the user details
                        $http.put(path, newUser)
                            .success(function (result) {
                                if (result._id === user._id && result.user_imageset === user.user_imageset) {
                                    notificationWindow.show('Collection has been successfully added to your profile', false);
                                } else {
                                    notificationWindow.show('Error updating your profile with the collection', false);
                                }
                            })
                            .error(function (err) {
                                console.log(err);

                                notificationWindow.show('Error updating your profile with the collection', false);
                            });
                    } else {
                        notificationWindow.show('Error creating a collection. You may not be able to use rules', false);
                    }
                })
                .error(function (err) {
                    console.log(err);

                    notificationWindow.show('Error creating a collection. You may not be able to use rules', false);
                });
        }
    };

    var determineActiveStep = function () {
        switch (section) {
            case 'overview':
                $scope.activeStep = 1;
                break;

            case 'dates':
                $scope.activeStep = 2;
                break;

            case 'images':
                $scope.activeStep = 3;
                break;

            case 'surveys':
                $scope.activeStep = 4;
                break;

            case 'rules':
                $scope.activeStep = 5;
                break;

            case 'confirmation':
                $scope.activeStep = 6;
                break;
        }
    };

    var fetchStaticData = function () {
        $http.get('/js/static-data.json')
            .success(function (result) {
                $scope.categoriesForDropdown = result.categories;
                $scope.activitiesForDropdown = result.activities;
            });
    };

    var getImagesetDetails = function () {
        var imagesetId = $scope.weartest.imageSetId,
            imageset,
            path;

        if (imagesetId) {
            path = '/api/mesh01/imagesets/' + imagesetId;

            notificationWindow.show('Retrieving image collection details associated with product test...', true);

            $http.get(path)
                .success(function (result) {
                    if (result._id && result._id === imagesetId) {
                        $scope.imagesetForWeartest = result;

                        notificationWindow.show('Details of image collection associated with product test retrieved successfully', false);

                        //Check if user tried to activate weartest from another page
                        if (($location.search())['activate']) {
                            $scope.activateWeartest();
                        }
                    } else {
                        notificationWindow.show('Error retrieving image collection details of product test', false);
                    }
                })
                .error(function (err) {
                    console.log(err);

                    notificationWindow.show('Error retrieving image collection details of product test', false);
                });
        } else {
            async.waterfall([
                function (callback) {
                    var imageset = {},
                        path;

                    imageset.name = 'weartest-' + $scope.weartest._id;
    
                    imageset.description = 'Auto generated imageset for Product Test-'+ $scope.weartest._id;

                    imageset.status = 'active';

                    imageset.type = 'WearTest';

                    path = '/api/mesh01/imagesets';

                    notificationWindow.show('No image collection found for product test. Creating one...', true);

                    $http.post(path, imageset)
                        .success(function (result) {
                            if (result._id) {
                                $scope.imagesetForWeartest = result;

                                notificationWindow.show('Image collection for product test successfully created. Associating image collection to product test...', true);

                                callback(null);
                            } else {
                                callback(new Error('Error creating imageset'));
                            }
                        })
                        .error(function (err) {
                            callback(err);
                        });

                    $scope.$apply();
                },
                function (callback) {
                    var path = '/api/mesh01/weartest/' + $scope.weartest._id;

                    $scope.weartest.imageSetId = $scope.imagesetForWeartest._id;

                    $http.put(path, $scope.weartest)
                        .success(function (result) {
                            if (result._id && result._id === $scope.weartest._id && result.imageSetId === $scope.weartest.imageSetId) {
                                notificationWindow.show('All set. You are ready to edit the product test', false);
                            } else {
                                callback(new Error('Error associating image collection with product test'));
                            }
                        })
                        .error(function (err) {
                            callback(err);
                        });

                    $scope.$apply();
                }
            ], function (err) {
                if (err) {
                    console.log(err);

                    notificationWindow.show('Error creating image collection', false);
                }

                if (($location.search())['activate']) {
                    $scope.activateWeartest();
                }
            });
        }
    };

    var getSurveys = function () {
        var path = '/api/mesh01/surveys',
            projection = {
                '_id': 1,
                'name': 1,
                'activity': 1,
                'category': 1,
                'modifiedDate': 1
            },
            query,
            orderBy;

            if (user.utype === 'Admin') {
                //Admin can see all surveys
                query = {
                    'type': 'Wear Test Survey'
                };
            } else {
                query = {
                    '$or': [
                        {
                            'allowed': user.company
                        },
                        {
                            'isPublic': true
                        }
                    ],
                    'type': 'Wear Test Survey',
                };

                orderBy = {
                    'modifiedDate': -1
                };

            }

        query['deleted'] = {
            $in: [false, null]
        };
        
        if ($scope.surveyList.length > 0) {
            return;
        }

        $scope.loadingSurveys = true;

        path += '?query=' + JSON.stringify(query);

        path += '&projection=' + JSON.stringify(projection);

        if (orderBy) {
            path += '&orderBy=' + JSON.stringify(orderBy);
        }

        notificationWindow.show('Retrieving surveys...', true);

        $http.get(path)
            .success(function (result) {
                if (angular.isArray(result)) {
                    $scope.surveyList = result;
                    notificationWindow.show('Product test surveys retrieved successfully', false);

                    $scope.loadingSurveys = false;
                } else {
                    notificationWindow.show('Error retrieving surveys', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error retrieving surveys', false);
            });
    };

    var copySurveyToMyArchiveAndEditSurvey = function (survey) {
        var editSurvey = function (survey) {
            notificationWindow.show('Redirecting to page where the survey can be edited...', false);

            //Wait for the modal to close
            $timeout(function () {
                $location.path('/dashboard/surveys/owned/' + newSurveyId + '/edit');
            }, 500);
        };

        if (survey.isPublic && !$scope.isUserAdmin()) {
            $scope.copySurveyToMyArchive(function (survey) {
                editSurvey();
            });
        } else {
            $scope.closeSurveyDetailsModal();

            newSurveyId = survey._id;

            notificationWindow.show('Redirecting to page where the survey can be edited...', false);

            editSurvey(survey);
        }
    };

    //Returns the existing weight value for a rating group
    var getWeightForGroup = function (groupName) {
        //Backward compatibility for newly added attribute
        if (!$scope.weartest.ratingGroupWeights) {
            return 0;
        }

        for (var i = 0; i < $scope.weartest.ratingGroupWeights.length; i++) {
            if ($scope.weartest.ratingGroupWeights[i].name === groupName) {
                return $scope.weartest.ratingGroupWeights[i].weight;
            }
        }

        //For all other cases
        return 0;
    };

    //Applicable for the Star Rating page
    var getStarRatingRelevantQuestions = function (latest) {
        var productSurveyIds,
            path,
            query;

        //Collect all the survey IDs associated with the weartest
        productSurveyIds = $scope.weartest.productSurveys.map(function (survey) {
            return survey.survey_id;
        });

        if (productSurveyIds.length === 0 && !latest) {
            notificationWindow.show('Product test details retrieved successfully', false);

            return;
        } else if (productSurveyIds.length === 0 && latest) {
            //Silently return
            return;
        }

        path = '/api/mesh01/surveys';

        query = {
            "_id": {
                "$in": productSurveyIds
            }
        };

        path += '?query=' + JSON.stringify(query);

        notificationWindow.show('Product test details fetched. Retrieving details of survey associated with product test', true);

        $http.get(path)
            .success(function (results) {
                var questionGroups = [],
                    groupNameExists = false,
                    group;

                if (angular.isArray(results)) {
                    for (var i = 0; i < results.length; i++) {
                        for (var j = 0; j < results[i].questions.length; j++) {
                            if (results[i].questions[j].options.considerForRating === true && (!("version" in results[i].questions[j]) || results[i].questions[j].version === 'A' || results[i].questions[j].version.length === 0)) {
                                group = results[i].questions[j].ratingGroup;

                                groupNameExists = false;

                                for (var k = 0 ; k < questionGroups.length; k++) {
                                    if (questionGroups[k].name === group) {
                                        groupNameExists = true;
                                    }
                                }

                                if (!groupNameExists) {
                                    questionGroups.push({
                                        name: group,
                                        weight: getWeightForGroup(group)
                                    });
                                }
                            }
                        }
                    }

                    $scope.weightingFactorGroups = questionGroups;

                    notificationWindow.show('Survey details retrieved successfully.', false);
                } else {
                    notificationWindow.show('Error. Could not get details about surveys associated with product test', false);
                }
            })
            .error(function (err) {
                notificationWindow.show('Error. Could not get details about surveys associated with product test', false);
            });
    };

    loginState.getLoginState(function (data) {
        user = data.userInfo;

        if (section === 'rules') {
            getRules();
        }
    });

    path = '/api/mesh01/weartest/' + weartestId;

    projection = {
        '_id': 1,
        'name': 1,
        'wearTestOverview': 1,
        'expectationsOverview': 1,
        'companyOverview': 1,
        'activity': 1,
        'registrationDeadline': 1,
        'draftDate': 1,
        'wearTestStartDate': 1,
        'wearTestEndDate': 1,
        'compensation': 1,
        'requiredNumberofTesters': 1,
        'availablePoints': 1,
        'frequencyActivityLog': 1,
        'performanceZonesDates': 1,
        'productWearAndTearDates': 1,
        'productSurveys': 1,
        'status': 1,
        'styleNumber': 1,
        'supplier': 1,
        'factory': 1,
        'season': 1,
        'last': 1,
        'productDeveloper': 1,
        'designer': 1
    };

    switch (section) {
        case 'overview':
            projection['identification'] = 1;
            projection['companyOverview'] = 1;
            projection['productName'] = 1;
            projection['retailPrice'] = 1;
            projection['productType'] = 1;
            projection['companyWebsite'] = 1;
            break;

        case 'dates':
            projection['isPrivate'] = 1;
            projection['registrationStart'] = 1;
            projection['cashCompensation'] = 1;
            break;

        case 'images':
            projection['brandLogoLink'] = 1;
            projection['featureImageLink'] = 1;
            projection['imageSetId'] = 1;
            break;

        case 'surveys':
            projection['brandLogoLink'] = 1;
            projection['featureImageLink'] = 1;
            projection['ratingGroupWeights'] = 1;
            projection['rating'] = 1;
            projection['automaticRating'] = 1;
            break;

        case 'rules':
            projection['brandLogoLink'] = 1;
            projection['featureImageLink'] = 1;
            projection['rulesLink'] = 1;
            break;

        case 'confirmation':
            //For the confirmation step, we need everything except the participants information
            projection = {
                'participants': 0
            };
            break;
    }

    path += '?projection=' + JSON.stringify(projection);

    notificationWindow.show('Retrieving details of product test...', true);

    $http.get(path)
        .success(function (result) {
            if (result._id && result._id === weartestId) {
                $scope.weartest = result;

                oldWeartest = JSON.parse(JSON.stringify($scope.weartest));

                if (section === 'images' || section === 'confirmation') {
                    getImagesetDetails();
                } else if (section === 'surveys') {
                    if ($scope.weartest.automaticRating) {
                        getStarRatingRelevantQuestions(false);
                    } else {
                        notificationWindow.show('Product test details retrieved successfully', false);
                    }
                } else {
                    notificationWindow.show('Product test details retrieved successfully', false);
                }
            } else {
                notificationWindow.show('Error while retrieving product test details', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error while retrieving product test details', false);
        });

    determineActiveStep();

    fetchStaticData();

    $scope.updateRatingGroupWeights = function () {
        var sum = 0;

        //Verify that the % reach 100
        for (var i = 0; i < $scope.weightingFactorGroups.length; i++) {
            sum += $scope.weightingFactorGroups[i].weight;
        }

        //A sum of 100 or a sum of 0 are acceptable
        if (sum !== 100 && sum !== 0) {
            notificationWindow.show('Error. The weights for all the rating groups should be equal to 100', false);

            return;
        }

        $scope.weartest.ratingGroupWeights = $scope.weightingFactorGroups.slice(0);
        $scope.editRatingGroupWeights = false;
        $scope.updateWeartest('ratingGroupWeights');
    };

    $scope.isSectionActive = function (sectionNumber) {
        return sectionNumber === section;
    };

    $scope.updateWeartest = function (attribute, callback) {
        var changedWeartest = {},
            equalArray = true,
            differenceFound = false,
            key,
            path,
            i;

        //Unfortunately, the overview section has the tiny MCE editor that does not correctly
        //report the attribute changed. Thus, we have a seperate logic for the overview page
        if (section !== 'overview') {
            if (angular.isArray($scope.weartest[attribute])) {
                if (oldWeartest[attribute] && ($scope.weartest[attribute].length === oldWeartest[attribute].length)) {
                    for (i = 0; i < $scope.weartest[attribute].length; i++) {
                        if (angular.isObject($scope.weartest[attribute][i])) {
                            if (!angular.equals($scope.weartest[attribute][i], oldWeartest[attribute][i])) {
                                equalArray = false;
                                break;
                            }
                        } else if ($scope.weartest[attribute][i] !== oldWeartest[attribute][i]) {
                            equalArray = false;
                            break;
                        }
                    }

                    if (equalArray) {
                        if (attribute === 'productSurveys') {
                            //Product surveys would have set this as an action in progress
                            //Reset it
                            $scope.control.updateSurveyList = false;
                        }

                        return;
                    }
                }
            } else if ($scope.weartest[attribute] === oldWeartest[attribute]) {
                //No changes made;
                return;
            }
        } else {
            //Check all attributes present in the overview page to be certain that something has changed
            if ($scope.weartest.name !== oldWeartest.name) {
                differenceFound = true;

                attribute = 'name';
            } else if ($scope.weartest.wearTestOverview !== oldWeartest.wearTestOverview) {
                differenceFound = true;

                attribute = 'wearTestOverview';
            } else if ($scope.weartest.expectationsOverview !== oldWeartest.expectationsOverview) {
                differenceFound = true;

                attribute = 'expectationsOverview';
            } else if ($scope.weartest.companyOverview !== oldWeartest.companyOverview) {
                differenceFound = true;

                attribute = 'companyOverview';
            } else if ($scope.weartest.productName !== oldWeartest.productName) {
                differenceFound = true;

                attribute = 'productName';
            } else if ($scope.weartest.retailPrice !== oldWeartest.retailPrice) {
                differenceFound = true;

                attribute = 'retailPrice';
            } else if ($scope.weartest.productType !== oldWeartest.productType) {
                differenceFound = true;

                attribute = 'productType';
            } else if ($scope.weartest.activity.toString() !== oldWeartest.activity.toString()) {
                differenceFound = true;
  
                attribute = 'activity';
            } else if ($scope.weartest.companyWebsite !== oldWeartest.companyWebsite) {
                differenceFound = true;

                attribute = 'companyWebsite';
            } else if ($scope.weartest.requiredNumberofTesters !== oldWeartest.requiredNumberofTesters) {
                differenceFound = true;

                attribute = 'requiredNumberofTesters';
            } else if ($scope.weartest.styleNumber !== oldWeartest.styleNumber) {
                differenceFound = true;

                attribute = 'styleNumber';
            } else if ($scope.weartest.supplier !== oldWeartest.supplier) {
                differenceFound = true;

                attribute = 'supplier';
            } else if ($scope.weartest.factory !== oldWeartest.factory) {
                differenceFound = true;

                attribute = 'factory';
            } else if ($scope.weartest.season !== oldWeartest.season) {
                differenceFound = true;

                attribute = 'season';
            } else if ($scope.weartest.last !== oldWeartest.last) {
                differenceFound = true;

                attribute = 'last';
            } else if ($scope.weartest.productDeveloper !== oldWeartest.productDeveloper) {
                differenceFound = true;

                attribute = 'productDeveloper';
            } else if ($scope.weartest.designer !== oldWeartest.designer) {
                differenceFound = true;

                attribute = 'designer';
            }

            if (!differenceFound) {
                return;
            }
        }

        path = '/api/mesh01/weartest/' + weartestId;

        changedWeartest = {
            '_id': $scope.weartest._id
        };

        changedWeartest[attribute] = $scope.weartest[attribute];

        if ($scope.isWeartestStatus('active')) {
            $scope.weartest.availablePoints = getWeartestScore();

            changedWeartest.availablePoints = $scope.weartest.availablePoints;
        }

        notificationWindow.show('Saving changes to product test...', true);

        $http.put(path, changedWeartest)
            .success(function (result) {
                var success = false,
                    found,
                    i, j;

                if (result._id) {
                    switch (attribute) {
                        case 'registrationStart':
                        case 'registrationDeadline':
                        case 'draftDate':
                        case 'wearTestStartDate':
                        case 'wearTestEndDate':
                            if ((new Date(result[attribute])).getTime() === (new Date($scope.weartest[attribute])).getTime()) {
                                success = true;
                            }
                            break;

                        case 'performanceZonesDates':
                        case 'productWearAndTearDates':
                            if (result[attribute].length === $scope.weartest[attribute].length) {
                                for (i = 0; i < result[attribute].length; i++) {
                                    found = false;

                                    for (j = 0; j < $scope.weartest[attribute].length; j++) {
                                        if ((new Date(result[attribute][i])).getTime() === (new Date($scope.weartest[attribute][j])).getTime()) {
                                            found = true;
                                            break;
                                        }
                                    }

                                    if (!found) {
                                        break;
                                    }
                                }

                                if (i === result[attribute].length) {
                                    success = true;
                                }
                            }
                            break;

                        case 'productSurveys':
                            if (result[attribute].length === $scope.weartest[attribute].length) {
                                for (i = 0; i < result[attribute].length; i++) {
                                    if (result[attribute][i].survey_id !== $scope.weartest[attribute][i].survey_id) {
                                        found = true;
                                        break;
                                    } else if (result[attribute][i].name !== $scope.weartest[attribute][i].name) {
                                        found = true;
                                        break;
                                    } else if (result[attribute][i].triggerDate || $scope.weartest[attribute][i].triggerDate) {
                                        if ((new Date(result[attribute][i].triggerDate)).getTime() !== (new Date($scope.weartest[attribute][i].triggerDate)).getTime()) {
                                            found = true;
                                            break;
                                        }
                                    }
                                }

                                if (!found) {
                                    success = true;
                                }
                            }
                            break;

                        case 'requiredNumberofTesters':
                        case 'cashCompensation':
                            if (result[attribute] === parseInt($scope.weartest[attribute], 10)) {
                                success = true;
                            }
                            break;

                        case 'retailPrice':
                            if (parseFloat(result[attribute]) === parseFloat($scope.weartest[attribute])) {
                                success = true;
                            }
                            break;

                        case 'ratingGroupWeights':
                            if (result[attribute].length === $scope.weartest[attribute].length) {
                                for (i = 0; i < result[attribute].length; i++) {
                                    if (result[attribute][i].name !== $scope.weartest[attribute][i].name) {
                                        found = true;
                                        break;
                                    } else if (result[attribute][i].weight !== $scope.weartest[attribute][i].weight) {
                                        found = true;
                                        break;
                                    }
                                }

                                if (!found) {
                                    success = true;
                                }
                            }
                            break;

                        case 'activity':
                            if (angular.equals(result[attribute], $scope.weartest[attribute])) {
                                success = true;
                            }
                            break;

                        default:
                            if (result[attribute] === $scope.weartest[attribute]) {
                                success = true;
                            }
                            break;
                    }

                    if (success) {
                        if (attribute === 'status') {
                            if ($scope.weartest.status === 'active') {
                                notificationWindow.show('Product test activated successfully. Refreshing to get latest information...', false);

                                $timeout(function () {
                                    $location.path('/dashboard/weartests/current/' + $scope.weartest._id + '/edit/confirmation');
                                }, 2500);
                            } else if ($scope.weartest.status === 'closed') {
                                $location.path('/dashboard/weartests/closed/' + $scope.weartest._id + '/edit/confirmation');
                            } else {
                                $location.path('/dashboard/weartests/draft/' + $scope.weartest._id + '/edit/confirmation');
                            }
                        } else {
                            if (attribute === 'productSurveys') {
                                //Product Surveys are a document of their own with an _id field.
                                //Thus, we need to update the entire property to get the _id field
                                //in case a new survey was added
                                $scope.weartest.productSurveys = result.productSurveys;

                                $scope.control.updateSurveyList = false;

                                //Since the surveys have been changed, redetermine the rating groups
                                if ($scope.weartest.automaticRating) {
                                    getStarRatingRelevantQuestions(true);
                                }
                            }

                            oldWeartest = JSON.parse(JSON.stringify($scope.weartest));

                            notificationWindow.show('Changes to product test saved successfully', false);

                            if (attribute === 'automaticRating') {
                                if ($scope.weartest.automaticRating === true) {
                                    getStarRatingRelevantQuestions(true);
                                } else {
                                    $scope.weightingFactorGroups = [];
                                }
                            }

                            if (callback) {
                                callback();
                            }
                        }
                    } else {
                        notificationWindow.show('An error occurred. Changes to product test could not be saved. Kindly refresh the screen and try again', false);
                    }
                } else {
                    console.log(JSON.stringify(result));
                    notificationWindow.show('An error occurred. Changes to product test could not be saved. Kindly refresh the screen and try again', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('An error occurred. Changes to product test could not be saved. Kindly refresh the screen and try again', false);
            });
    };

    $scope.getCurrentMode = function () {
        return mode;
    };

    $scope.updateImagesetForWeartest = function (coverPhoto) {
        var path = '/api/mesh01/imagesets/' + $scope.imagesetForWeartest._id,
            updatedImageset;

        if (coverPhoto) {
            if ($scope.imagesetForWeartest.coverPhoto === oldWeartest.featureImageLink) {
                return;
            } else {
                updatedImageset = {
                    '_id': $scope.imagesetForWeartest._id,
                    'coverPhoto': $scope.imagesetForWeartest.coverPhoto
                };
            }
        } else {
            updatedImageset = JSON.parse(JSON.stringify($scope.imagesetForWeartest));

            //We need to delete the cover photo here since there could be a parallel request that is
            //updating the cover photo and it may result in a race condition
            //Changing weartest feature image is one such scenario
            delete updatedImageset.coverPhoto;
        }

        notificationWindow.show('Updating the image collection associated with the product test...', true);

        (function (coverPhoto) {
            $http.put(path, updatedImageset)
                .success(function (result) {
                    var cover;

                    if (result._id === $scope.imagesetForWeartest._id) {
                        if (coverPhoto && result.coverPhoto !== $scope.imagesetForWeartest.coverPhoto) {
                            notificationWindow.show('Error updating image collection associated with product test', false);
                        } else if (coverPhoto) {
                            $scope.imagesetForWeartest.coverPhoto = result.coverPhoto;

                            notificationWindow.show('Image set as cover photo of the image collection associated with the product test', false);
                        } else {
                            //Ensure that we do not update the cover photo, since it was not changed.
                            //There could be another pending request that updated the cover photo
                            //and we do not want to affect its outcome
                            cover = $scope.imagesetForWeartest.coverPhoto;

                            $scope.imagesetForWeartest = result;

                            $scope.imagesetForWeartest.coverPhoto = cover;

                            notificationWindow.show('Image collection associated with the product test updated successfully', false);
                        }
                    } else {
                        notificationWindow.show('Error updating image collection associated with product test', false);
                    }
                })
                .error(function (err) {
                    console.log(err);

                    notificationWindow.show('Error updating image collection associated with product test', false);
                });
        })(coverPhoto);
    };

    $scope.updateImagesetForUser = function () {
        var path = '/api/mesh01/imagesets/' + $scope.imagesetForUser._id;

        notificationWindow.show('Updating your image collection with the updated rule(s)...', true);

        $http.put(path, $scope.imagesetForUser)
            .success(function (result) {
                var i;

                if (result._id === $scope.imagesetForUser._id) {
                    notificationWindow.show('Rule(s) updated successfully', false);

                    $scope.rulesForWeartest = [];

                    $scope.imagesetForUser = result;

                    for (i = 0; i < $scope.imagesetForUser.images.length; i++) {
                        if ($scope.imagesetForUser.images[i].type === 'rules') {
                            //Add the rule to the list
                            $scope.rulesForWeartest.push($scope.imagesetForUser.images[i]);
                        }
                    }
                } else {
                    notificationWindow.show('Error updating rules', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error updating rules', false);
            });
    };

    $scope.getProductImages = function  () {
        var imagesLength,
            images,
            productImages = [],
            i;

        if ($scope.imagesetForWeartest && $scope.imagesetForWeartest.images) {
            images = $scope.imagesetForWeartest.images;
            imagesLength = $scope.imagesetForWeartest.images.length;

            for (i = 0; i < imagesLength; i++) {
                if (images[i].type === 'productImage') {
                    productImages.push(images[i]);
                }
            }

            return productImages;
        }
    };

    $scope.openManageProductImagesModal = function () {
        $scope.showManageProductImagesModal = true;
    };

    $scope.closeManageProductImagesModal = function () {
        $scope.showManageProductImagesModal = false;
    };

    //This is called on productDates change. It has to be done this way because date picker cannot work with arrays directly -
    //it has to use objects in array for example : [{"date": {}}];
    $scope.updatePerformanceZoneDates = function () {
        var i;

        $scope.weartest.performanceZonesDates = [];

        for (i = 0; i < $scope.performanceZonesDates.length; i++) {
            $scope.weartest.performanceZonesDates.push($scope.performanceZonesDates[i].date);
        }

        $scope.updateWeartest('performanceZonesDates');
    };

    //Add product delivery date to array
    $scope.deletePerformanceZoneDeliveryDate = function (dateObject) {
        var index = $scope.performanceZonesDates.indexOf(dateObject);

        $scope.performanceZonesDates.splice(index, 1);
        //send changes to API
        $scope.updatePerformanceZoneDates();
    };

    //Add product delivery date to array
    $scope.addPerformanceZoneDeliveryDate = function () {
        if ($scope.performanceZonesDates) {
            $scope.performanceZonesDates.push({"date":new Date()});

            $scope.updatePerformanceZoneDates();
        }
    };

    //This is called on productDates change. It has to be done this way because date picker cannot work with arrays directly -
    //it has to use objects in array for example : [{"date": {}}];
    $scope.updateProductDates = function (){
        var i;

        $scope.weartest.productWearAndTearDates = [];
        for (i = 0; i < $scope.productWearAndTearDates.length; i++) {
            $scope.weartest.productWearAndTearDates.push($scope.productWearAndTearDates[i].date);
        }
        $scope.updateWeartest('productWearAndTearDates');
    };

    //Add product delivery date to array
    $scope.deleteProductDeliveryDate = function (dateObject) {
        var index = $scope.productWearAndTearDates.indexOf(dateObject);

        $scope.productWearAndTearDates.splice(index, 1);

        $scope.weartest.productWearAndTearDates.splice(index, 1);

        //send changes to API
        $scope.updateWeartest('productWearAndTearDates');
    };

    //Add product delivery date to array
    $scope.addProductDeliveryDate = function () {
        if ($scope.productWearAndTearDates) {
            $scope.productWearAndTearDates.push({"date":new Date()});
        }
        $scope.updateProductDates();
    };

    $scope.openSurveyModal = function () {
        surveysInWeartest = $scope.weartest.productSurveys.slice(0);

        $scope.showSurveyModal = true;

        $scope.control.surveyFilter = '';

        $scope.showSurveyListFilteredResults = true;

        getSurveys();
        
    };

    $scope.closeSurveyModal = function () {
        $scope.showSurveyModal = false;

        $scope.control.surveyFilter = '';

        $scope.showSurveyListFilteredResults = false;

        surveysInWeartest = [];
    };

    $scope.updateProductSurveys = function () {
        if ($scope.control.updateSurveyList) {
            return;
        }

        $scope.control.updateSurveyList = true;

        $scope.weartest.productSurveys = surveysInWeartest.slice(0);

        $scope.updateWeartest('productSurveys');

        $scope.closeSurveyModal();
    };

    //Sets the sort order. If the sort column is already set, that is
    //it is the same as the one passed, the order is changed
    $scope.setSurveyListSortOrder = function (columnName) {
        if ($scope.surveyListSortColumn === columnName) {
            $scope.surveyListSortReverse = !$scope.surveyListSortReverse;
        } else {
            $scope.surveyListSortColumn = columnName;
            $scope.surveyListSortReverse = true;
        }
    };

    $scope.isSurveyListSortColumn = function (columnName, ascending) {
        return $scope.surveyListSortColumn === columnName && $scope.surveyListSortReverse === !ascending;
    };

    //Check if specific survey is added to current weartest
    $scope.isSurveyIncludedInWeartest = function (survey) {
        var i;

        if ($scope.weartest.productSurveys) {
            for (i = 0; i < $scope.weartest.productSurveys.length; i++) {
                if ($scope.weartest.productSurveys[i].survey_id === survey._id) {
                    return true;
                }
            }
        }

        return false;
    };

    $scope.selectSurveyForWeartest = function (survey) {
        var newSurvey = {},
            found = false,
            i;

        for (i = 0; i < surveysInWeartest.length; i++) {
            if (surveysInWeartest[i].survey_id === survey._id) {
                found = true;

                surveysInWeartest.splice(i, 1);
            }
        }

        if (!found) {
            surveysInWeartest.push({
                survey_id: survey._id,
                surveyName: survey.name
            });
        }
    };

    //Deletes the survey
    $scope.deleteSurvey = function (index) {
        $scope.weartest.productSurveys.splice(index, 1);

        $scope.updateWeartest('productSurveys');
    };

    //duplicates the survey
    $scope.duplicateSurvey = function (survey) {
        var copiedSurvey = JSON.parse(JSON.stringify(survey));

        delete copiedSurvey._id;
        $scope.weartest.productSurveys.push(copiedSurvey);

        $scope.updateWeartest('productSurveys');
    };

    $scope.openRuleDetailsModal = function () {
        var i;

        if ($scope.weartest.rulesLink && $scope.weartest.rulesLink.length > 0) {
            for (i = 0; i < $scope.imagesetForUser.images.length; i++) {
                if ($scope.imagesetForUser.images[i].url === $scope.weartest.rulesLink) {
                    $scope.selectedRuleDetails = $scope.imagesetForUser.images[i];
                }
            }

            $scope.showRuleDetailsModal = true;
        }
    };

    $scope.closeRuleDetailsModal = function () {
        $scope.showRuleDetailsModal = false;

        $scope.selectedRuleDetails = {};
    };

    $scope.openRulesManageModal = function () {
        $scope.showRulesManageModal = true;
    };

    $scope.closeRulesManageModal = function () {
        $scope.showRulesManageModal = false;
    };

    //Update the Wear Test each time the rule selection changes (with a valid value)
    $scope.updateWeartestRule = function () {
        //Trigger only if valid value
        if ($scope.weartest.rulesLink && $scope.weartest.rulesLink.length > 0) {
            $scope.updateWeartest('rulesLink');
        }
    };

    $scope.isValidationResult = function (status) {
        if ($scope.weartestValidationResult.status) {
            return status === $scope.weartestValidationResult.status;
        }

        return false;
    };

    $scope.isWeartestStatus = function (status) {
        return status === $scope.weartest.status;
    };

    //Activates a wear test, if there are no errors
    $scope.activateWeartest = function () {
        var relevantImages = $scope.getProductImages(),
            activationResult;

        notificationWindow.show('Validating product test...', true);

        activationResult = WTServices.getActivationStatus($scope.weartest, relevantImages);

        if (activationResult.status === 'success') {
            notificationWindow.show('All validations passed. Activating product test...', true);

            $scope.weartest.status = 'active';

            $scope.updateWeartest('status');
        } else {
            notificationWindow.show('Product test validation failed. Check error messages on validation', false);

            $scope.weartestValidationResult = activationResult;
        }
    };

    $scope.allowWeartestActivation = function () {
        if ($scope.imagesetForWeartest._id && $scope.weartest._id) {
            return true;
        }

        return false;
    };

    $scope.openSurveyDetailsModal = function (survey) {
        var path = '/api/mesh01/surveys/' + survey.survey_id;

        notificationWindow.show('Retrieving details of the survey...', true);

        $http.get(path)
            .success(function (result) {
                if (result._id === survey.survey_id) {
                    $scope.survey = result;

                    //Temporary attribute to indicate that the survey is loaded from within the weartest page
                    $scope.survey.fromWeartest = true;

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

    $scope.editSurvey = function (survey) {
        copySurveyToMyArchiveAndEditSurvey(survey);
    };

    //Copies the survey
    $scope.copySurveyToMyArchive = function (callback) {
        var copiedSurvey = JSON.parse(JSON.stringify($scope.survey)),
            oldSurveyId = copiedSurvey._id,
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
                var oldSurvey,
                    newSurvey,
                    i;

                if (result._id && result.name === copiedSurvey.name) {
                    newSurveyId = result._id;

                    notificationWindow.show('Successfully copied survey to your archive. Updating product test with new survey...', false);

                    for (i = 0; i < $scope.weartest.productSurveys.length; i++) {
                        if ($scope.weartest.productSurveys[i].survey_id === oldSurveyId) {
                            oldSurvey = $scope.weartest.productSurveys.splice(i, 1);

                            //Create a new survey with the new survey ID, but keep the old trigger date
                            newSurvey = {
                                survey_id: result._id,
                                surveyName: result.name,
                                triggerDate: oldSurvey[0].triggerDate
                            };

                            $scope.weartest.productSurveys.push(newSurvey);
                        }
                    }

                    $scope.updateWeartest('productSurveys', callback);
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

    //Returns the owner of a survey
    $scope.getSurveyOwner = function (survey) {
        if (survey.isPublic) {
            return 'Public';
        }

        return survey.allowed.join(', ');
    };

    $scope.openCreateSurveyModal = function () {
        $scope.newSurvey = {};

        $scope.showCreateSurveyModal = true;
    };

    $scope.closeCreateSurveyModal = function () {
        $scope.newSurvey = {};

        $scope.showCreateSurveyModal = false;
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
                        $location.path('/dashboard/surveys/owned/' + result._id + '/edit');
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

    $scope.isUserAdmin = function () {
        return user.utype === 'Admin';
    };

    $scope.deleteBrandLogo = function () {
        if ($scope.weartest.brandLogoLink && $scope.weartest.brandLogoLink.length > 0) {
            $scope.weartest.brandLogoLink = '';

            $scope.updateWeartest('brandLogoLink');
        }
    };

    $scope.deleteFeaturedImage = function () {
        if ($scope.weartest.featureImageLink && $scope.weartest.featureImageLink.length > 0) {
            $scope.weartest.featureImageLink = '';

            $scope.updateWeartest('featureImageLink');
        }
    };

    $scope.getQuestionNumber = function (originalIndex) {
        return Surveys.getQuestionNumber(originalIndex + 1, $scope.survey.questions);
    };

    $scope.getTotalWeightForGroup = function () {
        var sum = 0;

        if (!$scope.weightingFactorGroups || $scope.weightingFactorGroups.length === 0) {
            return sum;
        }

        for (var i = 0; i < $scope.weightingFactorGroups.length; i++) {
            sum += $scope.weightingFactorGroups[i].weight;
        }

        if (angular.isNumber(sum)) {
            return sum;            
        } else {
            return 'Invalid Weights';
        }

    };

    $scope.editStarRating = function () {
        $scope.editRatingGroupWeights = true;
    };

    $scope.cancelStarRating = function () {
        getStarRatingRelevantQuestions(false);
        $scope.editRatingGroupWeights = false;
    };
}
]);
