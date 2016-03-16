dashboardApp.controller('WeartestRosterCtrl', ['$scope', '$http', '$filter', '$location', '$route', '$routeParams', 'notificationWindow', 'downloadAsCSV', 'testerUsersStorage', 'imageHandler', 'async', 'loginState', 'splitRequest', 'activityLogCount', 'wearTestScorePolicy',
function ($scope, $http, $filter, $location, $route, $routeParams, notificationWindow, downloadAsCSV, testerUsersStorage, imageHandler, async, loginState, splitRequest, activityLogCount, wearTestScorePolicy) {
    'use strict';

    var selectedParticipants = [],
        weartestId = $routeParams['itemId'],
        path = '/api/mesh01/weartest/' + weartestId,
        mode = $routeParams['mode'],
        projection = {
            '_id': 1,
            'wearTestStartDate': 1,
            'wearTestEndDate': 1,
            'participants': 1,
            'productSurveys': 1,
            'availablePoints': 1,
            'frequencyActivityLog': 1,
            'performanceZonesDates': 1,
            'productWearAndTearDates': 1,
            'imageSetId': 1
        },
        fetchedTesterData = false,
        draftedUserDetails = [],
        participantDetails = [],
        actionInProgress = {},
        dataReadyForExport = false,
        testerForProductStatusChange = {},
        testerForKarmaChange = {},
        testerForNoteChange = {},
        tooltipTemplatesForUsers = {},
        testerProgressTooltipTemplate = {},
        bulkChangeInProductStatus,
        loadingParticipantDetails,
        templateForStatus = {
            'on team': 'ROSTER_ONTEAM_EMAIL_TEMPLATE',
            'team full': 'ROSTER_TESTFULL_EMAIL_TEMPLATE',
            'removed': 'ROSTER_REMOVED_EMAIL_TEMPLATE',
            'invited': 'ROSTER_INVITE_EMAIL_TEMPLATE'
        },
        currentUpdateCount = 0,
        rosterPredicate = 'testerStatus',
        columnsToShow = [],
        testerProgressDetails = {},
        i;

    //Template for tester details tooltip
    var tooltipTemplateForOnTeamParticipants = "<div class='row-fluid'>" +
                "<div class='span4'>" +
                    "<div class='thumb'>" +
                        "<img src='{{src}}' alt=''>" +
                    "</div>" +
                    "<h3 class='left'>ACTIVITIES</h3>" +
                    "<ul class='activities'>" +
                        "{{activities}}" +
                    "</ul>" +
                "</div>" +
                "<div class='span8'>" +
                    "<h2>{{fullName}} ({{username}}) <br/><span>{{gender}}, {{age}}</span></h2>" +
                    "<p>" +
                        "{{address}}" +
                    "</p>" +
                    "<h3>BIO</h3>" +
                    "<p>" +
                        "{{aboutParticipant}}" +
                    "</p>" +
                    "<div class='row-fluid'>" +
                        "<div class='span2 vertical-divider'>" +
                            "<h3>SHOE</h3>" +
                            "{{shoeSize}} US" +
                        "</div>" +
                        "<div class='span2 vertical-divider'>" +
                            "<h3>WIDTH</h3>" +
                            "{{shoeWidthStr}}" +
                        "</div>" +
                        "<div class='span2 vertical-divider'>" +
                            "<h3>SHIRT</h3>" +
                            "{{shirtSize}}" +
                        "</div>" +
                        "<div class='span3 vertical-divider'>" +
                            "<h3>JACKET</h3>" +
                            "{{jacketSize}}" +
                        "</div>" +
                        "<div class='span3'>" +
                            "<h3>PANTS</h3>" +
                            "{{waistSize}}&quot; / {{inseamLength}}&quot;" +
                        "</div>" +
                    "</div>" +
                "</div>" +
            "</div>";

    var genericTooltipTemplate = "<div class='row-fluid'>" +
                "<div class='span4'>" +
                    "<div class='thumb'>" +
                        "<img src='{{src}}' alt=''>" +
                    "</div>" +
                    "<h3 class='left'>ACTIVITIES</h3>" +
                    "<ul class='activities'>" +
                        "{{activities}}" +
                    "</ul>" +
                "</div>" +
                "<div class='span8'>" +
                    "<h2>{{username}} <br/><span>{{gender}}, {{age}}</span></h2>" +
                    "<p>" +
                        "{{cityAndState}}" +
                    "</p>" +
                    "<h3>BIO</h3>" +
                    "<p>" +
                        "{{aboutParticipant}}" +
                    "</p>" +
                    "<div class='row-fluid'>" +
                        "<div class='span2 vertical-divider'>" +
                            "<h3>SHOE</h3>" +
                            "{{shoeSize}} US" +
                        "</div>" +
                        "<div class='span2 vertical-divider'>" +
                            "<h3>WIDTH</h3>" +
                            "{{shoeWidthStr}}" +
                        "</div>" +
                        "<div class='span2 vertical-divider'>" +
                            "<h3>SHIRT</h3>" +
                            "{{shirtSize}}" +
                        "</div>" +
                        "<div class='span3 vertical-divider'>" +
                            "<h3>JACKET</h3>" +
                            "{{jacketSize}}" +
                        "</div>" +
                        "<div class='span3'>" +
                            "<h3>PANTS</h3>" +
                            "{{waistSize}}&quot; / {{inseamLength}}&quot;" +
                        "</div>" +
                    "</div>" +
                "</div>" +
            "</div>";

    //Template for tester progress tooltip
    var testerProgressTooltip = "<div class='brandRosterScore row-fluid'>" +
                "<div class='span8 text-right'>" +
                    "Surveys:<br>" +
                    "Performance Zones:<br>" +
                    "Product Images:<br>" +
                    "Activity Logs:" +
                "</div>" +
                "<div class='span4 text-left'>" +
                    "{{testerSurveyProgress}} of {{totalSurveys}}<br>" +
                    "{{testerPerformanceZoneProgress}} of {{totalPerformanceZones}}<br>" +
                    "{{testerWearAndTearProgress}} of {{totalWearAndTear}}<br>" +
                    "{{testerActivityLogProgress}} of {{totalActivityLogs}}" +
                "</div>" +
           "</div>";

    path += '?projection=' + JSON.stringify(projection);

    $scope.participantFilterOptions = [
        {
            key: 'on team',
            value: 'On Team'
        },
        {
            key: 'confirmed',
            value: 'Confirmed'
        },
        {
            key: 'invited',
            value: 'Invited'
        },
        {
            key: 'drafted',
            value: 'Drafted'
        },
        {
            key: 'requested',
            value: 'Requested'
        },
        {
            key: 'unregistered',
            value: 'Not Registered'
        },
        {
            key: 'team full',
            value: 'Test is full'
        },
        {
            key: 'removed',
            value: 'Removed'
        },
        {
            key: 'declined',
            value: 'Declined'
        }
    ];

    $scope.participantFilterOptionsKeys = [];

    for (i = 0; i < $scope.participantFilterOptions.length; i++) {
        $scope.participantFilterOptionsKeys.push($scope.participantFilterOptions[i].key);
    }

    //Action to be performed on a participant
    $scope.possibleActions = [
        {
            key: 1,
            value: "Send Invitation"
        },
        {
            key: 2,
            value: "Send Email"
        },
        {
            key: 3,
            value: "Change Tester Status"
        },
        {
            key: 4,
            value: "Change Product Status"
        }
    ];

    //Diferent statuses that can be set on a product
    $scope.productStatuses = [
        {
            key: "not shipped",
            value: "Not shipped"
        },
        {
            key: "shipped",
            value: "Shipped"
        },
        {
            key: "tester received",
            value: "Tester Received"
        },
        {
            key: "sent back",
            value: "Sent Back"
        },
        {
            key: "brand received",
            value: "Brand Received"
        }
    ];

    //Different statuses that can be set on a participant
    $scope.participantStatuses = [
        {
            key: "drafted",
            value: "Drafted"
        },
        {
            key: "on team",
            value: "On Team"
        },
        {
            key: "team full",
            value: "Test is full"
        },
        {
            key: "removed",
            value: "Removed"
        }
    ];

    var participantFilterParams = ($location.search())['participantFilter'];

    $scope.participantFilter = [];


    if (participantFilterParams) {
        participantFilterParams = participantFilterParams.split(',');

        for (i = 0; i < $scope.participantFilterOptions.length; i++) {
            if (participantFilterParams.indexOf($scope.participantFilterOptions[i].key) !== -1) {
                $scope.participantFilter.push($scope.participantFilterOptions[i].key);
            }
        }
    } else {
        $scope.participantFilter.push($scope.participantFilterOptions[0].key);

        $location.search('participantFilter', $scope.participantFilter);
    }

    $scope.actionSelected = null;

    $scope.weartest = {};

    $scope.exportLink = '';

    $scope.showAddTesterModal = false;

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    $scope.addTesterFilterInput = '';

    $scope.testerUsers = [];

    $scope.showTesterResults = false;

    $scope.loadingTesterUsers = true;

    $scope.usersToDraft = [];

    $scope.showInviteParticipantModal = false;

    $scope.notifyTester = true;

    $scope.rosterReverse = false;

    $scope.rosterLimit = 20;

    $scope.weartestFilteredParticipants = [];

    $scope.showProductStatusModal = false;

    $scope.productStatusForTester = null;

    $scope.showKarmaModal = false;

    $scope.karmaScore = 0;

    $scope.showParticipantNotesModal = false;

    $scope.showTesterStatusChangeModal = false;

    $scope.newTesterStatus = null;

    $scope.customStrictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
        dialogClass: 'modal surveyBuilder wider'
    };

    $scope.emailData = {};

    $scope.showSendEmailModal = false;

    $scope.imageset = [];

    $scope.participantProgressReady = false;

    $scope.showTesterInfoModal = false;

    $scope.selectedTester = {};

    var getTotalProductSurveys = function () {
        var count = 0;

        if (!$scope.weartest._id) {
            return count;
        } else if (!$scope.weartest.productSurveys) {
            return count;
        } else {
            return $scope.weartest.productSurveys.length;
        }
    };

    var getTotalActivityLogs = function () {
        return activityLogCount.get($scope.weartest);
    };

    var getTotalPerformanceZonesDates = function () {
        var count = 0;

        if (!$scope.weartest._id) {
            return count;
        } else if (!$scope.weartest.performanceZonesDates) {
            return count;
        } else {
            return $scope.weartest.performanceZonesDates.length;
        }
    };

    var getTotalWearAndTearDates = function () {
        var count = 0;

        if (!$scope.weartest._id) {
            return count;
        } else if (!$scope.weartest.productWearAndTearDates) {
            return count;
        } else {
            return $scope.weartest.productWearAndTearDates.length;
        }
    };

    var renderTesterProgressTooltip = function (participantId) {
        if (loadingParticipantDetails) {
            return;
        }

        var result = testerProgressTooltipTemplate[participantId];

        if (result) {
            //Already rendered earlier
            return;
        }

        var payload = {
            testerSurveyProgress: testerProgressDetails[participantId].submittedSurveys,
            testerActivityLogProgress: testerProgressDetails[participantId].activityLogs,
            testerPerformanceZoneProgress: testerProgressDetails[participantId].performanceZone,
            testerWearAndTearProgress: testerProgressDetails[participantId].wearAndTear,
            totalSurveys: getTotalProductSurveys(),
            totalActivityLogs: getTotalActivityLogs(),
            totalPerformanceZones: getTotalPerformanceZonesDates(),
            totalWearAndTear: getTotalWearAndTearDates()
        };

        testerProgressTooltipTemplate[participantId] = compileTemplate(testerProgressTooltip, payload);
    };

    //Calculate the progress of on team testers on the product test
    var prepareTesterProgress = function () {
        var onTeamTesterIds = [],
            i, j;

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            if ($scope.weartest.participants[i].status === 'on team') {
                onTeamTesterIds.push($scope.weartest.participants[i].userIdkey);
            }
        }

        if (onTeamTesterIds.length === 0) {
            notificationWindow.show('All actions completed. Roster page is ready for use.');
            return;
        }

        //Initialize the on team participant progress details
        for (i = 0; i < onTeamTesterIds.length; i++) {
            testerProgressDetails[onTeamTesterIds[i]] = {};

            testerProgressDetails[onTeamTesterIds[i]]['submittedSurveys'] = 0;
            testerProgressDetails[onTeamTesterIds[i]]['activityLogs'] = 0;
            testerProgressDetails[onTeamTesterIds[i]]['wearAndTear'] = 0;
            testerProgressDetails[onTeamTesterIds[i]]['performanceZone'] = 0;
        }

        async.parallel([
            function (callback) {
                //Function to get the survey progress
                var path = '/api/mesh01/surveys_submitted',
                    projection = {
                        '_id': 1,
                        'userId': 1
                    },
                    productSurveyIds = [],
                    query,
                    i;

                for (i = 0; i < $scope.weartest.productSurveys.length; i++) {
                    productSurveyIds.push($scope.weartest.productSurveys[i].survey_id);
                }

                if (productSurveyIds.length === 0) {
                    return callback(null);
                }

                query = {
                    surveyId: {
                        '$in': productSurveyIds
                    },
                    weartestId: $scope.weartest._id,
                    userId: {
                        '$in': onTeamTesterIds
                    }
                };

                path += '?query=' + JSON.stringify(query);

                path += '&projection=' + JSON.stringify(projection);

                $http.get(path)
                    .success(function (results) {
                        var i;

                        if (angular.isArray(results)) {
                            for (i = 0; i < results.length; i++) {
                                if (testerProgressDetails[results[i].userId]) {
                                    testerProgressDetails[results[i].userId]['submittedSurveys'] += 1;
                                }
                            }

                            callback(null);
                        } else {
                            callback(new Error('Error retrieving submitted survey details'));
                        }
                    })
                    .error(function (err) {
                        callback(err);
                    });
            },
            function (callback) {
                //Function to get the activity logs progress
                var path = '/api/mesh01/activityLogs',
                    projection = {
                        '_id': 1,
                        'userId': 1
                    },
                    query = {
                        'wearTests._id': $scope.weartest._id
                    };

                path += '?query=' + JSON.stringify(query);

                path += '&projection=' + JSON.stringify(projection);

                $http.get(path)
                    .success(function (results) {
                        var i;

                        if (angular.isArray(results)) {
                            for (i = 0; i < results.length; i++) {
                                if (testerProgressDetails[results[i].userId]) {
                                    testerProgressDetails[results[i].userId]['activityLogs'] += 1;
                                }
                            }

                            callback(null);
                        } else {
                            callback(new Error('Error retrieving submitted activity logs details'));
                        }
                    })
                    .error(function (err) {
                        callback(err);
                    });
            },
            function (callback) {
                //Function to calculate progress on Wear & Tear and Performance Zones
                var i;

                if (getTotalPerformanceZonesDates() > 0) {
                    for (i = 0; i < $scope.imageset.images.length; i++) {
                        if ($scope.imageset.images[i].type !== 'productImage') {
                            continue;
                        }

                        for (j = 0; j < $scope.imageset.images[i].dataPoints.length; j++) {
                            if (testerProgressDetails[$scope.imageset.images[i].dataPoints[j].userId]) {
                                testerProgressDetails[$scope.imageset.images[i].dataPoints[j].userId]['performanceZone'] += 1;
                            }
                        }
                    }
                }

                if (getTotalWearAndTearDates() > 0) {
                    for (i = 0; i < $scope.imageset.images.length; i++) {
                        if ($scope.imageset.images[i].type !== 'wearAndTear') {
                            continue;
                        }

                        if (testerProgressDetails[$scope.imageset.images[i].uploadedById]) {
                            testerProgressDetails[$scope.imageset.images[i].uploadedById]['wearAndTear'] += 1;
                        }
                    }
                }

                callback(null);
            }
        ],
            function (err, results) {
                var i;

                if (err) {
                    console.log(err);

                    notificationWindow.show('Error. Could not calculate progress of on team participants', false);
                } else {
                    //Compile tooltip template
                    for (i = 0; i < $scope.weartest.participants.length; i++) {
                        if ($scope.weartest.participants[i].status === 'on team') {
                            renderTesterProgressTooltip($scope.weartest.participants[i].userIdkey);

                            $scope.weartest.participants[i].progressDetailsReady = true;
                        }
                    }

                    $scope.correctParticipantScores();
                    
                    $scope.participantProgressReady = true;

                    notificationWindow.show('Progress of on team participants determined', false);
                }
            }
        );
    };

    var getWeatestImageset = function () {
        var path;

        path = '/api/mesh01/imagesets/' + $scope.weartest.imageSetId;

        $http.get(path)
            .success(function (result) {
                if (result._id === $scope.weartest.imageSetId) {
                    $scope.imageset = result;

                    notificationWindow.show('Images associated with product test retrieved. Determining progress of on team participants...', true);

                    prepareTesterProgress();
                } else {
                    notificationWindow.show('Error. Could not retrieve details of images associated with product test', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve details of images associated with product test', false);
            });
    };

    var isParticipantOnTeam = function (tester) {
        var i;

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            if ($scope.weartest.participants[i].userIdkey === tester.userIdkey) {
                return $scope.weartest.participants[i].status === 'on team';
            }
        }

        return false;
    };

    var getTesterAttribute = function (tester, attribute) {
        var i;

        if (!tester.userIdkey) {
            return tester[attribute] || '';
        } else {
            for (i = 0; i < participantDetails.length; i++) {
                if (participantDetails[i]._id === tester.userIdkey) {
                    return participantDetails[i][attribute] || '';
                }
            }
        }

        return '';
    };

    var getAllActivities = function (tester) {
        var resultingHtml = '',
            winter = getTesterAttribute(tester, 'winter'),
            summer = getTesterAttribute(tester, 'summer'),
            capitalize = $filter('capitalize'),
            i;

        if (angular.isUndefined(winter)) {
            if (angular.isUndefined(summer)) {
                resultingHtml = '';
            } else {
                for (i = 0; i < summer.length; i++) {
                    resultingHtml += '<li>' + capitalize(summer[i]) + '</li>';
                }
            }
        } else if (angular.isUndefined(summer)) {
            for (i = 0; i < winter.length; i++) {
                resultingHtml += '<li>' + capitalize(winter[i]) + '</li>';
            }
        } else {
            for (i = 0; i < summer.length; i++) {
                resultingHtml += '<li>' + capitalize(summer[i]) + '</li>';
            }

            for (i = 0; i < winter.length; i++) {
                resultingHtml += '<li>' + capitalize(winter[i]) + '</li>';
            }
        }

        return resultingHtml;
    };

    var getAddressOfParticipant = function (tester) {
        var address = getTesterAttribute(tester, 'address'),
            addressObject,
            addressString,
            i;

        if (!address) {
            return;
        }

        if (address[0].type === 'ship') {
            addressObject = address[0];
        } else {
            addressObject = address[1];
        }

        addressString = '';

        addressString = addressObject.address1 + '<br/>';

        if (addressObject.address2) {
            addressString += addressObject.address2 + '<br/>';
        }

        addressString += addressObject.city + ', ';
        addressString += addressObject.state + ', ';
        addressString += addressObject.zipCode + '<br/>';

        addressString += addressObject.country;

        return addressString;
    };

    var getCityAndState = function (tester) {
        var address = getTesterAttribute(tester, 'address'),
            addressObject,
            addressString,
                i;

        if (address[0].type === 'ship') {
            addressObject = address[0];
        } else {
            addressObject = address[1];
        }

        addressString = '';

        addressString += addressObject.city + ', ';
        addressString += addressObject.state + ', ';

        return addressString;
    };

    //Replaces data bindings with actual values
    var compileTemplate = function (template, replaceWith) {
        var reg = "";

        for (var key in replaceWith) {
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

    //Add or remove the participants from the list
    var updateSelected = function (action, id) {
        if (action === 'add' & selectedParticipants.indexOf(id) === -1) {
            selectedParticipants.push(id);
        } else if (action === 'remove' && selectedParticipants.indexOf(id) !== -1) {
            selectedParticipants.splice(selectedParticipants.indexOf(id), 1);
        }
    };

    var openInviteParticipantModal = function () {
        $scope.showInviteParticipantModal = true;
    };

    var openTesterStatusChangeModal = function () {
        $scope.showTesterStatusChangeModal = true;
    };

    //Prepare pariticipant data for export
    var prepareDataForExport = function () {
        var participantsData = [],
            columnHeaders,
            columnKeys,
            csvString,
            participant,
            participantChecking,
            address,
            i, j;

        for (i = 0; i < $scope.weartest.participants.length; i++) {

            participant = $scope.weartest.participants[i];

            if (participant.status === 'on team') {
                for (j = 0; j < participantDetails.length; j++) {

                    participantChecking = participantDetails[j];

                    if (participantChecking._id === participant.userIdkey) {
                        if (participantChecking.address && participantChecking.address.length > 0) {
                            if (participantChecking.address[0].type === 'ship') {
                                address = participantChecking.address[0];
                            } else if (participantChecking.address[1].type === 'ship') {
                                address = participantChecking.address[1];
                            }

                            participantsData.push(angular.extend({
                                fname: participantChecking.fname,
                                lname: participantChecking.lname,
                                gender: participantChecking.gender,
                                email: participantChecking.email,
                                shoeSize: participantChecking.shoeSize,
                                shoeWidthStr: participantChecking.shoeWidthStr,
                                shirtSize: participantChecking.shirtSize,
                                jacketSize: participantChecking.jacketSize,
                                gloveSize: participantChecking.gloveSize,
                                inseamLength: participantChecking.inseamLength,
                                waistMeasurement: participantChecking.waistMeasurement,
                                mobilePhone: participantChecking.mobilePhone,
                                neckMeasurement: participantChecking.neckMeasurement,
                                sleeveLength: participantChecking.sleeveLength
                            }, address));
                        }
                    }
                }
            }
        }

        //Prepare the data
        columnHeaders = ['First Name', 'Last Name', 'Gender', 'Address 1', 'Address 2', 'City', 'State', 'Postal Code', 'Country', 'Email', 'Mobile Number', 'Shoe Size', 'Shoe Width', 'Shirt Size', 'Jacket Size', 'Glove Size', 'Inseam Length', 'Waist Measurement', 'Neck Size', 'Sleeve Length'];
        columnKeys = ['fname', 'lname', 'gender', 'address1', 'address2', 'city', 'state', 'zipCode', 'country', 'email', 'mobilePhone', 'shoeSize', 'shoeWidthStr', 'shirtSize', 'jacketSize', 'gloveSize', 'inseamLength', 'waistMeasurement', 'neckMeasurement', 'sleeveLength'];

        csvString = downloadAsCSV(columnHeaders, columnKeys, participantsData);

        $scope.exportLink = csvString;

        dataReadyForExport = true;
    };

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
                'shoeWidthStr': 1,
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

    var getParticipantDetails = function () {
        var path = '/api/mesh01/users',
            query,
            promise,
            participantIds = [],
            participants = $scope.weartest.participants,
            projection,
            i;

        loadingParticipantDetails = true;

        for (i = 0; i < participants.length; i++) {
            participantIds.push(participants[i].userIdkey);
        }

        query = {
            '_id': {
                '$in': participantIds
            }
        };

        projection = {
            '_id': 1,
            'winter': 1,
            'summer': 1,
            'username': 1,
            'gender': 1,
            'dateOfBirth': 1,
            'aboutMe': 1,
            'fname': 1,
            'lname': 1,
            'address': 1,
            'email': 1,
            'shoeSize': 1,
            'shoeWidthStr': 1,
            'shirtSize': 1,
            'jacketSize': 1,
            'gloveSize': 1,
            'sleeveLength': 1,
            'neckMeasurement': 1,
            'inseamLength': 1,
            'waistMeasurement': 1,
            'mobilePhone': 1,
            'user_imageset': 1
        };

        notificationWindow.show('Getting information on participants of product test...', true);

        promise = splitRequest(path, query, '_id', participantIds, projection);

        promise.then(
            function (results) {
                if (angular.isArray(results)) {
                    participantDetails = results;

                    prepareDataForExport();

                    if ($scope.weartest.imageSetId && $scope.weartest.imageSetId.length > 0) {
                        notificationWindow.show('Information on participants received. Retrieving images associated with product test...', true);

                        getWeatestImageset();
                    } else {
                        notificationWindow.show('Information on participants received.', false);
                    }
                } else {
                    notificationWindow.show('Error retrieving details of participants of product test', false);
                }

                loadingParticipantDetails = false;
            },
            function (err) {
                console.log(err);

                notificationWindow.show('Error retrieving details of participants of product test', false);

                loadingParticipantDetails = false;
            }
        );
    };

    var updateWeartest = function (callback) {
        var path = '/api/mesh01/weartest/' + $scope.weartest._id;

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

    var filterParticipants = function () {
        var participants,
            i;

        participants = $scope.weartest.participants;

        $scope.weartestFilteredParticipants = [];

        for (var i = 0; i < participants.length; i++) {
            if ($scope.participantFilter.indexOf(participants[i].status) !== -1) {
                $scope.weartestFilteredParticipants.push(participants[i]);
            }
        }
    };

    var trackRosterUpdate = function (reset, email) {
        if (reset) {
            currentUpdateCount = 0;

            return;
        }

        currentUpdateCount += 1;

        if (email) {
            notificationWindow.show('Email sent for ' + currentUpdateCount + ' of ' + selectedParticipants.length + ' selected testers', true);
        } else {
            notificationWindow.show('Updated status for ' + currentUpdateCount + ' of ' + selectedParticipants.length + ' selected testers', true);
        }
    };

    //Updates selected testers with the new status
    var updateRoster = function (newStatus) {
        var rosterPayload = {
            wearTestId: $scope.weartest._id,
            userId: $scope.user._id,
            newStatus: newStatus,
            emailTemplateName: templateForStatus[newStatus]
        },
            path;

        //Both bulk email and roster updates use the same tracking function
        //Hence, do not carry out one while either is in progress
        if (actionInProgress['roster_update'] || actionInProgress['bulk_email']) {
            return;
        }

        actionInProgress['roster_update'] = true;

        //If the user should not be notified, remove the notification email template
        if (!$scope.notifyTester || !rosterPayload.emailTemplateName) {
            rosterPayload.emailTemplateName = '';
        }

        path = '/api/mesh01/rosterUpdate';

        notificationWindow.show('Updating status of selected tester(s)...', true);

        async.eachSeries(selectedParticipants, function (testerId, callback) {
            rosterPayload.testerIds = [testerId];

            $http.post(path, rosterPayload)
                .success(function (result) {
                    if (result === 'request queued') {
                        trackRosterUpdate(false);

                        callback();
                    } else {
                        callback(new Error('Error. Could not update status for tester ' + testerId));
                    }
                })
                .error(function (err) {
                    console.log(err);

                    callback(new Error('Error. Could not update status for tester ' + testerId));
                });
        }, function (err) {
            if (err) {
                notificationWindow.show('Error. Could not update status for selected tester(s)', false);
            } else {
                notificationWindow.show('Status updated for selected tester(s). Refreshing to get latest data', false);

                $location.search('participantFilter', newStatus);

                $route.reload();
            }

            trackRosterUpdate(true);

            actionInProgress['roster_update'] = false;
        });
    };

    var openSendEmailModal = function () {
        $scope.showSendEmailModal = true;
    };

    var participantFilterChanged = function () {
        //Reset selected participants
        selectedParticipants = [];

        $location.search('participantFilter', $scope.participantFilter);

        filterParticipants();
    };

    loginState.getLoginState(function (data) {
        $scope.user = data.userInfo;
    });

    notificationWindow.show('Getting latest product test details...', true);

    $http.get(path)
        .success(function (result) {
            if (result._id === weartestId) {
                $scope.weartest = result;

                if ($scope.weartest.participants.length > 0) {
                    getParticipantDetails();
                } else {
                    notificationWindow.show('This product test has no participants', false);
                }
            } else {
                notificationWindow.show('Error while reading product test', false);
            }
        })
        .error(function (err) {
            console.log(err);
            notificationWindow.show('Error while reading product test', false);
        });

    $scope.correctParticipantScores = function () {
        var i;

        if (actionInProgress['updateParticipantScore']) {
            return;
        }

        actionInProgress['updateParticipantScore'] = true;

        notificationWindow.show('Attempting to correct participant scores. Please wait...', true);

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            if ($scope.weartest.participants[i].status === 'on team') {
                $scope.weartest.participants[i].scoreReceived = (testerProgressDetails[$scope.weartest.participants[i].userIdkey].submittedSurveys * wearTestScorePolicy.surveyScore) + ((testerProgressDetails[$scope.weartest.participants[i].userIdkey].wearAndTear < getTotalWearAndTearDates()? testerProgressDetails[$scope.weartest.participants[i].userIdkey].wearAndTear: getTotalWearAndTearDates()) * wearTestScorePolicy.wearAndTearScore) + ((testerProgressDetails[$scope.weartest.participants[i].userIdkey].performanceZone < getTotalPerformanceZonesDates()? testerProgressDetails[$scope.weartest.participants[i].userIdkey].performanceZone: getTotalPerformanceZonesDates()) * wearTestScorePolicy.performanceZoneScore) + (testerProgressDetails[$scope.weartest.participants[i].userIdkey].activityLogs * wearTestScorePolicy.activityLogScore);
            }
        }

        updateWeartest(function (err) {
            if (err) {
                notificationWindow.show('Error. Could not update participant scores.', true);

                return;
            }

            notificationWindow.show('Successfully updated participant scores.', false);
        });

        filterParticipants();
    };

    //Show actions only if participants have been selected
    $scope.hideActions = function () {
        if (selectedParticipants.length === 0) {
            $scope.actionSelected = null;

            return true;
        } else if ($scope.participantFilter.indexOf('unregistered') !== -1) {
            $scope.actionSelected = null;

            return true;
        }

        return false;
    };

    $scope.getDraftLink = function () {
        if ($scope.weartest._id) {
            return '/dashboard/weartests/' + mode + '/' + $scope.weartest._id + '/draft';
        }
    };

    $scope.openAddTesterModal = function () {
        getAllTesters();

        $scope.showAddTesterModal = true;
    };

    $scope.closeAddTesterModal = function () {
        draftedUserDetails = [];

        $scope.addTesterFilterInput = '';

        $scope.showAddTesterModal = false;

        $scope.showTesterResults = false;

        $scope.usersToDraft = [];
    };

    $scope.addTesterFilter = function (tester) {
        if (!$scope.addTesterFilterInput) {
            return false;
        }

        var filterBy = $scope.addTesterFilterInput.toLowerCase();

        ////Is it the name?
        var fullName = '';

        if (tester.fname) {
            var fname = tester.fname.toLowerCase();

            if (fname.substring(0, filterBy.length).search(filterBy) > -1) {
                tester.sortOrder = fname.substring(0, filterBy.length).search(filterBy);
                if (tester.sortOrder == -1) {
                    return false;
                }
                tester.sortOrder = 1;
                return true;
            }

            fullName += fname + ' ';
        }

        if (tester.lname) {
            var lname = tester.lname.toLowerCase();
            if (lname.substring(0, filterBy.length).search(filterBy) > -1) {
                tester.sortOrder = lname.substring(0, filterBy.length).search(filterBy);
                if (tester.sortOrder == -1) {
                    return false;
                }

                tester.sortOrder = 2;
                return true;
            }

            fullName += tester.lname.toLowerCase();
        }

        if (fullName.search(filterBy) > -1) {
            tester.sortOrder = fullName.substring(0, filterBy.length).search(filterBy);
            if (tester.sortOrder == -1) {
                return false;
            }
            tester.sortOrder = 3;
            return true;
        }

        ////Is it a username?
        var username = tester.username.toLowerCase();

        if (username.substring(0, filterBy.length).search(filterBy) > -1) {
            tester.sortOrder = username.substring(0, filterBy.length).search(filterBy);
            if (tester.sortOrder == -1) {
                return false;
            }
            tester.sortOrder = 4;
            return true;
        }

        //Still not found? Perhaps its an email?
        if (tester.email.indexOf(filterBy) !== -1) {
            tester.sortOrder = 5;
            return true;
        }

        return false;
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

        updateWeartest(function (err) {
            if (err) {
                notificationWindow.show('Error drafting testers', false);

                actionInProgress['draft'] = false;
            } else {
                notificationWindow.show('Selected testers have been drafted. Refreshing to get latest data', false);

                $location.search('participantFilter', 'drafted');

                actionInProgress['draft'] = false;

                $route.reload();
            }
        });
    };

    $scope.executeAction = function (actionSelected) {
        $scope.actionSelected = actionSelected;

        switch ($scope.actionSelected) {
            case 1:
                openInviteParticipantModal();
                break;

            case 2:
                openSendEmailModal();
                break;

            case 3:
                openTesterStatusChangeModal();
                break;

            case 4:
                $scope.openProductStatusModal(undefined, true);
                break;
        }
    };

    $scope.closeInviteParticipantModal = function () {
        $scope.showInviteParticipantModal = false;

        $scope.notifyTester = true;
    };

    $scope.sendInviteToSelectedParticipants = function () {
        //Update the statuses for selected testers to 'invited'
        updateRoster('invited');

        $scope.closeInviteParticipantModal();
    };

    $scope.showDataExport = function () {
        if ($scope.participantFilter.indexOf('on team') !== -1 && dataReadyForExport) {
            return true;
        }

        return false;
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

    //Add or remove the participants based on the selection state
    $scope.updateSelection = function ($event, id) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        updateSelected(action, id);
    };

    //Add all participants to the selection
    $scope.selectAll = function ($event) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove'),
            participants = $scope.weartest.participants,
            participant,
            i;

        for (i = 0; i < participants.length; i++) {
            participant = participants[i];

            if ($scope.participantFilter.indexOf(participant.status) !== -1) {
                updateSelected(action, participant.userIdkey);
            }
        }
    };

    //Is the participant selected?
    $scope.isSelected = function (id) {
        return selectedParticipants.indexOf(id) !== -1;
    };

    //Are all participants selected?
    $scope.isSelectedAll = function () {
        var participantsOnScreen = [],
            participant,
            i;

        if (!$scope.weartest.participants) {
            return false;
        }

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            participant = $scope.weartest.participants[i];

            if ($scope.participantFilter.indexOf(participant.status) !== -1) {
                participantsOnScreen.push(participant.userIdkey);
            }
        }
        return selectedParticipants.length === participantsOnScreen.length;
    };

    //Checks if the sort order is active or not
    $scope.isSortOrder = function (columnName, sortOrder) {
        if (rosterPredicate === columnName) {
            //Check if sort order is provided - if not, then do not consider it
            if (sortOrder === undefined) {
                return true;
            } else {
                if ($scope.rosterReverse === true && sortOrder === "descending") {
                    return true;
                } else if ($scope.rosterReverse === false && sortOrder === "ascending") {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    };

    //Sets the sort order. If the sort column is already set, that is
    //it is the same as the one passed, the order is changed
    $scope.setSortOrder = function (columnName) {
        if (rosterPredicate === columnName) {
            $scope.rosterReverse = !$scope.rosterReverse;
        } else {
            rosterPredicate = columnName;
            $scope.rosterReverse = true;
        }
    };

    $scope.doesWeartestHaveParticipants = function () {
        var participants,
            i;

        if ($scope.weartest._id) {
            participants = $scope.weartest.participants;

            for (i = 0; i < participants.length; i++) {
                if ($scope.participantFilter.indexOf(participants[i].status) !== -1) {
                    return true;
                }
            }
        } else {
            //Optimistic until weartest data is fetched
            return true;
        }

        return false;
    };

    $scope.getValueOfKeyStatus = function () {
        var statuses = [],
            i;

        for (i = 0; i < $scope.participantFilterOptions.length; i++) {
            if ($scope.participantFilter.indexOf($scope.participantFilterOptions[i].key) !== -1) {
                statuses.push($scope.participantFilterOptions[i].value);
            }
        }

        if (statuses.length > 0) {
            return statuses.join(', ');
        } else {
            return 'Unknown';
        }
    };

    $scope.increaseRosterDisplayLimit = function () {
        if ($scope.rosterLimit > $scope.weartestFilteredParticipants.length) {
            return;
        }

        $scope.rosterLimit += 10;
    };

    $scope.getTesterProductShippingStatus = function (tester) {
        return tester.productShipStatus || 'N/A';
    };

    $scope.getTesterKarma = function (tester) {
        return tester.karma || '0';
    };

    $scope.openProductStatusModal = function (tester, inBulk) {
        if (tester) {
            testerForProductStatusChange = tester;

            $scope.productStatusForTester = testerForProductStatusChange.productShipStatus;
        } else if (inBulk) {
            bulkChangeInProductStatus = true;
        }

        $scope.showProductStatusModal = true;
    };

    $scope.closeProductStatusModal = function () {
        testerForProductStatusChange = {};

        bulkChangeInProductStatus = false;

        $scope.showProductStatusModal = false;

        $scope.productStatusForTester = null;
    };

    $scope.changeProductStatusForTester = function () {
        var i, j;

        if (actionInProgress['product_status']) {
            return;
        }

        actionInProgress['product_status'] = true;

        if (!bulkChangeInProductStatus) {
            testerForProductStatusChange.productShipStatus = $scope.productStatusForTester;

            testerForProductStatusChange.productShipDate = new Date();
        } else {
            for (i = 0; i < selectedParticipants.length; i++) {
                for (j = 0; j < $scope.weartest.participants.length; j++) {
                    if ($scope.weartest.participants[j].userIdkey === selectedParticipants[i]) {
                        $scope.weartest.participants[j].productShipStatus = $scope.productStatusForTester;

                        $scope.weartest.participants[j].productShipDate = new Date();
                    }
                }
            }
        }

        $scope.closeProductStatusModal();

        notificationWindow.show('Changing product status...', true);

        updateWeartest(function (err) {
            if (err) {
                notificationWindow.show('Error changing product status', false);
            } else {
                notificationWindow.show('Product status changed successfully', false);
            }

            actionInProgress['product_status'] = false;
        });
    };

    $scope.disableChangeProductStatus = function () {
        if ($scope.productStatusForTester === '' || $scope.productStatusForTester === null || $scope.productStatusForTester === undefined || actionInProgress['product_status']) {
            return true;
        }
    };

    $scope.getTesterProductShippingStatusChangeDate = function (tester) {
        if ($scope.getTesterProductShippingStatus(tester) === 'N/A') {
            return '';
        } else {
            if (tester.productShipDate) {
                return $filter('UTCDate')(tester.productShipDate, 'MM/dd/yy');
            } else {
                return '(date not recorded)';
            }
        }
    };

    $scope.openKarmaModal = function (tester) {
        testerForKarmaChange = tester;

        if (testerForKarmaChange.karma) {
            $scope.karmaScore = parseInt(testerForKarmaChange.karma, 10);
        } else {
            $scope.karmaScore = 0;
        }

        $scope.showKarmaModal = true;
    };

    $scope.closeKarmaModal = function () {
        $scope.showKarmaModal = false;

        testerForKarmaChange = {};

        $scope.karmaScore = 0;
    };

    $scope.disableKarmaChange = function () {
        return actionInProgress['change_karma'];
    };

    $scope.updateTesterKarma = function () {
        $scope.karmaScore = ($scope.karmaScore < 0)? 0 : $scope.karmaScore;

        if (('' + $scope.karmaScore).match(/\D/)) {
            notificationWindow.show('Invalid karma. Karma should be a positive number.');

            return;
        }

        if (actionInProgress['change_karma']) {
            return;
        }

        actionInProgress['change_karma'] = true;

        testerForKarmaChange.karma = parseInt($scope.karmaScore, 10);

        $scope.closeKarmaModal();

        notificationWindow.show('Updating karma for tester...', true);

        updateWeartest(function (err) {
            if (err) {
                notificationWindow.show('Error updating karma for tester', false);
            } else {
                notificationWindow.show('Karma successfully updated for tester', false);
            }

            actionInProgress['change_karma'] = false;
        });
    };

    $scope.getImagesetForParticipant = function (tester) {
        var imageset,
            i;

        for (i = 0; i < participantDetails.length; i++) {
            if (participantDetails[i]._id === tester.userIdkey) {
                imageset = participantDetails[i].user_imageset;

                break;
            }
        }

        return imageset;
    };

    $scope.renderTooltip = function (tester) {
        if (loadingParticipantDetails) {
            return;
        }

        var result = tooltipTemplatesForUsers[tester.userIdkey];

        if (result) {
            //Already rendered earlier
            return;
        }

        //Prepare image
        var image = imageHandler.getCoverPhoto($scope.getImagesetForParticipant(tester));

        if (image) {
            image = $filter('getScaledImage')(image, 98, 99, 'c_scale');
        } else {
            image = '/img/content/brand_roster_image.png';
        }

        var payload = {
            src: image,
            activities: getAllActivities(tester),
            fullName: $scope.getUserFullName(tester),
            username: getTesterAttribute(tester, 'username'),
            gender: getTesterAttribute(tester, 'gender'),
            age: $scope.getAgeFromBirthday(getTesterAttribute(tester, 'dateOfBirth')),
            firstName: getTesterAttribute(tester, 'fname'),
            aboutParticipant: getTesterAttribute(tester, 'aboutMe'),
            shoeSize: getTesterAttribute(tester, 'shoeSize'),
            shoeWidthStr: getTesterAttribute(tester, 'shoeWidthStr'),
            shirtSize: $filter('uppercase')(getTesterAttribute(tester, 'shirtSize')),
            jacketSize: $filter('uppercase')(getTesterAttribute(tester, 'jacketSize')),
            waistSize: getTesterAttribute(tester, 'waistMeasurement'),
            inseamLength: getTesterAttribute(tester, 'inseamLength')
        };

        if (isParticipantOnTeam(tester)) {
            payload.address = getAddressOfParticipant(tester);

            tooltipTemplatesForUsers[tester.userIdkey] = compileTemplate(tooltipTemplateForOnTeamParticipants, payload);
        } else {
            payload.cityAndState = getCityAndState(tester);

            tooltipTemplatesForUsers[tester.userIdkey] = compileTemplate(genericTooltipTemplate, payload);
        }
    };

    $scope.getTesterProgressTooltip = function (userDetails) {
        var result = testerProgressTooltipTemplate[userDetails.userIdkey];

        if (!result) {
            result = "";
        }

        return result;
    };

    $scope.getTooltipTemplateForUser = function (userDetails) {
        var result = tooltipTemplatesForUsers[userDetails.userIdkey];

        if (!result) {
            result = "";
        }

        return result;
    };

    $scope.openParticipantNotesModal = function (tester) {
        testerForNoteChange = tester;

        $scope.noteForTester = testerForNoteChange.notes || '';

        $scope.showParticipantNotesModal = true;
    };

    $scope.closeParticipantNotesModal = function () {
        testerForNoteChange = {};

        $scope.noteForTester = '';

        $scope.showParticipantNotesModal = false;
    };

    $scope.updateTesterNote = function () {
        if (actionInProgress['update_note']) {
            return;
        }

        actionInProgress['update_note'] = true;

        testerForNoteChange.notes = $scope.noteForTester;

        $scope.closeParticipantNotesModal();

        notificationWindow.show('Updating tester note...', true);

        updateWeartest(function (err) {
            if (err) {
                notificationWindow.show('Error updating note for tester', false);
            } else {
                notificationWindow.show('Note for tester successfully updated', false);
            }

            actionInProgress['update_note'] = false;
        });
    };

    $scope.closeTesterStatusChangeModal = function () {
        $scope.showTesterStatusChangeModal = false;

        $scope.newTesterStatus = null;

        $scope.notifyTester = true;
    };

    $scope.closeSendEmailModal = function () {
        $scope.showSendEmailModal = false;

        $scope.emailData = {};
    };

    $scope.getSelectedTesterUsernames = function () {
        var participants = $scope.weartest.participants,
            usernames = [],
            i, j;

        for (i = 0; i < selectedParticipants.length; i++) {
            for (j = 0; j < participants.length; j++) {
                if (selectedParticipants[i] === participants[j].userIdkey) {
                    usernames.push(participants[j].username);
                    break;
                }
            }
        }

        return usernames.join(', ');
    };

    $scope.sendEmail = function () {
        var emailPayload = {
            wearTestId: $scope.weartest._id,
            userId: $scope.currentUser._id,
            subject: $scope.emailData.subject,
            body: $scope.emailData.body
        },
            path;

        //Both bulk email and roster updates use the same tracking function
        //Hence, do not carry out one while either is in progress
        if (actionInProgress['bulk_email'] || actionInProgress['rosterUpdates']) {
            return;
        }

        if (!$scope.emailData.subject || $scope.emailData.subject.length === 0) {
            notificationWindow.show('Enter a subject', false);

            return;
        } else if (!$scope.emailData.body || $scope.emailData.body.length === 0) {
            notificationWindow.show('Enter a message', false);

            return;
        }

        actionInProgress['bulk_email'] = true;

        path = '/api/mesh01/bulkEmail';

        notificationWindow.show('Sending email to selected tester(s)', true);

        async.eachSeries(selectedParticipants, function (testerId, callback) {
            emailPayload.testerIds = [testerId];

            $http.post(path, emailPayload)
                .success(function (result) {
                    if (result.success === 'Bulk email has been queued for sending') {
                        trackRosterUpdate(false, true);

                        callback();
                    } else {
                        callback(new Error('Error. Could not send email to tester ' + testerId));
                    }
                })
                .error(function (err) {
                    console.log(err);

                    callback(new Error('Error. Could not send email to tester ' + testerId));
                });
        }, function (err) {
            if (err) {
                notificationWindow.show('Error. Could not send email to selected tester(s)', false);
            } else {
                notificationWindow.show('Email has been sent to selected tester(s)', false);
            }

            trackRosterUpdate(true);

            actionInProgress['bulk_email'] = false;

            //Reset selected participants
            selectedParticipants = [];

            $scope.closeSendEmailModal();
        });
    };

    $scope.changeTesterStatus = function () {
        updateRoster($scope.newTesterStatus);

        $scope.closeTesterStatusChangeModal();
    };

    //Decides if the column needs to be shownh
    $scope.isColumnShown = function (columnName) {
        return columnsToShow.indexOf(columnName) !== -1;
    };

    //Show or hide the column
    $scope.toggleColumnDisplay = function ($event, columnName) {
        var index = columnsToShow.indexOf(columnName),
            checked = $event.target.checked;

        if (index !== -1 && checked === false) {
            columnsToShow.splice(index, 1);
        } else if (index === -1 && checked === true) {
            columnsToShow.push(columnName);
        }
    };

    //Scope function to get the desired tester attribute
    $scope.getParticipantAttribute = function (participant, attribute) {
        //This function supports limited attributes. Update as necessary
        switch (attribute) {
            case 'shoeSize':
            case 'shoeWidthStr':
            case 'shirtSize':
            case 'jacketSize':
            case 'gloveSize':
            case 'gender':
            case 'sleeveLength':
            case 'neckMeasurement':
                return getTesterAttribute(participant, attribute);

            case 'pantSize':
                return getTesterAttribute(participant, 'waistMeasurement') + '" / ' + getTesterAttribute(participant, 'inseamLength') + '"';
        }
    };

    $scope.predicate = function (participant) {
        switch (rosterPredicate) {
            case 'username':
                return participant.username;

            case 'shoeSize':
            case 'shoeSize':
            case 'shoeWidthStr':
            case 'shirtSize':
            case 'jacketSize':
            case 'gloveSize':
            case 'gender':
            case 'sleeveLength':
            case 'neckMeasurement':
                return getTesterAttribute(participant, rosterPredicate);

            case 'pantSize':
                return getTesterAttribute(participant, 'waistMeasurement') + '" / ' + getTesterAttribute(participant, 'inseamLength') + '"';

            case 'karma':
                return participant.karma;

            case 'scoreReceived':
                return participant.scoreReceived;

            case 'productShipStatus':
                return participant.productShipStatus;

            case 'testerStatus':
                return $scope.participantFilterOptionsKeys.indexOf(participant.status);
        }
    };

    $scope.openTesterInfoModal = function (participantId) {
        var path = '/api/mesh01/users/' + participantId;

        notificationWindow.show('Getting participant information...', true);

        $http.get(path)
            .success(function (result) {
                if (result._id !== participantId) {
                    notificationWindow.show('Error while getting participant details', false);
                } else {
                    $scope.selectedTester = result;

                    $scope.showTesterInfoModal = true;

                    notificationWindow.show('Participant details fetched successfully', false);
                }
            });

    };

    $scope.closeTesterInfoModal = function () {
        $scope.showTesterInfoModal = false;
    };

    $scope.isParticipantStatus = function (status) {
        return $scope.participantFilter.indexOf(status) !== -1;
    };

    $scope.toggleStatusFilter = function ($event, statusName) {
        var index = $scope.participantFilter.indexOf(statusName),
            checked = $event.target.checked;

        if (index !== -1 && checked === false) {
            $scope.participantFilter.splice(index, 1);
            participantFilterChanged();
        } else if (index === -1 && checked === true) {
            $scope.participantFilter.push(statusName);
            participantFilterChanged();
        }
    };
}
]);
