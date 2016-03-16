dashboardApp.controller('TesterListCtrl', ['$scope', '$http', '$filter', 'notificationWindow', 'async',
function ($scope, $http, $filter, notificationWindow, async) {
    'use strict';

    //Any change carried out in this controller should also be copied over to the WeartestDraftCtrl controller

    var tooltipTemplateForParticipants = "" +
        "<div class='row-fluid'>" +
            "<div class='span4'>" +
                "<h3 class='left'>ACTIVITIES</h3>" +
                "<ul>" +
                    "{{activitiyList}}"+
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
                "<h3>TESTER SINCE</h3>" +
                "<p>" +
                    "{{testerSince}}" +
                "</p>" + 
            "</div>" +
        "</div>";

    var path,
        query,
        projection,
        orderBy,
        matchedSurveys,
        request = {},
        draftInProgress = false,
        activitySurveyIds = [],
        activitySurveysSubmittedByTester = {},
        tooltipTemplatePerUser = {},
        tagRecords = [],
        draftedTesters = [],
        updateDraftTesterData = false,
        testersSearchData = [];

    $scope.weartest = {};

    $scope.surveys = [];

    $scope.selectedSurvey = {
        survey: null
    };

    $scope.showMore = false;

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
                heightMin : data.heightMin,
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
            $scope.ageCenter = parseInt((data.ageMax - data.ageMin)/2) + parseInt(data.ageMin);
            $scope.weightCenter = parseInt((data.weightMax - data.weightMin)/2) + parseInt(data.weightMin);
            $scope.heightCenter = parseInt((data.heightMax - data.heightMin)/2) + parseInt(data.heightMin);
            $scope.shoeCenter = parseInt((data.shoeMax - data.shoeMin)/2) + parseInt(data.shoeMin);
            $scope.waistCenter = parseInt((data.waistMax - data.waistMin)/2) + parseInt(data.waistMin);
            $scope.inseamCenter = parseInt((data.inseamMax - data.inseamMin)/2) + parseInt(data.inseamMin);
    });

    $scope.toggleIsSelected = function (question) {
        question.isSelected = true;
    };

    $scope.toggleShowMore = function () {
        $scope.showMore = !$scope.showMore;
    };

    //Resets all survey criteria
    $scope.resetSurveyCriteria = function () {
        var i, j;

        if($scope.selectedSurvey && $scope.selectedSurvey.survey) {
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
            path,
            i;

        draftedTesters = [];

        $scope.rows = [];

        updateDraftTesterData = false;

        //If matched surveys, look for matched id
        if(matchedSurveys) {
            query._id = {
                $in: []
            };

            for (i = 0; i < matchedSurveys.length; i++) {
                query._id.$in.push(matchedSurveys[i].userId);
            }
        } else if($scope.selectedSurvey.survey !== null && !angular.isUndefined($scope.selectedSurvey.survey.activity)){
            query.$or =
                [
                    {
                        activity : {
                            $elemMatch: {
                                surveyId: $scope.selectedSurvey.survey._id
                            }
                        }
                    },
                    {
                        summer : $scope.selectedSurvey.survey.activity
                    },
                    {
                        winter: $scope.selectedSurvey.survey.activity
                    }
                ];
        } else {
            delete query.activity;
            updateDraftTesterData = true;
        }

        path = '/api/mesh01/users';

        path += '?query=' + JSON.stringify(query);

        path += '&projection=' + JSON.stringify(projection);

        $scope.loadingDCTesterUsers = true;

        if (defaultCriteria) {
            notificationWindow.show('Searching for testers based on default criteria...', true);
        } else {
            notificationWindow.show('Searching for testers based on selected criteria...', true);
        }

        $http.get(path)
            .success(function (results) {
                var found,
                    rows,
                    i, j;

                if (angular.isArray(results)) {
                    rows = results;

                    if (rows.length > 0) {
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
        var path = '/api/mesh01/surveys_submitted',
            query = {
                $and:[]
            },
            question,
            answers,
            projection,
            i, j;

        // for each question
        for(i=0; i< $scope.selectedSurvey.survey.questions.length;i++) {
            question = $scope.selectedSurvey.survey.questions[i];

            if(question.isSelected){
                if(question.type === 'Single Selection'){
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
                } else if (question.type === 'Multiple Selection'){
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
                        if(question.options.values[j].checked === true){
                            answers.answers.$elemMatch.valueArray.$in.push(question.options.values[j].value);
                        }
                    }

                    query.$and.push(answers);
                } else if (question.type === 'Numeric'){
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
                    if(question.minValue !== null && !angular.isUndefined(question.minValue)) {
                        answers.answers.$elemMatch.value.$gte = question.minValue;
                    }

                    //Set max value
                    if(question.maxValue !== null && !angular.isUndefined(question.maxValue)) {
                        answers.answers.$elemMatch.value.$lte = question.maxValue;
                    }

                    //Only add if at least one value defined
                    if((question.minValue !== null && !angular.isUndefined(question.minValue)) ||
                      (question.maxValue !== null && !angular.isUndefined(question.maxValue))) {
                        query.$and.push(answers);
                    }
                }
            }
        }

        //Delete query if empty
        if (query.$and.length === 0){
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
        if(index % 4 === 0){
            return 'right';
        }else if(index % 4 === 3){
            return 'left';
        }else if(index === 1 || index === 2){
            return 'bottom';
        }else{
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
            gloveSize: (tester.gloveSize)? tester.gloveSize.toUpperCase() : '',
            weight: tester.weight,
            inseam: tester.inseamLength,
            jacketSize: (tester.jacketSize)? tester.jacketSize.toUpperCase() : '',
            height: $filter('inchesToFeetAndInches')(tester.height),
            waist: tester.waistMeasurement,
            shoeSize: tester.shoeSize,
            cityAndState: $filter('getCityStateAddress')(tester),
            fullName: getUserFullName(tester),
            username: tester.username,
            gender: tester.gender,
            age: dateToAge(tester.dateOfBirth),
            activitiyList: getActivities(tester),
            testerSince: getTesterJoinedDate(tester)
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
            surveyDetails: getTesterSurveyInfo
        },
        function (err, results) {
            if (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve tester details', false);
            } else {
                $scope.activitySurveysSubmittedByTester = results.surveyDetails;

                activitySurveysSubmittedByTester[$scope.selectedTester._id] = results.surveyDetails;

                angular.extend($scope.selectedTester, results.testerDetails);

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

    //Load default user list
    $scope.search(true);

    //Get the tags related information
    getTagsInfo(false);
}
]);
