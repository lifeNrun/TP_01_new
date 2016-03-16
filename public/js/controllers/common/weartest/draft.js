dashboardApp.controller('WeartestDraftCtrl', ['$scope', '$http', '$routeParams', '$filter', '$timeout', 'testerUsersStorage', 'notificationWindow', 'async',
function ($scope, $http, $routeParams, $filter, $timeout, testerUsersStorage, notificationWindow, async) {
    'use strict';

    ///Any change carried out in this controller should also be copied over to the TesterListCtrl controller

    var tooltipTemplateForParticipants = "" +
        "<div class='row-fluid'>" +
            "<div class='span4'>" +
                "<h3 class='left'>ACTIVITIES</h3>" +
                "<ul>" +
                    "{{activitiyList}}" +
                "</ul>" +
            "</div>" +
            "<div class='span8'>" +
                "<h2>{{fullName}} ({{username}}) <span>{{gender}}, {{age}}</span></h2>" +
                "<div class='row-fluid'>" +
                    "<div class='span4 vertical-divider'>" +
                        "<h3>LOCATION</h3>" +
                        "{{cityAndState}}" +
                        "<h3>SHOE SIZE</h3>" +
                        "{{shoeSize}}" +
                        "<h3>WAIST</h3>" +
                        "{{waist}}&quot;" +
                    "</div>" +
                    "<div class='span4 vertical-divider'>" +
                        "<h3>HEIGHT</h3>" +
                        "{{height}}" +
                        "<h3>JACKET</h3>" +
                        "{{jacketSize}}" +
                        "<h3>INSEAM</h3>" +
                        "{{inseam}}&quot;" +
                    "</div>" +
                    "<div class='span4'>" +
                        "<h3>WEIGHT</h3>" +
                        "{{weight}} lbs." +
                        "<h3>GLOVES</h3>" +
                        "{{gloveSize}}" +
                    "</div>" +
                "</div>" +
                "<h3>BIO</h3>" +
                "<p>" +
                    "{{aboutMe}}" +
                "</p>" +
                "<div class='row-fluid'>" +
                    "<div class='span4'>" +
                        "<h3>TESTER SINCE</h3>" +
                        "<p>" +
                            "{{testerSince}}" +
                        "</p>" +
                    "</div>" +
                    "<div class='span5 offset3'>" +
                        "<h3>CURRENT TESTS</h3>" +
                        "<p>" +
                            "{{participationCount}}" +
                        "</p>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>";

    var path,
        query,
        projection,
        orderBy,
        matchedSurveys,
        request = {},
         actionInProgress = {},
          participantDetails = [],
        fetchedTesterData = false,
        draftedUserDetails = [],
        draftInProgress = false,
        activitySurveyIds = [],
        activitySurveysSubmittedByTester = {},
        weartestMode = $routeParams['mode'],
        weartestId = $routeParams['itemId'],
        tabNameToRetunTo = {
            current: 'My Current Tests',
            draft: 'Draft Tests',
            closed: 'Closed Tests'
        },
        tooltipTemplatePerUser = {},
        tagRecords = [],
        draftedTesters = [],
        updateDraftTesterData = false,
        testersSearchData = [];

    $scope.usersToDraft = [];

    $scope.weartest = {};

    $scope.surveys = [];

    $scope.selectedSurvey = {
        survey: null
    };

    $scope.showMore = false;

    $scope.loadingTesterUsers = true;

    $scope.filters = {};

    $scope.weightMin = 40;

    $scope.userLimit = 40;

    $scope.rows = [];

    $scope.customStrictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
        dialogClass: 'modal surveyBuilder wider'
    };

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    $scope.showTesterInfoModal = false;

    $scope.selectedTester = {};

    //Keeps track of the active tab in tester info modal
    //By default, the bio tab is active
    $scope.testerProfileActiveTab = 'bio';

    $scope.submittedSurvey = {};

    //Can only view surveys submitted by testers
    $scope.canEditSurvey = false;

    $scope.tags = {
        brandCreated: [],
        selectedTestersTags: [],
        brandSelected: '',
        updateRequired: false
    };

    $scope.showAddTagModal = false;

    $scope.bulkAddTagInput = '';

    $scope.bulkAddTagInput = '';

    $scope.bulkTagUpdateInProgress = false;

    $scope.tagsLoaded = false;

    var getUserFullName = function (tester) {
        var fullName = '';

        if (tester) {
            if (tester.fname) {
                fullName += tester.fname;
            }

            if (tester.lname) {
                if (fullName.length > 0) {
                    fullName += ' ';
                }

                fullName += tester.lname;
            }
        }

        return fullName;
    };

    //Calculates age from date
    var dateToAge = function (dateString) {
        //Get date in numeric representation
        var birthday = +new Date(dateString);

        //Divide today - birthday and divide by the number of millis in one year
        return ~~((Date.now() - birthday) / (31557600000));
    };

    //See https://github.com/angular-ui/bootstrap/issues/662
    var getActivities = function (tester) {
        var resultingHtml = '',
            capitalize = $filter('capitalize'),
            i;

        for (i = 0; i < tester.summer.length; i++) {
            resultingHtml += '<li>' + capitalize(tester.summer[i]) + '</li>';
        }

        for (i = 0; i < tester.winter.length; i++) {
            resultingHtml += '<li>' + capitalize(tester.winter[i]) + '</li>';
        }

        return resultingHtml;
    };

    //Replaces data bindings with actual values
    var compileTemplate = function (template, replaceWith) {
        var reg = "",
            key;

        for (key in replaceWith) {
            if (replaceWith.hasOwnProperty(key)) {
                if (replaceWith[key] === null || replaceWith[key] === undefined) {
                    replaceWith[key] = "";
                }

                reg = new RegExp("{{" + key + "}}", "g");

                template = template.replace(reg, replaceWith[key]);
            }
        }

        return template;
    };

    var getTesterSurveyInfo = function (callback) {
        var existingTesterSurveyDetails,
            path,
            query,
            projection,
            i;

        existingTesterSurveyDetails = activitySurveysSubmittedByTester[$scope.selectedTester._id];

        if (existingTesterSurveyDetails) {
            callback(null, existingTesterSurveyDetails);

            return;
        }

        path = '/api/mesh01/surveys_submitted';

        if (activitySurveyIds.length === 0) {
            for (i = 0; i < $scope.surveys.length; i++) {
                activitySurveyIds.push($scope.surveys[i]._id);
            }
        }

        query = {
            'userId': $scope.selectedTester._id,
            'surveyId': {
                '$in': activitySurveyIds
            }
        };

        path += '?query=' + JSON.stringify(query);

        projection = {
            '_id': 1,
            'surveyId': 1,
            'surveyName': 1
        };

        path += '&projection=' + JSON.stringify(projection);

        $http.get(path)
            .success(function (results) {
                var i, j;

                if (angular.isArray(results)) {
                    notificationWindow.show('Details of tester retrieved successfully', false);

                    //Strangely, the submitted surveys do not have their name store.
                    //Identify the name of the survey
                    for (i = 0; i < results.length; i++) {
                        for (j = 0; j < $scope.surveys.length; j++) {
                            if ($scope.surveys[j]._id === results[i].surveyId) {
                                results[i].name = $scope.surveys[j].name;

                                break;
                            }
                        }
                    }

                    callback(null, results);
                } else {
                    callback(new Error('Error. Could not retrieve survey details of the tester'));
                }
            })
            .error(function (err) {
                console.log(err);

                callback(new Error('Error. Could not retrieve survey details of the tester'));
            });
    };

    var getTesterProfileInfo = function (callback) {
        var path,
            projection;

        path = '/api/mesh01/users/' + $scope.selectedTester._id;

        projection = {
            '_id': 1,
            'profession': 1,
            'legPreference': 1,
            'armPreference': 1,
            'shoeWidthStr': 1,
            'runningShoeSize': 1,
            'sleeveLength': 1,
            'shirtSize': 1,
            'neckMeasurement': 1,
            'chestMeasurement': 1,
            'bicepMeasurement': 1,
            'thighMeasurement': 1,
            'favoriteQuote': 1,
            'favoriteMemory': 1,
            'shoulderMeasurement': 1
        };

        if ($scope.selectedTester.gender === 'female') {
            projection['underBustMeasurement'] = 1;
            projection['seatMeasurement'] = 1;
        }

        path += '?projection=' + JSON.stringify(projection);

        $http.get(path)
            .success(function (result) {
                if (result._id === $scope.selectedTester._id) {
                    callback(null, result);
                } else {
                    callback(new Error('Error. Could not retrieve profile details of tester'));
                }
            })
            .error(function (err) {
                console.log(err);

                callback(new Error('Error. Could not retrieve profile details of tester'));
            });
    };

    var getTesterJoinedDate = function (tester) {
        return $filter('UTCDate')(tester.createdDate, 'MM/dd/yy');
    };

    var getWeartestsForTester = function (userId, weartestStatus, callback) {
        var path = '/api/mesh01/weartest',
            projection = {
                'name': 1,
                'participants': 1
            },
            query = {
                'participants.userIdkey': userId,
                'participants.status': 'on team',
                'status': weartestStatus
            };

        path += '?query=' + JSON.stringify(query);

        path += '&projection=' + JSON.stringify(projection);

        $http.get(path)
            .success(function (results) {
                var filteredResults = [];

                if (angular.isArray(results)) {
                    //Filter the ones where the user is actually on team
                    filteredResults = results.filter(function (w) {
                        for (var i = 0; i < w.participants.length; i++) {
                            if (w.participants[i].userIdkey === userId && w.participants[i].status === 'on team') {
                                return true;
                            }
                        }

                        return false;
                    });

                    callback(null, filteredResults);
                } else {
                    callback(new Error('Error. Could not get weartests for tester'));
                }
            })
            .error(function (err) {
                callback(new Error('Error. Could not get weartests for tester'));
            });
    };

    var getTesterTags = function () {
        $scope.tags.selectedTesterTags = [];

        notificationWindow.show('Fetching tags associated with tester', true);

        $http.get('/api/misc/tags/' + $scope.selectedTester._id)
            .success(function (results) {
                if (angular.isArray(results)) {
                    notificationWindow.show('Tags retrieved successfully', false);
                    $scope.tags.selectedTesterTags = results;
                    $scope.newTag = '';
                } else {
                    notificationWindow.show('Error getting tags for tester', false);
                }
            })
            .error(function (results) {
                notificationWindow.show('Error getting tags for tester', false);
            });
    };

    //Get tags created by brand
    var getTagsInfo = function (refresh) {
        tagRecords = [];

        $scope.tags.brandCreated = [];
        $scope.tagsLoaded = false;

        if (refresh) {
            notificationWindow.show('Tag information updated. Getting latest tag info..', true);
        }

        $http.get('/api/misc/tags')
            .success(function (result) {
                if (angular.isObject(result)) {
                    $scope.tags.brandCreated = result.tags;
                    $scope.tagsLoaded = true;
                    tagRecords = result.tagRecords;

                    if (refresh) {
                        notificationWindow.show('Latest tag information received. Updating search results...', false);
                        $scope.filterBasedOnTags(false);
                    }
                } else {
                    notificationWindow.show('Error getting tags created by you', false);
                }
            })
            .error(function (err) {
                notificationWindow.show('Error getting tags created by you', false);
            });
    };

    path = '/api/mesh01/weartest/' + weartestId;

    projection = {
        '_id': 1,
        'brand': 1,
        'name': 1,
        'wearTestStartDate': 1,
        'wearTestEndDate': 1,
        'participants': 1
    };

    path += '?projection=' + JSON.stringify(projection);

    $http.get(path)
        .success(function (result) {
            if (result._id === weartestId) {
                $scope.weartest = result;
            } else {
                notificationWindow.show('Error. Could not retrieve product test details', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error. Could not retrieve product test details', false);
        });

    path = '/api/mesh01/surveys';

    query = {
        'type': 'Activity',
        'questions': {
            '$not': {
                '$size': 0
            }
        }
    };

    path += '?query=' + JSON.stringify(query);

    orderBy = {
        'activity': 1
    };

    path += '&orderBy=' + JSON.stringify(orderBy);

    projection = {
        '_id': 1,
        'activity': 1,
        'questions': 1,
        'name': 1
    };

    path += '&projection=' + JSON.stringify(projection);

    $http.get(path)
        .success(function (results) {
            if (angular.isArray(results)) {
                $scope.surveys = results;
            } else {
                notificationWindow.show('Error. Could not retrieve the activity surveys', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error. Could not retrieve the activity surveys', false);
        });

    //Init countries combo
    $http.get('/js/static-data.json')
        .success(function (data) {

            $scope.countries = data.countries;

            //init slider values
            $scope.filters = {
                ageMin: data.ageMin,
                ageMax: data.ageMax,
                heightMin: data.heightMin,
                heightMax: data.heightMax,
                weightMin: data.weightMin,
                weightMax: data.weightMax,
                shoeMin: data.shoeMin,
                shoeMax: data.shoeMax,
                waistMin: data.waistMin,
                waistMax: data.waistMax,
                inseamMin: data.inseamMin,
                inseamMax: data.inseamMax,
                testerName: ''
            };

            $scope.filters.gloveSizes = [
                { name: 'XXS', checked: false },
                { name: 'XS', checked: false },
                { name: 'S', checked: false },
                { name: 'M', checked: false },
                { name: 'L', checked: false },
                { name: 'XL', checked: false },
                { name: 'XXL', checked: false },
                { name: 'XXXL', checked: false }
            ];

            $scope.filters.jacketSizes = [
                { name: 'XS', checked: false },
                { name: 'S', checked: false },
                { name: 'M', checked: false },
                { name: 'L', checked: false },
                { name: 'XL', checked: false },
                { name: '2XL', checked: false },
                { name: '3XL', checked: false },
                { name: '4XL', checked: false }
            ];

            $scope.filters.shoeWidthStrs = [
                { name: 'AA', checked: false },
                { name: 'A', checked: false },
                { name: 'B', checked: false },
                { name: 'C', checked: false },
                { name: 'D', checked: false },
                { name: 'E', checked: false },
                { name: 'EE', checked: false },
                { name: 'EEE', checked: false },
                { name: 'EEEE', checked: false }
            ];

            $scope.filters.gender = 'both';

            //init counters
            $scope.filters.count = {
                drafted: 0,
                confirmed: 0,
                onTeam: 0,
                invited: 0,
                total: 0
            };

            //Display values
            $scope.ageMinDisplay = data.ageMin;
            $scope.ageMaxDisplay = data.ageMax;
            $scope.heightMinDisplay = data.heightMin;
            $scope.heightMaxDisplay = data.heightMax;
            $scope.weightMinDisplay = data.weightMin;
            $scope.weightMaxDisplay = data.weightMax;
            $scope.shoeMinDisplay = data.shoeMin;
            $scope.shoeMaxDisplay = data.shoeMax;
            $scope.waistMinDisplay = data.waistMin;
            $scope.waistMaxDisplay = data.waistMax;
            $scope.inseamMinDisplay = data.inseamMin;
            $scope.inseamMaxDisplay = data.inseamMax;
            //calculate centers
            $scope.ageCenter = parseInt((data.ageMax - data.ageMin) / 2) + parseInt(data.ageMin);
            $scope.weightCenter = parseInt((data.weightMax - data.weightMin) / 2) + parseInt(data.weightMin);
            $scope.heightCenter = parseInt((data.heightMax - data.heightMin) / 2) + parseInt(data.heightMin);
            $scope.shoeCenter = parseInt((data.shoeMax - data.shoeMin) / 2) + parseInt(data.shoeMin);
            $scope.waistCenter = parseInt((data.waistMax - data.waistMin) / 2) + parseInt(data.waistMin);
            $scope.inseamCenter = parseInt((data.inseamMax - data.inseamMin) / 2) + parseInt(data.inseamMin);
        });

    $scope.getCurrentMode = function () {
        return weartestMode;
    };

    $scope.getNameOfTabToReturnTo = function () {
        return tabNameToRetunTo[weartestMode];
    };

    $scope.getUrlOfTabToReturnTo = function () {
        return '/dashboard/weartests/' + weartestMode;
    };

    $scope.toggleIsSelected = function (question) {
        question.isSelected = true;
    };

    $scope.toggleShowMore = function () {
        $scope.showMore = !$scope.showMore;
    };

    //Resets all survey criteria
    $scope.resetSurveyCriteria = function () {
        $scope.resetTestUserSearch();

        var i, j;


        if ($scope.selectedSurvey && $scope.selectedSurvey.survey) {
            for (i = 0; i < $scope.selectedSurvey.survey.questions.length; i++) {
                $scope.selectedSurvey.survey.questions[i].isSelected = false;

                if ($scope.selectedSurvey.survey.questions[i].type === 'Single Selection') {
                    delete $scope.selectedSurvey.survey.questions[i].questionValue;
                } else if ($scope.selectedSurvey.survey.questions[i].type === 'Numeric') {
                    delete $scope.selectedSurvey.survey.questions[i].minValue;

                    delete $scope.selectedSurvey.survey.questions[i].maxValue;
                } else if ($scope.selectedSurvey.survey.questions[i].type === 'Multiple Selection') {
                    for (j = 0; j < $scope.selectedSurvey.survey.questions[i].options.values.length; j++) {
                        $scope.selectedSurvey.survey.questions[i].options.values[j].checked = false;
                    }
                }
            }
        }
    };

    $scope.resetBioFilter = function () {
        $scope.resetTestUserSearch();
        $scope.filters.ageMin = $scope.ageMinDisplay;
        $scope.filters.ageMax = $scope.ageMaxDisplay;
        $scope.filters.heightMin = $scope.heightMinDisplay;
        $scope.filters.heightMax = $scope.heightMaxDisplay;
        $scope.filters.weightMin = $scope.weightMinDisplay;
        $scope.filters.weightMax = $scope.weightMaxDisplay;
        $scope.filters.shoeMin = $scope.shoeMinDisplay;
        $scope.filters.shoeMax = $scope.shoeMaxDisplay;
        $scope.filters.waistMin = $scope.waistMinDisplay;
        $scope.filters.waistMax = $scope.waistMaxDisplay;
        $scope.filters.inseamMin = $scope.inseamMinDisplay;
        $scope.filters.inseamMax = $scope.inseamMaxDisplay;


        $scope.filters.gloveSizes = [
            { name: 'XXS', checked: false },
            { name: 'XS', checked: false },
            { name: 'S', checked: false },
            { name: 'M', checked: false },
            { name: 'L', checked: false },
            { name: 'XL', checked: false },
            { name: 'XXL', checked: false },
            { name: 'XXXL', checked: false }
        ];

        $scope.filters.jacketSizes = [
            { name: 'XS', checked: false },
            { name: 'S', checked: false },
            { name: 'M', checked: false },
            { name: 'L', checked: false },
            { name: 'XL', checked: false },
            { name: '2XL', checked: false },
            { name: '3XL', checked: false },
            { name: '4XL', checked: false }
        ];

        $scope.filters.shoeWidthStrs = [
            { name: 'AA', checked: false },
            { name: 'A', checked: false },
            { name: 'B', checked: false },
            { name: 'C', checked: false },
            { name: 'D', checked: false },
            { name: 'E', checked: false },
            { name: 'EE', checked: false },
            { name: 'EEE', checked: false },
            { name: 'EEEE', checked: false }
        ];
        
        $scope.filters.gender = 'both';
        $scope.filters.country = 'Any';
    };

    $scope.increaseUserLimit = function () {
        if ($scope.userLimit > $scope.rows.length) {
            return;
        }

        $scope.userLimit = $scope.userLimit + 40;
    };

    //Search by criteria
    $scope.search = function (defaultCriteria) {
        $scope.resetTestUserSearch();

        var query = {
            utype: 'Tester',
            gender: {
                $exists: true,
                $nin: [null, '']
            },
            shoeSize: {
                $exists: true,
                $nin: [null, '']
            },
            waistMeasurement: {
                $exists: true,
                $nin: [null, '']
            },
            weight: {
                $exists: true,
                $nin: [null, '']
            },
            height: {
                $exists: true,
                $nin: [null, ]
            },
            inseamLength: {
                $exists: true,
                $nin: [null, '']
            },
            dateOfBirth: {
                $exists: true,
                $nin: [null, '']
            }
        },
            projection = {
                '_id': 1,
                'username': 1,
                'user_imageset': 1,
                'fname': 1,
                'lname': 1,
                'gender': 1,
                'dateOfBirth': 1,
                'address': 1,
                'height': 1,
                'weight': 1,
                'winter': 1,
                'summer': 1,
                'shoeSize': 1,
                'shoeWidthStr': 1,
                'gloveSize': 1,
                'waistMeasurement': 1,
                'inseamLength': 1,
                'jacketSize': 1,
                'aboutMe': 1,
                'createdDate': 1,
                'email': 1
            },
            orderBy = {
                'fname': 1
            },
            path,
            i;

        draftedTesters = [];

        $scope.rows = [];

        updateDraftTesterData = false;

        //If matched surveys, look for matched id
        if (matchedSurveys) {
            query._id = {
                $in: []
            };

            for (i = 0; i < matchedSurveys.length; i++) {
                query._id.$in.push(matchedSurveys[i].userId);
            }
        } else if ($scope.selectedSurvey.survey !== null && !angular.isUndefined($scope.selectedSurvey.survey.activity)) {
            query.$or =
                [
                    {
                        activity: {
                            $elemMatch: {
                                surveyId: $scope.selectedSurvey.survey._id
                            }
                        }
                    },
                    {
                        summer: $scope.selectedSurvey.survey.activity
                    },
                    {
                        winter: $scope.selectedSurvey.survey.activity
                    }
                ];
        } else {
            delete query.activity;
            updateDraftTesterData = true;
        }

        path = '/api/feature/draft';

        path += '?query=' + JSON.stringify(query);

        path += '&projection=' + JSON.stringify(projection);

        path += '&orderBy=' + JSON.stringify(orderBy);

        $scope.loadingDCTesterUsers = true;

        if (defaultCriteria) {
            notificationWindow.show('Searching for testers based on default criteria...', true);
        } else {
            notificationWindow.show('Searching for testers based on selected criteria...', true);
        }

        $http.get(path)
            .success(function (results) {
                var found,
                    i, j;

                if (angular.isArray(results)) {
                    var rows = [];

                    //Filter already drafted iterating on weartest participants
                    for (i = 0; i < results.length; i++) {
                        found = false;

                        //Check on participants who has already been drafted
                        for (j = 0; j < $scope.weartest.participants.length; j++) {
                            // Right now is not possible to assign the id when the participant is added
                            if (results[i].username === $scope.weartest.participants[j].username && $scope.weartest.participants[j].status !== 'removed') {
                                results[i].status = $scope.weartest.participants[j].status;
                            }
                        }
                        rows.push(results[i]);

                    }

                    if (rows.length > 0) {
                        //Save the original search result in another array
                        //Thus, if brand user resets the tag search, you can get the original
                        //results back
                        draftedTesters = rows;

                        //Save only default criteria data for tester name search
                        if(updateDraftTesterData) {
                            testersSearchData = rows;
                        }

                        $scope.loadingDCTesterUsers = false;

                        $scope.filterBasedOnTags(true);

                        notificationWindow.show('Found testers that match the selection criteria', false);
                    } else {
                        notificationWindow.show('No testers match the selected criteria', false);
                    }
                } else {
                    notificationWindow.show('Error. Could not retrieve the testers based on selected criteria', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve the testers based on selected criteria', false);
            });
    };

    //Get survey criteria ids
    $scope.setSurveyCriteria = function () {
        $scope.resetTestUserSearch();

        var path = '/api/mesh01/surveys_submitted',
            query = {
                $and: []
            },
            question,
            answers,
            projection,
            i, j;


        // for each question
        for (i = 0; i < $scope.selectedSurvey.survey.questions.length; i++) {
            question = $scope.selectedSurvey.survey.questions[i];

            if (question.isSelected) {
                if (question.type === 'Single Selection') {
                    //Add single select to criteria
                    answers = {
                        answers: {
                            $elemMatch: {
                                questionId: question._id,
                                value: question.questionValue.value
                            }
                        }
                    };

                    query.$and.push(answers);
                } else if (question.type === 'Multiple Selection') {
                    //Add multiple select to criteria
                    answers = {
                        answers: {
                            $elemMatch: {
                                questionId: question._id,
                                valueArray: {
                                    $in: []
                                }
                            }
                        }
                    };

                    for (j = 0; j < question.options.values.length; j++) {
                        if (question.options.values[j].checked === true) {
                            answers.answers.$elemMatch.valueArray.$in.push(question.options.values[j].value);
                        }
                    }

                    query.$and.push(answers);
                } else if (question.type === 'Numeric') {
                    //Add numeric to criteria
                    answers = {
                        answers: {
                            $elemMatch: {
                                questionId: question._id,
                                value: {}
                            }
                        }
                    };

                    //Set minvalue
                    if (question.minValue !== null && !angular.isUndefined(question.minValue)) {
                        answers.answers.$elemMatch.value.$gte = question.minValue;
                    }

                    //Set max value
                    if (question.maxValue !== null && !angular.isUndefined(question.maxValue)) {
                        answers.answers.$elemMatch.value.$lte = question.maxValue;
                    }

                    //Only add if at least one value defined
                    if ((question.minValue !== null && !angular.isUndefined(question.minValue)) ||
                      (question.maxValue !== null && !angular.isUndefined(question.maxValue))) {
                        query.$and.push(answers);
                    }
                }
            }
        }

        //Delete query if empty
        if (query.$and.length === 0) {
            matchedSurveys = undefined;

            $scope.search();
        } else {
            path += '?query=' + JSON.stringify(query);

            projection = {
                '_id': 1,
                'userId': 1
            };

            path += '&projection=' + JSON.stringify(projection);

            notificationWindow.show('Retrieving submitted surveys that match the criteria set...', true);

            //Apply the criteria
            $http.get(path)
                .success(function (results) {
                    if (angular.isArray(results)) {
                        matchedSurveys = results;

                        $scope.search();
                    } else {
                        notificationWindow.show('Error. Could not retrieve the details of testers that submitted the selected survey', false);
                    }
                }).error(function (err) {
                    console.log(err);

                    notificationWindow.show('Error. Could not retrieve the details of testers that submitted the selected survey', false);
                });
        }
    };

    // returns tooltip orientation
    $scope.getTooltipOrientation = function (index) {
        if (index % 4 === 0) {
            return 'right';
        } else if (index % 4 === 3) {
            return 'left';
        } else if (index === 1 || index === 2) {
            return 'bottom';
        } else {
            return 'top';
        }
    };

    //Render the tooltip
    $scope.renderTooltip = function (tester) {
        var result = tooltipTemplatePerUser[tester._id];

        if (result) {
            //Already rendered earlier
            return;
        }

        var payload = {
            aboutMe: $filter('truncate')(tester.aboutMe, 100),
            gloveSize: (tester.gloveSize) ? tester.gloveSize.toUpperCase() : '',
            weight: tester.weight,
            inseam: tester.inseamLength,
            jacketSize: (tester.jacketSize) ? tester.jacketSize.toUpperCase() : '',
            height: $filter('inchesToFeetAndInches')(tester.height),
            waist: tester.waistMeasurement,
            shoeSize: tester.shoeSize,
            cityAndState: $filter('getCityStateAddress')(tester),
            fullName: getUserFullName(tester),
            username: tester.username,
            gender: tester.gender,
            age: dateToAge(tester.dateOfBirth),
            activitiyList: getActivities(tester),
            testerSince: getTesterJoinedDate(tester),
            participationCount: tester.participationCount
        };

        //Only on team users can have their full name shown
        if (tester.status !== 'on team') {
            payload.fullName = '';
        }

        tooltipTemplatePerUser[tester._id] = compileTemplate(tooltipTemplateForParticipants, payload);
    };

    $scope.getTooltipTemplateForUser = function (tester) {
        var result = tooltipTemplatePerUser[tester._id];

        if (!result) {
            result = '';
        }

        return result;
    };

    //Draft selected testers
    $scope.draftSelectedTesters = function () {
        var selectedTesters = [],
            testerToDraft,
            path,
            i;

        //Get the drafted participants
        for (i = 0; i < $scope.rows.length; i++) {
            //If selected, push to selected testers
            //Since testers that are already part of the weartest can be selected (for tagging),
            //ensure that they are not accidentally drafted
            if ($scope.rows[i].selected === true && !$scope.rows[i].status) {
                selectedTesters.push($scope.rows[i]);
            }
        }

        if (selectedTesters.length === 0) {
            notificationWindow.show('Select testers to draft', false);

            return;
        }

        if (draftInProgress) {
            return;
        }

        draftInProgress = true;

        //Build the participants
        for (i = 0; i < selectedTesters.length; i++) {
            testerToDraft = {
                username: selectedTesters[i].username,
                userIdkey: selectedTesters[i]._id,
                status: 'drafted'
            };

            $scope.weartest.participants.push(testerToDraft);
        }

        path = '/api/mesh01/weartest/' + $scope.weartest._id;

        notificationWindow.show('Drafting selected testers...', true);

        $http.put(path, $scope.weartest)
            .success(function (result) {
                if (result._id === $scope.weartest._id) {
                    $scope.weartest = result;

                    notificationWindow.show("Selected users drafted successfully. You can see the drafted users in the product test's participant roster. Refreshing existing results to reflect drafted users", true);

                    $timeout($scope.search, 5000);
                } else {
                    notificationWindow.show('Error. Could not draft the selected users', false);
                }

                draftInProgress = false;
            }).error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not draft the selected users', false);

                draftInProgress = false;
            });
    };

    $scope.openTesterInfoModal = function (tester) {
        if (request.activitySurveysSubmittedByTester) {
            return;
        }

        request.activitySurveysSubmittedByTester = true;

        $scope.setActiveTab('bio');

        $scope.selectedTester = tester;

        notificationWindow.show('Retrieving details of tester...', true);

        async.parallel({
            testerDetails: getTesterProfileInfo,
            surveyDetails: getTesterSurveyInfo,
            activeWeartests: getWeartestsForTester.bind(null, tester._id, 'active'),
            inactiveWeartests: getWeartestsForTester.bind(null, tester._id, 'closed')
        },
        function (err, results) {
            if (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve tester details', false);
            } else {
                $scope.activitySurveysSubmittedByTester = results.surveyDetails;

                activitySurveysSubmittedByTester[$scope.selectedTester._id] = results.surveyDetails;

                angular.extend($scope.selectedTester, results.testerDetails);

                $scope.selectedTester.activeWeartests = results.activeWeartests;
                $scope.selectedTester.inactiveWeartests = results.inactiveWeartests;

                //Show the tester info modal after fetching the activity surveys submitted by tester
                $scope.showTesterInfoModal = true;

                notificationWindow.show('Tester details retrieved successfully', false);
            }

            request.activitySurveysSubmittedByTester = false;
        });
    };

    $scope.closeTesterInfoModal = function () {
        if ($scope.tags.updateRequired) {
            $scope.tags.updateRequired = false;

            getTagsInfo(true);
        }

        $scope.showTesterInfoModal = false;

        $scope.selectedTester = {};

        $scope.activitySurveysSubmittedByTester = {};

        $scope.submittedSurvey = {};

        $scope.setActiveTab('bio');
    };

    //Set the active tab
    $scope.setActiveTab = function (tabName) {
        $scope.testerProfileActiveTab = tabName;

        if (tabName === 'tags') {
            getTesterTags();
        }
    };

    //Check if the passed tab is the active tab
    $scope.isTabActive = function (tabName) {
        return $scope.testerProfileActiveTab === tabName;
    };

    $scope.viewSurvey = function (surveyDetails) {
        var path,
            projection;

        path = '/api/mesh01/surveys_submitted/' + surveyDetails._id;

        projection = {
            '_id': 1,
            'answers': 1
        };

        path += '?projection=' + JSON.stringify(projection);

        notificationWindow.show('Retrieving information on the submitted survey...', true);

        $http.get(path)
            .success(function (result) {
                if (result._id === surveyDetails._id) {
                    angular.extend(surveyDetails, result);

                    $scope.submittedSurvey = surveyDetails;

                    notificationWindow.show('Information on submitted survey successfully retrieved', false);

                    $scope.setActiveTab('survey');
                } else {
                    notificationWindow.show('Error. Could not retrieve details of the submitted survey', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve details of the submitted survey', false);
            });
    };

    $scope.updateTesterTag = function (tag, action) {
        var index = $scope.tags.selectedTesterTags.indexOf(tag),
            tags = $scope.tags.selectedTesterTags.slice(0);

        if (!tag) {
            notificationWindow.show('No changes detected. Save aborted.', false);
            return;
        }

        if (action === 'delete') {
            if (index !== -1) {
                tags.splice(index, 1);
            } else {
                notificationWindow.show('No changes detected. Save aborted.', false);
                return;
            }
        } else if (action ==='add') {
            if (index === -1) {
                tags.push(tag);
            } else {
                notificationWindow.show('No changes detected. Save aborted.', false);
                return;
            }
        } else {
            notificationWindow.show('No changes detected. Save aborted.', false);
            return;
        }

        notificationWindow.show('Updating tags...', true);

        $http.put('/api/misc/tags/' + $scope.selectedTester._id, tags)
            .success(function (results) {
                if (results.length === tags.length) {
                    $scope.tags.selectedTesterTags = results;
                    $scope.newTag = '';
                    //Clear the input because jquery UI may not keep the model in sync
                    angular.element('.tag-input').val('');

                    $scope.tags.updateRequired = true;

                    notificationWindow.show('Tags updated successfully.', false);
                } else {
                    notificationWindow.show('Error. Could not update tags for tester.', false);
                }
            })
            .error(function (err) {
                notificationWindow.show('Error. Could not update tags for tester.', false);
            });
    };

    $scope.filterBasedOnTags = function (invokedFromSearch) {
        $scope.resetTestUserSearch();
        var testersSatisfyingTag = [],
            i;


        $scope.rows = [];

        if (!$scope.tags.brandSelected) {
            $scope.rows = draftedTesters;

            return;
        }

        for (i = 0; i < tagRecords.length; i++) {
            if (tagRecords[i].tags.indexOf($scope.tags.brandSelected) !== -1) {
                testersSatisfyingTag.push(tagRecords[i].testerUserId);
            }
        }

        for (i = 0; i < draftedTesters.length; i++) {
            if (testersSatisfyingTag.indexOf(draftedTesters[i]._id) !== -1) {
                $scope.rows.push(draftedTesters[i]);
            }
        }

        if (!invokedFromSearch) {
            if ($scope.rows.length > 0) {
                notificationWindow.show('Found testers that match the selection criteria', false);
            } else {
                notificationWindow.show('No testers match the selected criteria', false);
            }
        }
    };

    $scope.openAddTagModal = function () {
        var selectedTesters = [],
            i;

        //Get the drafted participants
        for (i = 0; i < $scope.rows.length; i++) {
            //If selected, push to selected testers
            if($scope.rows[i].selected === true) {
                selectedTesters.push($scope.rows[i]);
            }
        }

        if (selectedTesters.length === 0) {
            notificationWindow.show('Select testers to tag', false);

            return;
        }

        $scope.bulkAddTagInput = '';

        $scope.showAddTagModal = true;
    };

    $scope.bulkAddTags = function () {
        var selectedTesters = [],
            payload,
            i;

        if ($scope.bulkTagUpdateInProgress) {
            return;
        }

        $scope.bulkTagUpdateInProgress = true;

        //Get the drafted participants
        for (i = 0; i < $scope.rows.length; i++) {
            //If selected, push to selected testers
            if($scope.rows[i].selected === true) {
                selectedTesters.push($scope.rows[i]._id);
            }
        }

        if (selectedTesters.length === 0) {
            notificationWindow.show('Select testers to tag', false);

            return;
        } else if ($scope.bulkAddTagInput === '') {
            notificationWindow.show('Enter a tag', false);

            return;
        }

        payload = {
            testerIds: selectedTesters,
            tag: $scope.bulkAddTagInput
        };

        notificationWindow.show('Updating tags. This may take a while depending on the number of testers selected...', true);

        $http.put('/api/misc/bulk/tags', payload)
            .success(function () {
                notificationWindow.show('Tags updated successfully.', false);
                $scope.bulkAddTagInput = '';
                //Clear the input because jquery UI may not keep the model in sync
                angular.element('.tag-input').val('');

                $scope.bulkTagUpdateInProgress = false;

                $scope.tags.updateRequired = true;

                $scope.closeAddTagModal();
            })
            .error(function (err) {
                notificationWindow.show('Error. Could not update tags for selected testers', false);
                $scope.bulkTagUpdateInProgress = false;
            });
    };

    $scope.closeAddTagModal = function () {
        if ($scope.tags.updateRequired) {
            $scope.tags.updateRequired = false;

            getTagsInfo(true);
        }

        $scope.showAddTagModal = false;
    };

    $scope.selectAllTesters = function (event) {
        var checkbox = event.target,
            checked = checkbox.checked,
            i;

        if (checked) {
            for (i = 0; i < $scope.rows.length; i++) {
                $scope.rows[i].selected = true;
            }
        } else {
            for (i = 0; i < $scope.rows.length; i++) {
                $scope.rows[i].selected = false;
            }
        }
    };

    //Add tester region starts
    //Fetch all testers
    var getAllTesters = function () {
        var path = '/api/mesh01/users',
            query = {
                'utype': 'Tester'
            },
            projection = {
                '_id': 1,
                'summer': 1,
                'winter': 1,
                'fname': 1,
                'lname': 1,
                'username': 1,
                'gender': 1,
                'dateOfBirth': 1,
                'height': 1,
                'weight': 1,
                'address': 1,
                'shoeSize': 1,
                'shirtSize': 1,
                'jacketSize': 1,
                'waistMeasurement': 1,
                'inseamLength': 1,
                'aboutMe': 1,
                'user_imageset': 1,
                'email': 1,
                'gloveSize': 1,
                'mobilePhone': 1,
                'sortOrder': 1,
            };

        if (fetchedTesterData) {
            return;
        }

        $scope.testerUsers = testerUsersStorage.getTesters();

        if ($scope.testerUsers.length > 0) {
            $scope.loadingTesterUsers = false;

            fetchedTesterData = true;

            return;
        }

        $scope.loadingTesterUsers = true;

        notificationWindow.show('Initializing tester data. This will take some time. Kindly wait.', true);

        path += '?query=' + JSON.stringify(query);

        path += '&projection=' + JSON.stringify(projection);

        $http.get(path)
            .success(function (results) {
                if (angular.isArray(results)) {
                    $scope.testerUsers = results;

                    notificationWindow.show('Tester initialization complete. Please proceed.', false);

                    $scope.loadingTesterUsers = false;

                    fetchedTesterData = true;

                    testerUsersStorage.storeTesters(results);
                } else {
                    notificationWindow.show('Error while initializing tester data', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error while initializing tester data', false);
            });
    };

    $scope.resetDefaultFilter = function () {
        if(!$scope.filters.testerName) {
            $scope.resetBioFilter();
            $scope.resetSurveyCriteria();
            $scope.filterBasedOnTags(true);
            $scope.selectedSurvey.survey = null;
            $scope.tags.brandSelected = '';
            $scope.rows = testersSearchData;
            draftedTesters = testersSearchData;
        }
    };

    $scope.resetTestUserSearch = function () {
        $scope.filters.testerName = '';
    };

    $scope.getFormattedHeight = function (heightInInches) {
        var height = "";

        if (!heightInInches) {
            return height;
        }

        //Get the feet
        height = Math.floor(parseInt(heightInInches, 10) / 12).toString();
        height = height + "' ";

        //Get the inches
        height = height + (parseInt(heightInInches, 10) % 12).toString();
        height = height + '"';

        return height;
    };

    $scope.getAgeFromBirthday = function (dateOfBirth) {
        //http://stackoverflow.com/a/15555947

        if (!dateOfBirth) {
            return;
        }

        dateOfBirth = +new Date(dateOfBirth);

        return ~~((Date.now() - dateOfBirth) / (31557600000));
    };

    $scope.getUserFullName = function (tester) {
        var fullName = '',
            testerDetails,
            i;

        if (tester) {
            if (tester.userIdkey) {
                for (i = 0; i < participantDetails.length; i++) {
                    if (participantDetails[i]._id === tester.userIdkey) {
                        testerDetails = participantDetails[i];
                    }
                }
            } else {
                testerDetails = tester;
            }

            if (!testerDetails) {
                return;
            }

            if (testerDetails.fname) {
                fullName += testerDetails.fname;
            }

            if (testerDetails.lname) {
                if (fullName.length > 0) {
                    fullName += ' ';
                }

                fullName += testerDetails.lname;
            }
        }

        return fullName;
    };

    $scope.isTesterAParticipant = function (userId) {
        var user,
            i;

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            user = $scope.weartest.participants[i];

            if (user.userIdkey == userId) {
                return true;
            }
        }
        return false;
    };

    $scope.getStatusOfParticipant = function (userId) {
        var user,
            i;

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            user = $scope.weartest.participants[i];

            if (user.userIdkey == userId) {
                return user.status;
            }
        }
    };

    $scope.changeUserDraftingStatus = function (tester, event) {
        var checkbox = event.target,
            action = checkbox.checked ? 'add' : 'remove',
            i;

        if (action === 'add') {
            $scope.usersToDraft.push({
                username: tester.username,
                userIdkey: tester._id,
                status: 'drafted',
                testerStatusChangeDate: new Date()
            });

            draftedUserDetails.push(JSON.parse(JSON.stringify(tester)));
        } else {
            for (i = 0; i < $scope.usersToDraft.length; i++) {
                if ($scope.usersToDraft[i].userIdkey === tester._id) {
                    $scope.usersToDraft.splice(i, 1);
                    break;
                }
            }

            for (i = 0; i < draftedUserDetails.length; i++) {
                if (draftedUserDetails[i]._id === tester._id) {
                    draftedUserDetails.splice(i, 1);
                    break;
                }
            }
        }
    };

    $scope.getCity = function (address) {
        if (!address) {
            return;
        }

        if (address[0] && address[0].type === 'ship') {
            return address[0].city;
        } else if (address[1] && address[1].type === 'ship') {
            return address[1].city;
        }
    };

    $scope.getState = function (address) {
        if (!address) {
            return;
        }

        if (address[0] && address[0].type === 'ship') {
            return address[0].state;
        } else if (address[1] && address[1].type === 'ship') {
            return address[1].state;
        }
    };


    $scope.doesWeartestHaveParticipants = function () {
        var participants,
            i;

        if ($scope.weartest._id) {
            participants = $scope.weartest.participants;

            for (i = 0; i < participants.length; i++) {
                if (participants[i].status === $scope.participantFilter) {
                    return true;
                }
            }
        } else {
            //Optimistic until weartest data is fetched
            return true;
        }

        return false;
    };

    var updateWeartest = function (callback) {
        var path = '/api/mesh01/weartest/' + $scope.weartest._id;
        console.log($scope.weartest.participants);
        $http.put(path, $scope.weartest)
            .success(function (result) {
                if (result._id === $scope.weartest._id) {
                    notificationWindow.show('Product test updated successfully', false);

                    if (callback) {
                        callback();
                    }
                } else {
                    notificationWindow.show('Error updating product test', false);

                    if (callback) {
                        callback(new Error());
                    }
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error updating product test', false);

                if (callback) {
                    callback(err);
                }
            });
    };

    $scope.draftTesters = function () {
        if (actionInProgress['draft']) {
            return;
        }

        actionInProgress['draft'] = true;

        if ($scope.usersToDraft.length > 0) {
            $scope.weartest.participants = $scope.weartest.participants.concat($scope.usersToDraft);

            //Remember the details of the drafted participants
            participantDetails = participantDetails.concat(draftedUserDetails);
        }

        $scope.closeAddTesterModal();

        notificationWindow.show('Drafting selected testers...', true);

        updateWeartest(function(err) {
            if (err) {
                notificationWindow.show('Error drafting testers', false);

                actionInProgress['draft'] = false;
            } else {
                notificationWindow.show('Selected testers have been drafted. Refreshing to get latest data', false);

                //$location.search('participantFilter', 'drafted');

                actionInProgress['draft'] = false;

                console.log("reloading...");
                //$route.reload();
                $scope.search(true);
            }
        });
    };

    var openTesterStatusChangeModal = function () {
        $scope.showTesterStatusChangeModal = true;
    };

    $scope.executeAction = function () {
        switch ($scope.actionSelected) {
            case 1:
                //openInviteParticipantModal();
                //openInviteEmailParticipantModal();
                break;

            case 2:
                // openSendEmailModal();
                break;

            case 3:
                openTesterStatusChangeModal();
                break;

            case 4:
                $scope.openProductStatusModal(undefined, true);
                break;
        }
    };

    //Add tester region ends

    //Load default user list
    $scope.search(true);

    //Get the tags related information
    getTagsInfo(false);
}
]);
