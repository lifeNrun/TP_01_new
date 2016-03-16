dashboardApp.controller('WeartestReportBuilderCtrl', ['$scope', '$http', '$timeout', '$location', '$routeParams', '$filter', 'reportDisplayData', 'notificationWindow',
function ($scope, $http, $timeout, $location, $routeParams, $filter, reportDisplayData, notificationWindow) {
    'use strict';

    var participants = [],
        loading = {
            participants: false,
            wearAndTearImages: false,
            surveys: false,
            surveys_submitted: false,
            productImages: false,
            savedReports: false,
            reportSelection: false
        },
        unregisteredUsers = [],
        unregisteredUserIds = [],
        receivedUnreguserDetails = false,
        reportSelected = false,
        path,
        projection,
        imageset = {},
        weartestId = $routeParams['itemId'],
        participantIds = [],
        activityLogs = [],
        surveyIds = [],
        surveyName = [],
        ratingGroupKeys = [];

    $scope.weartest = {};

    $scope.mode = $routeParams['subSection'];

    $scope.reportData = {};

    $scope.wearAndTearImages = [];

    $scope.surveys = [];

    $scope.surveys_submitted = [];

    $scope.productImages = [];

    $scope.savedReports = [];

    $scope.ratingsGroupWeights = [];

    $scope.initialStageWeights = [];

    $scope.finalStageWeights = [];

    $scope.versionAWeights = [];

    $scope.versionBWeights = [];

    $scope.versionCWeights = [];

    $scope.versionDWeights = [];

    $scope.versionEWeights = [];

    $scope.ratingGroupBySurvey = {};

    $scope.AVsBBySurvey = {};

    $scope.initVsFinalBySurvey = {};

    $scope.ratingGroupBySurveyTemp = {};

    $scope.AVsBBySurveyTemp = {};

    $scope.initVsFinalBySurveyTemp = {};


    $scope.reportData.includeHeight = false;
    $scope.reportData.includeWeight = false;
    $scope.reportData.includeAge = false;
    $scope.reportData.includeTime = false;
    $scope.reportData.includeDistance = false;
    $scope.reportData.includeRating = true;
    $scope.reportData.includeOccupations = false;
    $scope.reportData.includeLocation = false;
    $scope.reportData.includeStyleNumber = false;
    $scope.reportData.includeSupplier = false;
    $scope.reportData.includeFactory = false;
    $scope.reportData.includeLast = false;
    $scope.reportData.includeProductDeveloper = false;
    $scope.reportData.includeDesigner = false;
    $scope.reportData.testSummary = "";
    $scope.reportData.wearAndTear = [];
    $scope.reportData.surveys = [];
    $scope.reportData.performanceZones = [];
    $scope.reportData.testerQuotes = "";
    $scope.reportData.areasOfImpCon = "";
    $scope.reportData.keytakeAways = "";
    $scope.reportData.ratingGroupSelection = [];
    $scope.ratingGroupSelection = [];
    $scope.absUrl = $location.absUrl();

    //Configuration for TinyMCE
    $scope.tinyMCEOptions = {
        plugins: ['textcolor'],
        textcolor_map: [
            "000000","Black",
            "993300","Burnt orange",
            "333300","Dark olive",
            "003300","Dark green",
            "003366","Dark azure",
            "000080","Navy Blue",
            "333399","Indigo",
            "333333","Very dark gray",
            "800000","Maroon",
            "FF6600","Orange",
            "808000","Olive",
            "008000","Green",
            "008080","Teal",
            "0000FF","Blue",
            "666699","Grayish blue",
            "808080","Gray",
            "FF0000","Red",
            "FF9900","Amber",
            "99CC00","Yellow green",
            "339966","Sea green",
            "33CCCC","Turquoise",
            "007DC6","Medium blue",
            "800080","Purple",
            "999999","Medium gray",
            "FF00FF","Magenta",
            "FFCC00","Gold",
            "FFFF00","Yellow",
            "00FF00","Lime",
            "00FFFF","Aqua",
            "00CCFF","Sky blue",
            "993366","Brown",
            "C0C0C0","Silver",
            "FF99CC","Pink",
            "FFCC99","Peach",
            "FFFF99","Light yellow",
            "CCFFCC","Pale green",
            "CCFFFF","Pale cyan",
            "99CCFF","Light sky blue",
            "CC99FF","Plum",
            "FFFFFF","White"
        ],
        browser_spellcheck : true,
        toolbar: "bold italic underline | undo redo | fontsizeselect forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat"
    };

    $scope.testerQuotestinyMCEOptions = {
        plugins: ['-testerProfilePlugin -surveysPlugin textcolor'],
        textcolor_map: [
            "000000","Black",
            "993300","Burnt orange",
            "333300","Dark olive",
            "003300","Dark green",
            "003366","Dark azure",
            "000080","Navy Blue",
            "333399","Indigo",
            "333333","Very dark gray",
            "800000","Maroon",
            "FF6600","Orange",
            "808000","Olive",
            "008000","Green",
            "008080","Teal",
            "0000FF","Blue",
            "666699","Grayish blue",
            "808080","Gray",
            "FF0000","Red",
            "FF9900","Amber",
            "99CC00","Yellow green",
            "339966","Sea green",
            "33CCCC","Turquoise",
            "007DC6","Medium blue",
            "800080","Purple",
            "999999","Medium gray",
            "FF00FF","Magenta",
            "FFCC00","Gold",
            "FFFF00","Yellow",
            "00FF00","Lime",
            "00FFFF","Aqua",
            "00CCFF","Sky blue",
            "993366","Brown",
            "C0C0C0","Silver",
            "FF99CC","Pink",
            "FFCC99","Peach",
            "FFFF99","Light yellow",
            "CCFFCC","Pale green",
            "CCFFFF","Pale cyan",
            "99CCFF","Light sky blue",
            "CC99FF","Plum",
            "FFFFFF","White"
        ],
        browser_spellcheck : true,
        toolbar: "Surveys | TesterProfile | bold italic underline | undo redo | fontsizeselect forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat",
        testerprofile: participants,
        surveysSubmitted: $scope.surveys_submitted,
        tagRecords: [],
        activityLogs: activityLogs
    };

    //Get the weartest rating
    var getWeartestRating = function () {
        $http.get('/api/misc/weartest/' + weartestId + '/ratings')
            .success(function (result) {
                if (angular.isObject(result)) {
                    $scope.weartestRating = result.rating;
                }
            });
    };

    $scope.getSurveyIds = function() {
        return surveyIds;
    }

    //for rating group selector in report builder screen
    $scope.getRatingGroupKeys = function() {
        return ratingGroupKeys;
    }

    $scope.getSurveyName = function(surveyId) {
        var j,
            srvyName;

         for (j = 0; j < $scope.surveys.length; j++) {
                if ($scope.surveys[j]._id === surveyId) {
                   srvyName = $scope.surveys[j].name;
                    break;
                }
         }
        return srvyName;
    }

    var getGroupWeightsBySurvey = function(questionWeightsAll) {

        var initVsFinalBySurvey = {},
            ratingGroupBySurvey = [],
            AvsBBySurvey = {},
            qroupQuestionWeights,
            WeightsBySurvey = {},
            groupWeightsBySurvey = {},
            key1,
            key,
            i,j;

        for (key1 in questionWeightsAll) {
              qroupQuestionWeights = {};

              //Merge same key values into one.
            for (j = 0; j < questionWeightsAll[key1].length; j++) {
                var qroupQuestionWeightsTemp = questionWeightsAll[key1][j];
                for (key in qroupQuestionWeightsTemp) {
                    if (!qroupQuestionWeights[key]) {
                        qroupQuestionWeights[key] = [];
                    }
                    for (i = 0; i < qroupQuestionWeightsTemp[key].length; i++) {
                        qroupQuestionWeights[key].push(qroupQuestionWeightsTemp[key][i]);
                    }
                }
            }
            if (!WeightsBySurvey[key1]) {
                 WeightsBySurvey[key1] = [];
            }
            WeightsBySurvey[key1].push(qroupQuestionWeights);
        }

        // Get ratingGroup weights by survey id
        if (WeightsBySurvey.ratinggroup !== undefined) {
            if (WeightsBySurvey.ratinggroup.length > 0) {
                ratingGroupBySurvey.push(WeightsBySurvey.ratinggroup[0]);
            }
            delete WeightsBySurvey.ratinggroup;
        }

        // Get Initial Vs Final weights by survey id
        questionWeightsAll = WeightsBySurvey;
        for (key1 in questionWeightsAll) {
            qroupQuestionWeights = {};
            //Merge same key values into one.
            for (j = 0; j < questionWeightsAll[key1].length; j++) {
                var qroupQuestionWeightsTemp = questionWeightsAll[key1][j];
                for (key in qroupQuestionWeightsTemp) {
                    if (!qroupQuestionWeights[key] && (key === 'initial' || key === 'final')) {
                      qroupQuestionWeights[key] = [];
                    }
                    for (i = 0; i < qroupQuestionWeightsTemp[key].length; i++) {
                        if(key === 'initial' || key === 'final') {
                            qroupQuestionWeights[key].push(qroupQuestionWeightsTemp[key][i]);
                        }
                    }
                }
            }
            if (!initVsFinalBySurvey[key1]) {
                initVsFinalBySurvey[key1] = [];
            }
            initVsFinalBySurvey[key1].push(qroupQuestionWeights);
        }

        // Get finally A Vs B weights by survey id
        for (key1 in questionWeightsAll) {
            qroupQuestionWeights = {};
            //Merge same key values into one.
            for (j = 0; j < questionWeightsAll[key1].length; j++) {
                var qroupQuestionWeightsTemp = questionWeightsAll[key1][j];
                for (key in qroupQuestionWeightsTemp) {
                    if (!qroupQuestionWeights[key] && (key === 'A' || key === 'B' || key === 'C' || key === 'D' || key === 'E')) {
                        qroupQuestionWeights[key] = [];
                    }
                    for (i = 0; i < qroupQuestionWeightsTemp[key].length; i++) {
                        if(key === 'A' || key === 'B' || key === 'C' || key === 'D' || key === 'E') {
                            qroupQuestionWeights[key].push(qroupQuestionWeightsTemp[key][i]);
                        }
                    }
                }
            }
            if (!AvsBBySurvey[key1]) {
                AvsBBySurvey[key1] = [];
            }
            AvsBBySurvey[key1].push(qroupQuestionWeights);
        }

        $scope.ratingGroupBySurvey = ratingGroupBySurvey[0];
        $scope.initVsFinalBySurvey = initVsFinalBySurvey;
        $scope.AVsBBySurvey = AvsBBySurvey;
        for (key in ratingGroupBySurvey[0]) {
            if(!$scope.ratingGroupBySurveyTemp[key]) {
                $scope.ratingGroupBySurveyTemp[key] = [];
            }
            for(i = 0; i < $scope.ratingGroupBySurvey[key].length; i++) {
                $scope.ratingGroupBySurveyTemp[key].push($scope.ratingGroupBySurvey[key][i]);
            }
        }
        for (key in initVsFinalBySurvey) {
            if(!$scope.initVsFinalBySurveyTemp[key]) {
                $scope.initVsFinalBySurveyTemp[key] = [];
            }
            for(i = 0; i < $scope.initVsFinalBySurvey[key].length; i++) {
                $scope.initVsFinalBySurveyTemp[key].push($scope.initVsFinalBySurvey[key][i]);
            }

        }
        for (key in AvsBBySurvey) {
            if(!$scope.AVsBBySurveyTemp[key]) {
                $scope.AVsBBySurveyTemp[key] = [];
            }
            for(i = 0; i < $scope.AVsBBySurvey[key].length; i++) {
                $scope.AVsBBySurveyTemp[key].push($scope.AVsBBySurvey[key][i]);
            }
        }
        groupWeightsBySurvey.AVsB = getAverageWeights(AvsBBySurvey);
        groupWeightsBySurvey.ratingGroup = getRatingGroupAverageWeights(ratingGroupBySurvey[0]);
        groupWeightsBySurvey.initVsFinal = getAverageWeights(initVsFinalBySurvey);
        return groupWeightsBySurvey;
    }

    //get average weights for given stage/version
    var getAverageWeights = function(questionWeightsAll) {

        var qroupQuestionWeights = {},
            averageWeights = {},
            key1,
            key,
            i,j,
            sum = 0,
            count = 0,
            avg = 0;

        // Get all rating group together based on stage(initial Vs final) from all survey
        for (key1 in questionWeightsAll) {

            for (j = 0; j < questionWeightsAll[key1].length; j++) {

                var qroupQuestionWeightsTemp = questionWeightsAll[key1][j];
                for (key in qroupQuestionWeightsTemp) {
                    if (!qroupQuestionWeights[key]) {
                        qroupQuestionWeights[key] = [];
                    }
                    for (i = 0; i < qroupQuestionWeightsTemp[key].length; i++) {
                        qroupQuestionWeights[key].push(qroupQuestionWeightsTemp[key][i]);
                    }
                }
            }

        }
        questionWeightsAll = qroupQuestionWeights;

        //Calculate average for each rating group in each stage.
        for (key1 in questionWeightsAll) {
            qroupQuestionWeights = {};
            for (j = 0; j < questionWeightsAll[key1].length; j++) {
                var qroupQuestionWeightsTemp = questionWeightsAll[key1][j];

                for (key in qroupQuestionWeightsTemp) {
                    if (!qroupQuestionWeights[key]) {
                        qroupQuestionWeights[key] = [];
                    }
                    for (i = 0; i < qroupQuestionWeightsTemp[key].length; i++) {
                        qroupQuestionWeights[key].push(qroupQuestionWeightsTemp[key][i]);
                    }
                }
            }

            for (key in qroupQuestionWeights) {
                if($scope.ratingGroupSelection.indexOf(key) < 0){
                   delete qroupQuestionWeights[key];
                }
            }

            for (key in qroupQuestionWeights) {
                sum = 0;
                count = 0;
                avg = 0;
                for (i = 0; i < qroupQuestionWeights[key].length; i++) {
                    if (qroupQuestionWeights[key][i] > 0) {
                        sum += qroupQuestionWeights[key][i];
                        count++;
                    }
                }
                if (count > 0) {
                avg = sum / count;
                }
                qroupQuestionWeights[key] = Math.round(avg * 100) / 100;
            }
            if (!averageWeights[key1]) {
                averageWeights[key1] = [];
            }
            averageWeights[key1].push(qroupQuestionWeights);
         }

        return averageWeights;
}

    //get average weights for given ratingGroup
    var getRatingGroupAverageWeights = function(questionWeightsAll) {

        var qroupQuestionWeights = {},
            averageWeights = {},
            key1,
            key,
            i,j,
            sum = 0,
            count = 0,
            avg = 0;

        for (key1 in questionWeightsAll) {

            for (j = 0; j < questionWeightsAll[key1].length; j++) {
                var qroupQuestionWeightsTemp = questionWeightsAll[key1][j];
                for (key in qroupQuestionWeightsTemp) {
                    if (!qroupQuestionWeights[key]) {
                        qroupQuestionWeights[key] = [];
                    }
                    for (i = 0; i < qroupQuestionWeightsTemp[key].length; i++) {
                        qroupQuestionWeights[key].push(qroupQuestionWeightsTemp[key][i]);
                    }
                }
            }
        }

        for (key in qroupQuestionWeights) {
            sum = 0;
            count = 0;
            avg = 0;
            for (i = 0; i < qroupQuestionWeights[key].length; i++) {
                if (qroupQuestionWeights[key][i] > 0) {
                    sum += qroupQuestionWeights[key][i];
                    count++;
                }
            }

                if (count > 0) {
                    avg = sum / count;
                }
                qroupQuestionWeights[key] = Math.round(avg * 100) / 100;
        }
        if (!averageWeights['ratinggroup']) {
            averageWeights['ratinggroup'] = [];
        }
        $scope.starActualRating = getStarRating(qroupQuestionWeights);
        $scope.weartestRating =  Math.round($scope.starActualRating / 100 * 2) / 2;//To set star rating.

        //Remove rating groups that are not selected.
        for (key in qroupQuestionWeights) {
            if($scope.ratingGroupSelection.indexOf(key) < 0){
                delete qroupQuestionWeights[key];
            }
        }
        averageWeights['ratinggroup'].push(qroupQuestionWeights);

        return averageWeights;
    }

    var getStarRating = function(questionWeights) {
        var key, 
            i,
            sum = 0,
            weightAdj = 0;

        for (key in questionWeights) {
            if (questionWeights.hasOwnProperty((key))) {
                for (i = 0; i < $scope.weartest.ratingGroupWeights.length; i++) {
                    if ($scope.weartest.ratingGroupWeights[i].name === key) {
                        if (questionWeights[key] != 0) {
                            weightAdj += $scope.weartest.ratingGroupWeights[i].weight;
                        }
                        sum += $scope.weartest.ratingGroupWeights[i].weight * questionWeights[key];
                    }
                }
            }
        }
        
        return sum / (weightAdj > 0? weightAdj / 100: 1);
    }

    var setGroupWeights = function (groupWeights) {
            $scope.ratingsGroupWeights = [];

            $scope.initialStageWeights = [];

            $scope.finalStageWeights = [];

            $scope.versionAWeights = [];

            $scope.versionBWeights = [];

            $scope.versionCWeights = [];

            $scope.versionDWeights = [];

            $scope.versionEWeights = [];
            if (groupWeights.ratingGroup.ratinggroup.length > 0) {
                $scope.ratingsGroupWeights = groupWeights.ratingGroup.ratinggroup[0];
            }
            if ((!angular.isUndefined(groupWeights.initVsFinal.initial)) && groupWeights.initVsFinal.initial.length > 0) {
                $scope.initialStageWeights =  groupWeights.initVsFinal.initial[0];
            }
            if ((!angular.isUndefined(groupWeights.initVsFinal.final)) && groupWeights.initVsFinal.final.length > 0) {
                $scope.finalStageWeights =  groupWeights.initVsFinal.final[0];
            }
            if ((!angular.isUndefined(groupWeights.AVsB.A)) && groupWeights.AVsB.A.length > 0) {
                $scope.versionAWeights =  groupWeights.AVsB.A[0];
            }
            if ((!angular.isUndefined(groupWeights.AVsB.B)) && groupWeights.AVsB.B.length > 0) {
                $scope.versionBWeights =  groupWeights.AVsB.B[0];
            }
            if ((!angular.isUndefined(groupWeights.AVsB.C)) && groupWeights.AVsB.C.length > 0) {
                $scope.versionCWeights =  groupWeights.AVsB.C[0];
            }
            if ((!angular.isUndefined(groupWeights.AVsB.D)) && groupWeights.AVsB.D.length > 0) {
                $scope.versionDWeights =  groupWeights.AVsB.D[0];
            }
            if ((!angular.isUndefined(groupWeights.AVsB.E)) && groupWeights.AVsB.E.length > 0) {
                $scope.versionEWeights =  groupWeights.AVsB.E[0];
            }
    }

    var getRatingsGroupWeightsBySurvey = function() {
         $http.get('/api/misc/weartest/' + weartestId + '/ratingsgroupbysurvey')
        .success(function (result) {
            if (angular.isObject(result)) {
                var groupWeights = getGroupWeightsBySurvey(result.questionWeights);
                setGroupWeights(groupWeights);
            }
        });
    }

    var getRatingsGroupWeights = function() {
         $http.get('/api/misc/weartest/' + weartestId + '/ratingsgroup')
        .success(function (result) {
            if (angular.isObject(result)) {
                if (result.questionWeights.ratinggroup.length > 0) {
                    $scope.ratingsGroupWeights = result.questionWeights.ratinggroup[0];
                }
                if ((!angular.isUndefined(result.questionWeights.initial)) && result.questionWeights.initial.length > 0) {
                    $scope.initialStageWeights =  result.questionWeights.initial[0];
                }
                if ((!angular.isUndefined(result.questionWeights.final)) && result.questionWeights.final.length > 0) {
                    $scope.finalStageWeights =  result.questionWeights.final[0];
                }
                if ((!angular.isUndefined(result.questionWeights.A)) && result.questionWeights.A.length > 0) {
                    $scope.versionAWeights =  result.questionWeights.A[0];
                }
                if ((!angular.isUndefined(result.questionWeights.B)) && result.questionWeights.B.length > 0) {
                    $scope.versionBWeights =  result.questionWeights.B[0];
                }
                if ((!angular.isUndefined(result.questionWeights.C)) && result.questionWeights.C.length > 0) {
                    $scope.versionCWeights =  result.questionWeights.C[0];
                }
                if ((!angular.isUndefined(result.questionWeights.D)) && result.questionWeights.D.length > 0) {
                    $scope.versionDWeights =  result.questionWeights.D[0];
                }
                if ((!angular.isUndefined(result.questionWeights.E)) && result.questionWeights.E.length > 0) {
                    $scope.versionEWeights =  result.questionWeights.E[0];
                }
            }
        });
    }

    var getImagesetDetailsOfWeartest = function () {
        var path = '/api/mesh01/imagesets/' + $scope.weartest.imageSetId,
            projection = {
                '_id': 1,
                'coverPhoto': 1,
                'images': 1
            }

        path += '?projection=' + JSON.stringify(projection);

        notificationWindow.show('Retrieving details of image collection associated with product test...', true);

        $http.get(path)
            .success(function (result) {
                if (result._id === $scope.weartest.imageSetId) {
                    imageset = result;

                    //Filter out the wear and tear images
                    $scope.prepareWearAndTearImages();

                    //Filter out the product images
                    $scope.prepareProductImages();

                    notificationWindow.show('Details of image collection associated with product test retrieved successfully. Preparing report builder for use...', false);
                } else {
                    notificationWindow.show('Error. Could not retrieve details on image collection associated with product test', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve details on image collection associated with product test', false);
            })
    };

    //Get tags created by brand
    var getTagsInfo = function () {

        $http.get('/api/misc/tags')
            .success(function (result) {
                if (angular.isObject(result)) {

                    $scope.testerQuotestinyMCEOptions.tagRecords = [];
                    $scope.testerQuotestinyMCEOptions.tagRecords = result.tagRecords;

                } else {
                    notificationWindow.show('Error getting tags created by you', false);
                }
            })
            .error(function (err) {
                notificationWindow.show('Error getting tags created by you', false);
            });
    };

    var getActivityLogs = function() {

        var path,
            projection,
            query;

        path = '/api/mesh01/activityLogs';

        query = {
            'userId': {
                '$in': participantIds
            },
            'wearTests._id': $scope.weartest._id
        };

        path += '?query=' + JSON.stringify(query);

        projection = {
            '_id': 1,
            'durationHours': 1,
            'durationMinutes': 1,
            'distance': 1,
            'distanceUnits': 1,
            'notes': 1,
            'userId': 1
        };

        path += '&projection=' + JSON.stringify(projection);

        $http.get(path)
            .success(function (results) {
                if (angular.isArray(results)) {
                    $scope.testerQuotestinyMCEOptions.activityLogs = results;
                } else {
                    notificationWindow.show('Error. Could not get activity logs tester quotes menu.', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not get activity logs tester quotes menu.', false);
            });
    };

    var getParticipantDetails = function () {
        var path,
            projection,
            query,
            i;

        participantIds = [];

        path = '/api/mesh01/users';

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            if ($scope.weartest.participants[i].status === 'on team') {
                participantIds.push($scope.weartest.participants[i].userIdkey);
            }
        }

        query = {
            '_id': {
                '$in': participantIds
            }
        };

        path += '?query=' + JSON.stringify(query);

        projection = {
            '_id': 1,
            'username': 1,
            'height': 1,
            'weight': 1,
            'dateOfBirth': 1,
            'profession': 1,
            'address': 1,
            'shoeSize': 1
        };

        path += '&projection=' + JSON.stringify(projection);

        loading.participants = true;

        participants = [];

        notificationWindow.show('Retrieving participant details...', true);

        $http.get(path)
            .success(function (results) {
                if (angular.isArray(results)) {
                    participants = results;

                    $scope.testerQuotestinyMCEOptions.testerprofile = [];
                    $scope.testerQuotestinyMCEOptions.testerprofile = participants;

                    loading.participants = false;
                } else {
                    notificationWindow.show('Error. Could not retrieve details on the participants', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve details on the participants', false);
            });
    };

    var _getUnregisteredUserNames = function () {
        if (unregisteredUserIds.length === 0) {
            receivedUnreguserDetails = true;
            return;
        }

        var path = '/api/mesh01/unregisteredUsers',
            query = {
                '_id': {
                    '$in': unregisteredUserIds
                }
            };

        path += '?query=' + JSON.stringify(query);

        $http.get(path)
            .success(function (result) {
                if (angular.isArray(result)) {
                    receivedUnreguserDetails = true;
                    unregisteredUsers = result;
                }
            });
    };

    var getSurveyDetails = function () {
        var surveyIds = [],
            path,
            query,
            i;

        loading.surveys = true;
        loading.surveys_submitted = true;

        for (i = 0; i < $scope.weartest.productSurveys.length; i++) {
            surveyIds.push($scope.weartest.productSurveys[i].survey_id);
        }

        path = '/api/mesh01/surveys';

        query = {
            '_id': {
                '$in': surveyIds
            }
        };

        path += '?query=' + JSON.stringify(query);

        notificationWindow.show('Retrieving information on the surveys associated with the product test', true);

        $http.get(path)
            .success(function (results) {
                if (angular.isArray(results)) {
                    $scope.surveys = results;
                    getRatingGroupsFromSurvey();
                    loadRatingGroups();
                    loading.surveys = false;

                    path = '/api/mesh01/surveys_submitted';

                    query = {
                        'weartestId': $scope.weartest._id,
                        'surveyId': {
                            '$in': surveyIds
                        }
                    };

                    path += '?query=' + JSON.stringify(query);

                    $http.get(path)
                        .success(function (results) {
                            if (angular.isArray(results)) {
                                $scope.surveys_submitted = results;
                                $scope.testerQuotestinyMCEOptions.surveysSubmitted = $scope.surveys_submitted;

                                //Determine the unregistered users that submitted the surveys
                                for (var i = 0; i < results.length; i++) {
                                    if (results[i].unregisteredUserId) {
                                        if (unregisteredUserIds.indexOf(results[i].unregisteredUserId) === -1) {
                                            unregisteredUserIds.push(results[i].unregisteredUserId);
                                        }
                                    }
                                }

                                //Silently get the names of the unregistered users
                                _getUnregisteredUserNames();

                                loading.surveys_submitted = false;
                            } else {
                                notificationWindow.show('Error. Could not retrieve details on the surveys submitted by testers', false);
                            }
                        })
                        .error(function (err) {
                            console.log(err);

                            notificationWindow.show('Error. Could not retrieve details on the surveys submitted by testers', false);
                        });
                } else {
                    notificationWindow.show('Error. Could not retrieve details on survey associated with product test', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve details on survey associated with product test', false);
            });
    };

    $scope.isMode = function (expectedMode) {
        return $scope.mode === expectedMode;
    };

    $scope.getParticipantCount = function () {
        return participants.length;
    };

    //Get and group Wear and Tear images by user who uploaded
    $scope.prepareWearAndTearImages = function () {
        var foundUserUploaded = false,
            newImageData = {},
            i;

        if (imageset._id) {
            loading.wearAndTearImages = true;

            $scope.wearAndTearImages = [];

            for (i = 0; i < imageset.images.length; i++) {
                if (imageset.images[i].type === 'wearAndTear') {
                    $scope.wearAndTearImages.push(imageset.images[i]);
                }
            }

            loading.wearAndTearImages = false;
        }
    };

    $scope.prepareProductImages = function () {
        var i;

        if (imageset._id) {
            loading.productImages = true;

            for (i = 0; i < imageset.images.length; i++) {
                if (imageset.images[i].type === 'productImage') {
                    $scope.productImages.push(imageset.images[i]);
                }
            }

            loading.productImages = false;
        }
    };

    $scope.getParticipantName = function (participantId) {
        var i;

        for (i = 0; i < participants.length; i++) {
            if (participants[i]._id === participantId) {
                return participants[i].username;
            }
        }

        if (!receivedUnreguserDetails) {
            //Not yet received details of the unregistered users. Wait for it.
            return;
        }

        for (i = 0; i < unregisteredUsers.length; i++) {
            if (unregisteredUsers[i]._id === participantId) {
                return unregisteredUsers[i].fname + ' ' + unregisteredUsers[i].lname;
            }
        }

        return 'Unknown User';
    };

    $scope.getImageForWearTest = function () {
        var defaultPhoto = '/img/289X209.jpg';

        if (imageset._id) {
            if (imageset.coverPhoto && imageset.coverPhoto !== '' && imageset.coverPhoto !== null) {
                return $filter('getScaledImage')(imageset.coverPhoto, 289, 209, 'c_fit');
            }
        }

        return defaultPhoto;
    };

    $scope.updateWearAndTearImageComments = function () {
        var i, j;

        for (i = 0; i < $scope.reportData.wearAndTear.length; i++) {
            for (j = 0; j < $scope.wearAndTearImages.length; j++) {
                if ($scope.wearAndTearImages[j]._id === $scope.reportData.wearAndTear[i].imageId || $scope.wearAndTearImages[j]._id === $scope.reportData.wearAndTear[i].featured) {
                    $scope.wearAndTearImages[j].brandUserComments = $scope.reportData.wearAndTear[i].comments;
                    $scope.wearAndTearImages[j].featured = $scope.reportData.wearAndTear[i].featured;
                    $scope.wearAndTearImages[j].imageId =  $scope.reportData.wearAndTear[i].imageId;

                    break;
                }
            }
        }
    };

    //Section 3 - BEGIN
    var updateDataPointsSelected = function (action, imageId, pointColor, dataPointId) {
        var foundDataPoint = false,
            newImage = {},
            i, j;

        //Find if the image exists
        //If it does, then verify if the data point exists.
        //If it does, then add / remove it
        //If image does not exist, ignore it

        for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
            if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === pointColor) {

                for (j = 0; j < $scope.reportData.performanceZones[i].dataPointId.length; j++) {
                    if ($scope.reportData.performanceZones[i].dataPointId[j] === dataPointId) {
                        foundDataPoint = true;
                        if (action === 'remove') {
                            $scope.reportData.performanceZones[i].dataPointId.splice(j, 1);
                            break;
                        }
                    }
                }

                if (action === 'add' && !foundDataPoint) {
                    $scope.reportData.performanceZones[i].dataPointId.push(dataPointId);
                }

                break;
            }
        }

        //Handle universal images
        for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
            if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === 'universal') {

                for (j = 0; j < $scope.reportData.performanceZones[i].dataPointId.length; j++) {
                    if ($scope.reportData.performanceZones[i].dataPointId[j] === dataPointId) {
                        foundDataPoint = true;
                        if (action === 'remove') {
                            $scope.reportData.performanceZones[i].dataPointId.splice(j, 1);
                            break;
                        }
                    }
                }

                if (action === 'add' && !foundDataPoint) {
                    $scope.reportData.performanceZones[i].dataPointId.push(dataPointId);
                    break;
                }

                break;
            }
        }
    };

    var getDataPointColor = function (imageId, dataPointId) {
        var i, j;

        for (i = 0; i < $scope.productImages.length; i++) {
            if ($scope.productImages[i]._id === imageId) {
                for (j = 0; j < $scope.productImages[i].dataPoints.length; j++) {
                    if ($scope.productImages[i].dataPoints[j]._id === dataPointId) {
                        return $scope.productImages[i].dataPoints[j].color;
                    }
                }
            }
        }
    };

    $scope.updateDataPointsSelection = function ($event, imageId, pointColor, dataPointId) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');

        updateDataPointsSelected(action, imageId, pointColor, dataPointId);
    };

    $scope.isDataPointSelected = function (imageId, dataPointId) {
        var i, j;

        for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
            if ($scope.reportData.performanceZones[i].imageId === imageId) {
                for (j = 0; j < $scope.reportData.performanceZones[i].dataPointId.length; j++) {
                    if ($scope.reportData.performanceZones[i].dataPointId[j] === dataPointId) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    //The selection is enabled only if the image for that point color exists or the image
    //for the universal point color exists
    $scope.isDataPointSelectionDisabled = function (imageId, pointColor, dataPointId) {
        var i;

        for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
            if ($scope.reportData.performanceZones[i].imageId === imageId && ($scope.reportData.performanceZones[i].pointColor === pointColor || $scope.reportData.performanceZones[i].pointColor === 'universal')) {
                return false;
            }
        }

        return true;
    };

    $scope.selectAllColoredPointsForImage = function ($event, imageId, pointColor) {
        var checkbox = $event.target,
            action = (checkbox.checked ? "add" : "remove"),
            i, j;

        for (i = 0; i < $scope.productImages.length; i++) {
            if ($scope.productImages[i]._id === imageId) {
                for (j = 0; j < $scope.productImages[i].dataPoints.length; j++) {
                    if ($scope.productImages[i].dataPoints[j].color === pointColor) {
                        updateDataPointsSelected(action, imageId, pointColor, $scope.productImages[i].dataPoints[j]._id);
                    }
                }
            }
        }
    };

    $scope.countPointsForImage = function (imageId, pointColor) {
        var count = 0,
            i, j;

        for (i = 0; i < $scope.productImages.length; i++) {
            if ($scope.productImages[i]._id === imageId) {
                for (j = 0; j < $scope.productImages[i].dataPoints.length; j++) {
                    if ($scope.productImages[i].dataPoints[j].color === pointColor) {
                        count++;
                    }
                }
            }
        }

        return count;
    };

    $scope.areAllColoredPointsForImageSelected = function (imageId, pointColor) {
        var possibleCount = $scope.countPointsForImage(imageId, pointColor),
            actualCount = 0,
            i, j;

        for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
            if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === pointColor) {
                actualCount = $scope.reportData.performanceZones[i].dataPointId.length;

                break;
            }
        }

        if (actualCount === 0) {
            for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
                if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === 'universal') {
                    for (j = 0; j < $scope.reportData.performanceZones[i].dataPointId.length; j++) {
                        if (getDataPointColor(imageId, $scope.reportData.performanceZones[i].dataPointId[j]) ===  pointColor) {
                            actualCount++;
                        }
                    }
                    break;
                }
            }
        }

        return possibleCount === actualCount;
    };

    //The selection is enabled only if the image for that point color exists or the image
    //for the universal point color exists
    $scope.areAllColoredPointsForImageSelectionDisabled = function (imageId, pointColor) {
        var i;

        for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
            if ($scope.reportData.performanceZones[i].imageId === imageId && ($scope.reportData.performanceZones[i].pointColor === pointColor || $scope.reportData.performanceZones[i].pointColor === 'universal')) {
                return false;
            }
        }

        return true;
    };

    $scope.selectImage = function ($event, imageId, pointColor) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        var newImage = {},
            foundImage,
            newDataPoints,
            i, j;

        if (action === 'add') {
            foundImage = false;

            for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
                if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === pointColor) {
                    foundImage = true;
                    break;
                }
            }

            if (!foundImage) {
                newImage.imageId = imageId;
                newImage.pointColor = pointColor;

                newDataPoints = [];

                //Mutually exclusive set up.
                if (pointColor === 'universal') {
                    //Remove data for the color-specific images
                    //Transfer the data points to the universal image
                    for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
                        if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === 'Red') {
                            newDataPoints = newDataPoints.concat($scope.reportData.performanceZones[i].dataPointId);
                            $scope.reportData.performanceZones.splice(i, 1);
                            break;
                        }
                    }

                    for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
                        if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === 'Green') {
                            newDataPoints = newDataPoints.concat($scope.reportData.performanceZones[i].dataPointId);
                            $scope.reportData.performanceZones.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
                        if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === 'universal') {
                            for (j = 0; j < $scope.reportData.performanceZones[i].dataPointId.length; j++) {
                                if (getDataPointColor(imageId, $scope.reportData.performanceZones[i].dataPointId[j]) === pointColor) {
                                    newDataPoints.push($scope.reportData.performanceZones[i].dataPointId[j]);
                                }
                            }
                            $scope.reportData.performanceZones.splice(i, 1);
                            break;
                        }
                    }
                }

                newImage.dataPointId = newDataPoints;

                $scope.reportData.performanceZones.push(newImage);
            }
        }

        if (action === 'remove') {

            for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
                if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === pointColor) {
                    $scope.reportData.performanceZones.splice(i, 1);
                    break;
                }
            }
        }
    };

    $scope.isImageSelected = function (imageId, pointColor) {
        var i;

        for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
            if ($scope.reportData.performanceZones[i].imageId === imageId && $scope.reportData.performanceZones[i].pointColor === pointColor) {
                return true;
            }
        }

        return false;
    };

    $scope.arePointsForImageSelectionDisabled = function (imageId, pointColor) {
        var oppositeColor,
            oppositeColor2;

        //If there is a colored image selection, all image points selection will be disabled
        //If there is a universal image points selection, individual color selection to be disabled
        if (pointColor === 'universal') {
            return $scope.isImageSelected(imageId, 'Red') || $scope.isImageSelected(imageId, 'Green');
        } else {
            return $scope.isImageSelected(imageId, 'universal');
        }
    };
    //Section 3 - END

    //---Section 4 - BEGIN---
    $scope.getAnswersForSurvey = function (surveyId) {
        var answers = [],
            i;

        for (i = 0; i < $scope.surveys_submitted.length; i++) {
            if ($scope.surveys_submitted[i].surveyId === surveyId) {
                answers = answers.concat($scope.surveys_submitted[i].answers);
            }
        }

        return answers;
    };

    var updateChartSelected = function (action, surveyId, questionId) {
        var foundSurvey = false,
            foundQuestion = false,
            newSurvey = {},
            i, j;

        //Find if the survey exists
        //If it does, then verify if the question exists.
        //If it does, then ignore else add / remove it
        //If survey does not exist, add /remove it and correspondingly add / remove the question

        for (i = 0; i < $scope.reportData.surveys.length; i++) {
            if ($scope.reportData.surveys[i].surveyId === surveyId) {
                foundSurvey = true;

                for (j = 0; j < $scope.reportData.surveys[i].questionId.length; j++) {
                    if ($scope.reportData.surveys[i].questionId[j] === questionId) {
                        foundQuestion = true;
                        if (action === 'remove') {
                            $scope.reportData.surveys[i].questionId.splice(j, 1);
                            break;
                        }
                    }
                }

                if (action === 'add' && !foundQuestion) {
                    $scope.reportData.surveys[i].questionId.push(questionId);
                }
            }
        }

        if (action === 'add' && !foundSurvey) {
            newSurvey.surveyId = surveyId;
            newSurvey.questionId = [];
            newSurvey.answerId = [];

            newSurvey.questionId.push(questionId);

            $scope.reportData.surveys.push(newSurvey);
        }
    };

    $scope.updateChartSelection = function ($event, surveyId, questionId) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');

        updateChartSelected(action, surveyId, questionId);
    };

    $scope.isChartSelected = function (surveyId, questionId) {
        var i, j;

        for (i = 0; i < $scope.reportData.surveys.length; i++) {
            if ($scope.reportData.surveys[i].surveyId === surveyId) {
                for (j = 0; j < $scope.reportData.surveys[i].questionId.length; j++) {
                    if ($scope.reportData.surveys[i].questionId[j] === questionId) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    var updateAnswerSelected = function (action, surveyId, answerId) {
        var foundSurvey = false,
            foundAnswer = false,
            newSurvey = {},
            i, j;

        //Find if the survey exists
        //If it does, then verify if the answer exists.
        //If it does, then ignore else add / remove it
        //If survey does not exist, add /remove it and correspondingly add / remove the answer

        for (i = 0; i < $scope.reportData.surveys.length; i++) {
            if ($scope.reportData.surveys[i].surveyId === surveyId) {
                foundSurvey = true;

                for (j = 0; j < $scope.reportData.surveys[i].answerId.length; j++) {
                    if ($scope.reportData.surveys[i].answerId[j] === answerId) {
                        foundAnswer = true;
                        if (action === 'remove') {
                            $scope.reportData.surveys[i].answerId.splice(j, 1);
                            break;
                        }
                    }
                }

                if (action === 'add' && !foundAnswer) {
                    $scope.reportData.surveys[i].answerId.push(answerId);
                }
            }
        }

        if (action === 'add' && !foundSurvey) {
            newSurvey.surveyId = surveyId;
            newSurvey.questionId = [];
            newSurvey.answerId = [];

            newSurvey.answerId.push(answerId);

            $scope.reportData.surveys.push(newSurvey);
        }
    };

    $scope.updateAnswerSelection = function ($event, surveyId, answerId) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');

        updateAnswerSelected(action, surveyId, answerId);
    };

    $scope.isAnswerSelected = function (surveyId, answerId) {
        var i, j;

        for (i = 0; i < $scope.reportData.surveys.length; i++) {
            if ($scope.reportData.surveys[i].surveyId === surveyId) {
                for (j = 0; j < $scope.reportData.surveys[i].answerId.length; j++) {
                    if ($scope.reportData.surveys[i].answerId[j] === answerId) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    $scope.selectAllChartsOfSurvey = function ($event, surveyId) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove'),
            i, j

        for (i = 0; i < $scope.surveys.length; i++) {
            if ($scope.surveys[i]._id === surveyId) {
                for (j = 0; j < $scope.surveys[i].questions.length; j++) {
                    if ($scope.surveys[i].questions[j].type === 'Free form text') {
                        //Free form text type questions will not have charts
                        continue;
                    }

                    updateChartSelected(action, surveyId, $scope.surveys[i].questions[j]._id);
                }

                break;
            }
        }
    };

    $scope.selectAllAnswersOfSurvey = function ($event, surveyId) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove'),
            i, j;

        for (i = 0; i < $scope.surveys_submitted.length; i++) {
            if ($scope.surveys_submitted[i].surveyId === surveyId) {
                for (j = 0; j < $scope.surveys_submitted[i].answers.length; j++) {
                    updateAnswerSelected(action, surveyId, $scope.surveys_submitted[i].answers[j]._id);
                }
            }
        }
    };

    $scope.areAllChartsOfSurveySelected = function (surveyId) {
        var allChartsSelected = false,
            chartsCount = 0,
            i, j;

        for (i = 0; i < $scope.surveys.length; i++) {
            if ($scope.surveys[i]._id === surveyId) {
                for (j = 0; j < $scope.surveys[i].questions.length; j++) {
                    if ($scope.surveys[i].questions[j].type === 'Free form text') {
                        continue;
                    } else {
                        chartsCount++;
                    }
                }

                break;
            }
        }

        for (j = 0; j < $scope.reportData.surveys.length; j++) {
            if ($scope.reportData.surveys[j].surveyId === surveyId) {
                if (chartsCount === $scope.reportData.surveys[j].questionId.length) {
                    allChartsSelected = true;
                }

                break;
            }
        }

        return allChartsSelected;
    };

    $scope.areAllAnswersOfSurveySelected = function (surveyId) {
        var allAnswersSelected = false,
            answersCount = 0,
            i, j;

        for (i = 0; i < $scope.surveys_submitted.length; i++) {
            if ($scope.surveys_submitted[i].surveyId === surveyId) {
                answersCount = answersCount + $scope.surveys_submitted[i].answers.length;
            }
        }

        for (j = 0; j < $scope.reportData.surveys.length; j++) {
            if ($scope.reportData.surveys[j].surveyId === surveyId) {
                if (answersCount === $scope.reportData.surveys[j].answerId.length) {
                    allAnswersSelected = true;
                }

                break;
            }
        }

        return allAnswersSelected;
    };

    //For the survey, given the question, prepare the data for the chart to display the data visually
    $scope.getCumulativeDataForChart = function (surveyId, questionId) {
        var i,
            j,
            k,
            returnValue = [],
            questions,
            question,
            answers,
            surveySubmissions,
            chartData,
            average = 0,
            sum = 0,
            max = 0,
            min,
            value = 0,
            count = 0,
            entry,
            choices = [];

        //Get the questions of the selected survey
        for (i = 0; i < $scope.surveys.length; i++) {
            if ($scope.surveys[i]._id === surveyId) {
                questions = $scope.surveys[i].questions;

                break;
            }
        }

        if (questions.length === 0) {
            return returnValue;
        }

        //Get the details of the question passed in the parameter
        question = null;
        for (i = 0; i < questions.length; i++) {
            if (questions[i]._id === questionId) {
                question = questions[i];
                break;
            }
        }

        if (question === null) {
            return returnValue;
        }

        //Get all the answers for that question
        answers = [];

        surveySubmissions = $scope.getAnswersForSurvey(surveyId).slice(0);

        for (i = 0; i < surveySubmissions.length; i++) {
            //Next, check if the answer is for the question that we are processing currently
            if (surveySubmissions[i].questionId === questionId) {
                answers.push(surveySubmissions[i]);
            }
        }

        if (answers.length === 0) {
            return returnValue;
        }

        //Depending on the question type, prepare the data
        chartData = {};
        if (question.type === 'Numeric' || question.type === 'Rating') {
            //Will contain the average value
            chartData.data = [];
            average = 0;
            sum = 0;
            max = 0;
            value = 0;
            count = 0;

            for (i = 0; i < answers.length; i++) {
                if (angular.isUndefined(answers[i].value) || answers[i].value === null || answers[i].value === '') {
                    continue;
                }

                value = parseInt(answers[i].value, 10);

                sum = sum + value;

                //Get the answer with the maximum value
                if (max < value) {
                    max = value+1;
                }

                //Get the answer with the least value
                if (min === undefined) {
                    min = value-1;
                } else if (value < min) {
                    min = value-1;
                }

                count = count + 1;
            }

            //average = Math.floor(sum / count);
              average = sum / count;
              average = average.toFixed(1);


            chartData.data.push(average);

            //The domain of the data
            chartData.domain = [min, max];
        } else if (question.type === 'Multiple Selection') {
            //Will contain the count of each option
            chartData.data = [];

            //Prepare each of the answers with a count of 0
            //The count indicates the number of times that option was selected
            for (i = 0; i < question.options.values.length; i++) {
                entry = {
                    key: question.options.values[i].key,
                    value: question.options.values[i].value,
                    color: question.options.values[i].chartColor,
                    count: 0
                };

                chartData.data.push(entry);
            }

            //Now, increment the count based on the selection of that option
            for (i = 0; i < answers.length; i++) {
                //Get the answers selected by the user
                choices = answers[i].valueArray.slice(0);

                //If the user has not selected any option, increment the "Unanswered" section
                if (choices === undefined || choices === null || choices.length === 0) {
                    continue;
                }

                for (k = 0; k < choices.length; k++) {
                    //Look for the key of the answer and increment its count
                    for (j = 0; j < chartData.data.length; j++) {
                        if (chartData.data[j].key === choices[k]) {
                            chartData.data[j].count += 1;
                            break;
                        }
                    }
                }
            }
        } else if (question.type === 'Single Selection') {

            //Will contain the count of each option
            chartData.data = [];

            //Prepare each of the answers with a count of 0
            //The count indicates the number of times that option was selected
            for (i = 0; i < question.options.values.length; i++) {
                entry = {
                    key: question.options.values[i].key,
                    value: question.options.values[i].value,
                    color: question.options.values[i].chartColor,
                    count: 0
                };

                chartData.data.push(entry);
            }

            //Now, increment the count based on the selection of that option
            for (i = 0; i < answers.length; i++) {
                //Get the answers selected by the user
                choices = answers[i].value;

                if (choices === undefined || choices === null || choices === "") {
                    continue;
                }

                //Look for the key of the answer and increment its count
                for (j = 0; j < chartData.data.length; j++) {
                    if (chartData.data[j].key === choices) {
                        chartData.data[j].count += 1;
                        break;
                    }
                }
            }
        }

        returnValue = JSON.parse(JSON.stringify(chartData));

        return returnValue;
    };

    $scope.isFreeFormQuestion = function (questionType) {
        return questionType === 'Free form text';
    };

    $scope.surveyDeliveryDate = function (survey) {
        var i;

        for (i = 0; i < $scope.weartest.productSurveys.length; i++) {
            if ($scope.weartest.productSurveys[i].survey_id === survey._id) {
                return $scope.weartest.productSurveys[i].triggerDate;
            }
        }
    };
    //---Section 4 - END---

    //---Section 5 - BEGIN---
    var updateWearAndTearImageSelected = function (action, imageId, comment) {
        var foundImage = false,
            newImage = {},
            i;

        for (i = 0; i < $scope.reportData.wearAndTear.length; i++) {
            if ($scope.reportData.wearAndTear[i].imageId === imageId || $scope.reportData.wearAndTear[i].featured === imageId) {
                foundImage = true;

                if (action === 'remove') {
                    if ($scope.reportData.wearAndTear[i].featured === imageId) {
                        $scope.reportData.wearAndTear[i].imageId = '';
                        $scope.reportData.wearAndTear[i].comments = comment;
                    } else {
                        $scope.reportData.wearAndTear.splice(i, 1);
                    }
                } else if (action === 'add') {
                    if ($scope.reportData.wearAndTear[i].featured === imageId) {
                        $scope.reportData.wearAndTear[i].imageId = imageId;
                        $scope.reportData.wearAndTear[i].comments = comment;
                    } else {
                        $scope.reportData.wearAndTear[i].imageId = imageId;
                        $scope.reportData.wearAndTear[i].comments = comment;
                        $scope.reportData.wearAndTear[i].featured = '';
                    }
                }

                break;
            }
        }

        if (action === 'add'  && !foundImage) {
            newImage.imageId = imageId;
            newImage.comments = comment;

            $scope.reportData.wearAndTear.push(newImage);
        }
    };

    var updateWearAndTearFeatureImageSelected = function (action, imageId, comment) {
        var foundImage = false,
            newImage = {},
            i;

        for (i = 0; i < $scope.reportData.wearAndTear.length; i++) {
            if ($scope.reportData.wearAndTear[i].imageId === imageId || $scope.reportData.wearAndTear[i].featured === imageId) {
                foundImage = true;
                if (action === 'remove') {
                    if (!angular.isUndefined($scope.reportData.wearAndTear[i].imageId) && $scope.reportData.wearAndTear[i].imageId !== '') {
                         $scope.reportData.wearAndTear[i].imageId = imageId;
                         $scope.reportData.wearAndTear[i].comments = comment;
                         $scope.reportData.wearAndTear[i].featured = '';
                    } else {
                        $scope.reportData.wearAndTear.splice(i, 1);
                    }
                } else if (action === 'add') {
                    if ($scope.reportData.wearAndTear[i].imageId === imageId) {
                        $scope.reportData.wearAndTear[i].featured = imageId;
                        $scope.reportData.wearAndTear[i].comments = comment;
                    } else {
                        $scope.reportData.wearAndTear[i].imageId = '';
                        $scope.reportData.wearAndTear[i].comments = comment;
                        $scope.reportData.wearAndTear[i].featured = imageId;
                    }
                }
               break;
            }
        }
        if (action === 'add' && !foundImage) {
            newImage.comments = comment;
            newImage.featured = imageId;
            $scope.reportData.wearAndTear.push(newImage);
        }
    };

    $scope.addRemoveAllWearAndTearImages = function ($event) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');

        for (var i = 0; i < $scope.wearAndTearImages.length; i++) {
            updateWearAndTearImageSelected(action, $scope.wearAndTearImages[i]._id, $scope.wearAndTearImages[i].brandUserComments);
        }
    };

    $scope.areAllWearAndTearImagesSelected = function () {
        return $scope.reportData.wearAndTear.length === $scope.wearAndTearImages.length;
    };

    var updateGroupWeightsSelected = function (action, surveyId, groupName) {
        var foundImage = false,
            key,
            group = {},
            groupTemp,
            i;
        if (groupName === 'TestRating') {
            group = $scope.ratingGroupBySurvey;
            groupTemp = $scope.ratingGroupBySurveyTemp;
        } else if (groupName === 'InitvsFinal') {
            group = $scope.initVsFinalBySurvey;
            groupTemp = $scope.initVsFinalBySurveyTemp;
        } else if (groupName === 'AvsB') {
            group = $scope.AVsBBySurvey;
            groupTemp = $scope.AVsBBySurveyTemp;
        }

        for (key in group) {
            if (key === surveyId) {
                foundImage = true;
                if (action === 'remove') {
                        delete group[surveyId];
                        //set survey flag also
                        setRatingGroupFlag(groupName, surveyId, false);
                }
                break;
            }

            }

            if (action === 'add' && !foundImage) {
                if(!group[surveyId]) {
                    group[surveyId] = [];
                }
                for(i = 0; i < groupTemp[surveyId].length; i++) {
                    group[surveyId].push(groupTemp[surveyId][i]);
                }

                //set survey flag also
                setRatingGroupFlag(groupName, surveyId, true);
            }
    };

    var setRatingGroupFlag = function(groupName, surveyId, flag) {
        //set survey flag also
        for(var k = 0; k < $scope.reportData.surveys.length; k++) {
            if($scope.reportData.surveys[k].surveyId === surveyId) {
                if (groupName === 'TestRating') {
                    $scope.reportData.surveys[k].ratingGroup = flag;
                } else if (groupName === 'InitvsFinal') {
                    $scope.reportData.surveys[k].initVsFinal = flag;
                } else if (groupName === 'AvsB') {
                    $scope.reportData.surveys[k].aVsB = flag;
                }
                break;
            }
        }
    }

    $scope.updateTestRatingSelection = function ($event, surveyId) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');
        updateGroupWeightsSelected(action, surveyId, 'TestRating')
    };

    $scope.updateInitvsFinalSelection = function ($event, surveyId) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');
        updateGroupWeightsSelected(action, surveyId, 'InitvsFinal')
    };

    $scope.updateAvsBSelection = function ($event, surveyId) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');
        updateGroupWeightsSelected(action, surveyId, 'AvsB')
    };


    $scope.ratingGroupSelector = function($event, ratingGroup) {
        var checkbox = $event.target;
        if(checkbox.checked){
            if($scope.ratingGroupSelection.indexOf(ratingGroup) < 0 ) {
                $scope.ratingGroupSelection.push(ratingGroup);
            }
        } else {
            $scope.ratingGroupSelection.splice($scope.ratingGroupSelection.indexOf(ratingGroup),1);
        }
    }

    $scope.isRatingGroupSelected = function (ratingGroup) {
        for(var key in $scope.ratingGroupSelection){
            if($scope.ratingGroupSelection[key] === ratingGroup){
                return true;
            }
        }
        return false;
    };

    $scope.updateGroupWeights = function() {
        var updategroupWeightsBySurvey = {};

        updategroupWeightsBySurvey.AVsB = getAverageWeights($scope.AVsBBySurvey);
        updategroupWeightsBySurvey.ratingGroup = getRatingGroupAverageWeights($scope.ratingGroupBySurvey);
        updategroupWeightsBySurvey.initVsFinal = getAverageWeights($scope.initVsFinalBySurvey);
        setGroupWeights(updategroupWeightsBySurvey);
    }

    var setGroupWeightSelection = function(surveyId) {
        var i;
        for(i = 0; i < $scope.reportData.surveys.length; i++) {
            if($scope.reportData.surveys[i].surveyId === surveyId) {

                if (!$scope.reportData.surveys[i].ratingGroup && $scope.ratingGroupBySurvey !== undefined
                    && $scope.ratingGroupBySurvey.hasOwnProperty(surveyId)) {
                    delete $scope.ratingGroupBySurvey[surveyId];
                }
                if (!$scope.reportData.surveys[i].initVsFinal && $scope.initVsFinalBySurvey !== undefined
                    && $scope.initVsFinalBySurvey.hasOwnProperty(surveyId)) {
                    delete $scope.initVsFinalBySurvey[surveyId];
                }

                if (!$scope.reportData.surveys[i].aVsB && $scope.AVsBBySurvey !== undefined
                    && $scope.AVsBBySurvey.hasOwnProperty(surveyId)) {
                    delete $scope.AVsBBySurvey[surveyId];
                }
                break;
            }
        }
    }

    $scope.hasSurveyTestRating = function(surveyId) {
        var j, l;

        for (j = 0; j < $scope.surveys.length; j++) {
            if ($scope.surveys[j]._id === surveyId) {
                for (l = 0; l < $scope.surveys[j].questions.length; l++) {
                    if ($scope.surveys[j].questions[l].type === 'Single Selection' && !angular.isUndefined($scope.surveys[j].questions[l].options) && ($scope.surveys[j].questions[l].options.considerForRating)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    $scope.hasSurveyInitVsFinal = function(surveyId) {
        var j, l;

        for (j = 0; j < $scope.surveys.length; j++) {
            if ($scope.surveys[j]._id === surveyId) {
                for (l = 0; l < $scope.surveys[j].questions.length; l++) {
                    if ($scope.surveys[j].questions[l].type === 'Single Selection' && !angular.isUndefined($scope.surveys[j].questions[l].stage) && ($scope.surveys[j].questions[l].stage === 'initial' || $scope.surveys[j].questions[l].stage === 'final')) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    $scope.hasSurveyAvsB = function(surveyId) {
        var j, l;

        for (j = 0; j < $scope.surveys.length; j++) {
            if ($scope.surveys[j]._id === surveyId) {
                for (l = 0; l < $scope.surveys[j].questions.length; l++) {
                    if ($scope.surveys[j].questions[l].type === 'Single Selection' && !angular.isUndefined($scope.surveys[j].questions[l].version) && ($scope.surveys[j].questions[l].version === 'A' || $scope.surveys[j].questions[l].version === 'B' || $scope.surveys[j].questions[l].version === 'C' || $scope.surveys[j].questions[l].version === 'D' || $scope.surveys[j].questions[l].version === 'E')) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    $scope.isTestRatingSelected = function (surveyId) {
        var key;
        for(key in $scope.ratingGroupBySurvey) {
            if(key === surveyId) {
                return true;
            }
        }

        return false;
    };

    $scope.isInitvsFinalSelected = function (surveyId) {
        var key;
        for(key in $scope.initVsFinalBySurvey) {
            if(key === surveyId) {
                return true;
            }
        }
        return false;
    };

    $scope.isAvsBSelected = function (surveyId) {
        var key;
        for(key in $scope.AVsBBySurvey) {
            if(key === surveyId) {
                return true;
            }
        }

        return false;
    };

    $scope.updateWearAndTearImageSelection = function ($event, imageId, comment) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');

        updateWearAndTearImageSelected(action, imageId, comment);
         $scope.updateWearAndTearImageComments();
    };

    $scope.updateWearAndTearFeaturedImageSelection = function ($event, imageId, comment) {
        var checkbox = $event.target,
            action = (checkbox.checked ? 'add' : 'remove');

        updateWearAndTearFeatureImageSelected(action, imageId, comment);
        $scope.updateWearAndTearImageComments();
    };

    $scope.isWearAndTearFeaturedImageSelected = function (imageId) {
        var i;

        for (i = 0; i < $scope.reportData.wearAndTear.length; i++) {
            if ($scope.reportData.wearAndTear[i].featured === imageId) {
                return true;
            }
        }

        return false;
    };

    $scope.isWearAndTearImageSelected = function (imageId) {
        var i;

        for (i = 0; i < $scope.reportData.wearAndTear.length; i++) {
            if ($scope.reportData.wearAndTear[i].imageId === imageId) {
                return true;
            }
        }

        return false;
    };

    //The getDivision() and getImagesPerDivision() functions are two wonderful
    //algorithms that work with each other.
    //Basically, the view needs to display images in sets of three, with each set
    //being displayed in one row
    //Thus, getDivision() decides the number of rows / sets possible and
    //getImagesPerDisivion decides the images that go in each row / set

    //Divide the number of images in the Image Set into sets of three Images
    $scope.getDivision = function (images) {
        var result = [],
            count = 1,
            i;

        for (i = 0; i < images.length; i++) {
            if (i % 3 === 0) {
                result.push(count);
                count = count + 1;
            }
        }

        return result;
    };

    //Returns the images in a division
    $scope.getImagesPerDivision = function (divisionNumber, images) {
        var result = [],
            count = 0,
            i;

        for (i = 0; i < images.length; i++) {
            //Divide each image into sets of three
            if (i % 3 === 0) {
                count = count + 1;
            }

            if (count === divisionNumber) {
                //Current count is same as division number provided
                //Current image belongs to the same division
                result.push(images[i]);
            } else if (count > divisionNumber) {
                //No point in continuing - all images of the requested division have been found
                break;
            }
        }

        return result;
    };

    $scope.updateCommentForImage = function (imageId, comment) {
        var i;

        if ($scope.isWearAndTearImageSelected(imageId) || $scope.isWearAndTearFeaturedImageSelected(imageId)) {
            for (i = 0; i < $scope.reportData.wearAndTear.length; i++) {
                if ($scope.reportData.wearAndTear[i].imageId === imageId || $scope.reportData.wearAndTear[i].featured === imageId) {
                    $scope.reportData.wearAndTear[i].comments = comment;
                    break;
                }
            }
        }
    };
    //---Section 5 - END---

    var retrieveSavedReports = function () {
        var path = '/api/mesh01/weartestReports',
            query = {
                'weartestId': $scope.weartest._id
            };

        path += '?query=' + JSON.stringify(query);

        loading.savedReports = true;
        loading.reportSelection = true;

        notificationWindow.show('Retrieving reports created earlier for the product test', true);

        $http.get(path)
            .success(function (results) {
                if (angular.isArray(results)) {
                    $scope.savedReports = results;

                    loading.savedReports = false;
                } else {
                    notificationWindow.show('Error. Could not retrieve the reports created earlier for this product test', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error. Could not retrieve the reports created earlier for this product test', false);
            });
    };

    $scope.isLoadingComplete = function () {
        var loadingPending,
            key, i;

        if (!($scope.weartest._id && imageset._id)) {
            return false;
        }

        for (key in loading) {
            if (loading.hasOwnProperty(key)) {
                loadingPending = loadingPending || loading[key];
            }
        }

        for (i = 0; i < $scope.reportData.surveys.length; i++) {
            setGroupWeightSelection($scope.reportData.surveys[i].surveyId);
        }

        return !loadingPending;
    };

    var adjustReport = function (report) {
        var newReport = JSON.parse(JSON.stringify(report)),
            newImage,
            newSurvey,
            pointColor,
            imagePointColor,
            foundImage = false,
            foundDataPoint = false,
            foundSurvey = false,
            foundQuestion = false,
            foundAnswer = false,
            i, j, k, l;

        newReport.performanceZones = [];

        for (i = 0; i < report.performanceZones.length; i++) {
            foundImage = false;

            for (j = 0; j < imageset.images.length; j++) {
                if (imageset.images[j]._id === report.performanceZones[i].imageId) {
                    foundImage = true;

                    newImage = {};

                    newImage._id = report.performanceZones[i]._id;
                    newImage.imageId = report.performanceZones[i].imageId;
                    newImage.dataPointId = [];

                    imagePointColor = report.performanceZones[i].pointColor;
                    newImage.pointColor = imagePointColor;

                    for (k = 0; k < report.performanceZones[i].dataPointId.length; k++) {
                        foundDataPoint = false;

                        for (l = 0; l < imageset.images[j].dataPoints.length; l++) {
                            if (report.performanceZones[i].dataPointId[k] === imageset.images[j].dataPoints[l]._id) {
                                foundDataPoint = true;
                                pointColor = imageset.images[j].dataPoints[l].color;

                                break;
                            }
                        }

                        if (foundDataPoint) {
                            if (angular.isUndefined(imagePointColor)) {

                                if (newImage.pointColor) {
                                    if (newImage.pointColor !== 'universal') {
                                        if (newImage.pointColor !== pointColor) {
                                            newImage.pointColor = 'universal';
                                        }
                                    }
                                } else {
                                    newImage.pointColor = pointColor;
                                }

                                newImage.dataPointId.push(report.performanceZones[i].dataPointId[k]);
                            } else {
                                if (pointColor === imagePointColor || imagePointColor === 'universal') {
                                    newImage.dataPointId.push(report.performanceZones[i].dataPointId[k]);
                                }
                            }
                        }
                    }

                    break;
                }
            }

            if (foundImage) {
                newReport.performanceZones.push(newImage);
            }
        }

        newReport.surveys = [];

        for (i = 0; i < report.surveys.length; i++) {
            foundSurvey = false;

            newSurvey = {};

            newSurvey._id = report.surveys[i]._id;
            newSurvey.surveyId = report.surveys[i].surveyId;
            if (!report.surveys[i].ratingGroup && $scope.ratingGroupBySurvey !== undefined
                && $scope.ratingGroupBySurvey.hasOwnProperty(newSurvey.surveyId)) {
                delete $scope.ratingGroupBySurvey[newSurvey.surveyId];
            }
            newSurvey.ratingGroup = report.surveys[i].ratingGroup;
            if (!report.surveys[i].initVsFinal && $scope.initVsFinalBySurvey !== undefined
                && $scope.initVsFinalBySurvey.hasOwnProperty(newSurvey.surveyId)) {
                delete $scope.initVsFinalBySurvey[newSurvey.surveyId];
            }
            newSurvey.initVsFinal = report.surveys[i].initVsFinal;
            if (!report.surveys[i].aVsB && $scope.AVsBBySurvey !== undefined
                && $scope.AVsBBySurvey.hasOwnProperty(newSurvey.surveyId)) {
                delete $scope.AVsBBySurvey[newSurvey.surveyId];
            }


            newSurvey.aVsB = report.surveys[i].aVsB;

            for (j = 0; j < $scope.surveys.length; j++) {
                if ($scope.surveys[j]._id === report.surveys[i].surveyId) {
                    foundSurvey = true;

                    newSurvey.questionId = [];

                    for (k = 0; k < report.surveys[i].questionId.length; k++) {
                        foundQuestion = false;

                        for (l = 0; l < $scope.surveys[j].questions.length; l++) {
                            if ($scope.surveys[j].questions[l]._id === report.surveys[i].questionId[k]) {
                                foundQuestion = true;

                                break;
                            }
                        }

                        if (foundQuestion) {
                            newSurvey.questionId.push(report.surveys[i].questionId[k]);
                        }
                    }

                    break;
                }
            }

            newSurvey.answerId = [];

            for (j = 0; j < $scope.surveys_submitted.length; j++) {
                if ($scope.surveys_submitted[j].surveyId === report.surveys[i].surveyId) {

                    for (k = 0; k < report.surveys[i].answerId.length; k++) {
                        foundAnswer = false;

                        for (l = 0; l < $scope.surveys_submitted[j].answers.length; l++) {
                            if ($scope.surveys_submitted[j].answers[l]._id === report.surveys[i].answerId[k]) {
                                foundAnswer = true;

                                break;
                            }
                        }

                        if (foundAnswer) {
                            newSurvey.answerId.push(report.surveys[i].answerId[k]);
                        }
                    }
                }
            }

            if (foundSurvey) {
                newReport.surveys.push(newSurvey);
            }
        }
        newReport.wearAndTear = [];

        for (i = 0; i < report.wearAndTear.length; i++) {
            foundImage = false;

            for (j = 0; j < $scope.wearAndTearImages.length; j++) {
                if ($scope.wearAndTearImages[j]._id === report.wearAndTear[i].imageId || $scope.wearAndTearImages[j]._id === report.wearAndTear[i].featured) {
                    foundImage = true;

                    break;
                }
            }

            if (foundImage) {
                newReport.wearAndTear.push(report.wearAndTear[i]);
            }
        }
        return newReport;
    };

    $scope.loadReport = function () {
        var adjustedReport = {},
            i, j;

        if (!$scope.loadReportId) {
            notificationWindow.show('Select a report to continue', false);

            return;
        }

        loading.reportSelection = true;

        notificationWindow.show('Loading selected report', false);

        for (i = 0; i < $scope.savedReports.length; i++) {
            if ($scope.savedReports[i]._id === $scope.loadReportId) {
                //When the report was last saved, there could have been changes to the
                //weartest - a data point that was earlier selected could have been removed,
                //a wear and tear image could have been deleted.
                //Thus - for housekeeping, adjust the report and remove unwanted items.
                //In the process, also classify the performance zone images based on the
                //content / color of the data point contained in them
                adjustedReport = adjustReport($scope.savedReports[i]);

                $scope.reportData = adjustedReport;
                break;
            }
        }

        getRatingGroupsFromSurvey();
        loadRatingGroups();
        loadSurveyIds();

        $scope.updateWearAndTearImageComments();


        $timeout(function () {
            loading.reportSelection = false;
        }, 1000);


        reportSelected = true;
    };

    //Get rating groups from surveys for user selection in report builder
    var getRatingGroupsFromSurvey = function(){
        var i, j;
        //Get rating groups for user selection in report builder
        ratingGroupKeys = [];
        for (i = 0; i < $scope.surveys.length; i++) {
            for (j = 0; j < $scope.surveys[i].questions.length; j++) {
                if(!angular.isUndefined($scope.surveys[i].questions[j].ratingGroup) && $scope.surveys[i].questions[j].options.considerForRating == true && $scope.surveys[i].questions[j].ratingGroup.length > 0 && ratingGroupKeys.indexOf($scope.surveys[i].questions[j].ratingGroup) < 0 ) {
                    ratingGroupKeys.push($scope.surveys[i].questions[j].ratingGroup);
                }
            }
        }
    };

    //Get rating groups for user selection for checking/unchecking
    var loadRatingGroups = function(){
        $scope.ratingGroupSelection = [];
        if(angular.isUndefined($scope.reportData.ratingGroupSelection) || $scope.reportData.ratingGroupSelection.length === 0 || $scope.mode === 'createReport'){
            for (var i = 0; i < ratingGroupKeys.length; i++) {
                $scope.ratingGroupSelection.push(ratingGroupKeys[i]);
            }
        } else {
            $scope.ratingGroupSelection = $scope.reportData.ratingGroupSelection;
        }
    };

    //Get all survey ids
    var loadSurveyIds = function(){
        surveyIds = [];
        for (var i = 0; i < $scope.weartest.productSurveys.length; i++) {
            surveyIds.push($scope.weartest.productSurveys[i].survey_id);
        }
    };

    $scope.loadingSavedReports = function () {
        if ($scope.mode === 'createReport') {
            return true;
        } else {
            return loading.savedReports;
        }
    };

    $scope.waitingForReportSelection = function () {
        if ($scope.mode === 'createReport') {
            return false;
        } else if (loading.savedReports) {
            return false;
        } else {
            return !$scope.loadReportId || loading.reportSelection || reportSelected;
        }
    };

    //Post - Processing - Prepare the report for display and conversion
    var getAverageHeight = function () {
        var averageHeight = 0,
            totalHeight = 0,
            validParticipants = 0,
            i;

        if (!$scope.reportData.includeHeight) {
            return averageHeight;
        }

        for (i = 0; i < participants.length; i++) {
            if (angular.isNumber(participants[i].height)) {
                validParticipants++;
                totalHeight = totalHeight + participants[i].height;
            }
        }

        averageHeight = Math.round(totalHeight / validParticipants);

        return averageHeight;
    };

    var getAverageWeight = function () {
        var averageWeight = 0,
            totalWeight = 0,
            validParticipants = 0,
            i;

        if (!$scope.reportData.includeWeight) {
            return averageWeight;
        }

        for (i = 0; i < participants.length; i++) {
            if (angular.isNumber(participants[i].weight)) {
                validParticipants++;
                totalWeight = totalWeight + participants[i].weight;
            }
        }

        averageWeight = Math.round(totalWeight / validParticipants);

        return averageWeight;
    };

    //Returns the age from the date
    var getAge = function (value) {
        var birthDate = new Date(value),
            today = new Date(),
            age = today.getFullYear() - birthDate.getFullYear(),
            month = today.getMonth() - birthDate.getMonth();

        if (value === null) {
            return 0;
        }

        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age =  age - 1;
        }

        return age;
    };

    var getAverageAge = function () {
        var averageAge = 0,
            totalAge = 0,
            i;

        if (!$scope.reportData.includeAge) {
            return averageAge;
        }

        for (i = 0; i < participants.length; i++) {
            totalAge = totalAge + getAge(participants[i].dateOfBirth);
        }

        averageAge = parseInt(totalAge / participants.length, 10);

        return averageAge;
    };

    var getAverageTime = function () {
        var averageMinutes = 0,
            totalMinutes = 0,
            hours = 0,
            minutes = 0,
            validParticipant = false,
            validParticipants = 0,
            i;

        if (!$scope.reportData.includeTime) {
            return averageMinutes;
        }

        for (i = 0; i < activityLogs.length; i++) {
            validParticipant = false;

            if (angular.isNumber(activityLogs[i].durationHours)) {
                totalMinutes = totalMinutes + (activityLogs[i].durationHours * 60);
                validParticipant = true;
            }

            if (angular.isNumber(activityLogs[i].durationMinutes)) {
                totalMinutes = totalMinutes + activityLogs[i].durationMinutes;
                validParticipant = true;
            }

            if (validParticipant) {
                validParticipants++;
            }
        }

        averageMinutes = parseInt(totalMinutes / validParticipants, 10);
        hours = parseInt(averageMinutes / 60, 10);
        minutes = parseInt(averageMinutes % 60, 10);

        return hours + ':' + minutes + ':00';
    };

    var getAverageDistance = function () {
        var averageDistance = 0,
            totalDistance = 0,
            validParticipants = 0,
            i;

        if (!$scope.reportData.includeDistance) {
            return averageDistance;
        }

        for (i = 0; i < activityLogs.length; i++) {
            if (angular.isNumber(activityLogs[i].distance)) {
                if (activityLogs[i].distanceUnits === 'kilometers') {
                    totalDistance = totalDistance + (activityLogs[i].distanceUnits / 1.6);
                } else {
                    totalDistance = totalDistance + activityLogs[i].distance;
                }
                validParticipants++;
            }
        }

        averageDistance = parseInt(totalDistance / validParticipants, 10);

        return averageDistance;
    };

    var getParticipantsProfessions = function () {
        var profession = [],
            i;

        for (i = 0; i < participants.length; i++) {
            if (angular.isString(participants[i].profession) && participants[i].profession !== "") {
                profession.push(participants[i].profession);
            }
        }

        return profession;
    };

    var getParticipantsLocations = function () {
        var locations = [],
            i, j;

        for (i = 0; i < participants.length; i++) {
            for (j = 0; j < participants[i].address.length; j++) {
                if (participants[i].address[j].type === 'ship') {
                    locations.push(participants[i].address[j].city + ' ' + participants[i].address[j].state);
                }
            }
        }

        return locations;
    };

    var getPerformanceZoneData = function () {
        var pzData = [],
            i, j, k, l,
            newImage,
            dataPoints;

        for (i = 0; i < $scope.reportData.performanceZones.length; i++) {
            newImage = {};
            dataPoints = [];

            for (j = 0; j < $scope.productImages.length; j++) {
                if ($scope.productImages[j]._id === $scope.reportData.performanceZones[i].imageId) {
                    dataPoints = $scope.productImages[j].dataPoints;

                    newImage = JSON.parse(JSON.stringify($scope.productImages[j]));
                    newImage.selectedDataPoints = [];
                    newImage.dataPoints = [];

                    for (k = 0; k < $scope.reportData.performanceZones[i].dataPointId.length; k++) {
                       for (l = 0; l < dataPoints.length; l++) {
                            if (dataPoints[l]._id === $scope.reportData.performanceZones[i].dataPointId[k]) {
                                newImage.selectedDataPoints.push(dataPoints[l]);
                            }

                            if ($scope.reportData.performanceZones[i].pointColor === 'universal') {
                                newImage.dataPoints.push(dataPoints[l]);
                            } else if ($scope.reportData.performanceZones[i].pointColor === 'Red' && dataPoints[l].color === 'Red') {
                                newImage.dataPoints.push(dataPoints[l]);
                            } else if ($scope.reportData.performanceZones[i].pointColor === 'Green' && dataPoints[l].color === 'Green') {
                                newImage.dataPoints.push(dataPoints[l]);
                            }
                        }
                    }

                    break;
                }
            }

            pzData.push(newImage);
        }

        return pzData;
    };

    var getSurveyData = function () {
        var surveyData = [],
            newSurvey = {},
            answers,
            foundSurvey,
            i, j, k, l,
            newQuestion = {};

        for (i = 0; i < $scope.reportData.surveys.length; i++) {
            foundSurvey = false;
            newSurvey = {};

            for (j = 0; j < $scope.surveys.length; j++) {
                if ($scope.surveys[j]._id === $scope.reportData.surveys[i].surveyId) {
                    newSurvey.surveyName = $scope.surveys[j].name;
                    newSurvey.questions = [];

                    for (k = 0; k < $scope.reportData.surveys[i].questionId.length; k++) {
                        newQuestion = {};

                        for (l = 0; l < $scope.surveys[j].questions.length; l++) {
                            if ($scope.surveys[j].questions[l]._id === $scope.reportData.surveys[i].questionId[k]) {
                                newQuestion = JSON.parse(JSON.stringify($scope.surveys[j].questions[l]));
                                newQuestion.cumulativeData = $scope.getCumulativeDataForChart($scope.surveys[j]._id, $scope.surveys[j].questions[l]._id);
                                newSurvey.questions.push(newQuestion);

                                break;
                            }
                        }
                    }

                    newSurvey.answers = [];
                    answers = $scope.getAnswersForSurvey($scope.surveys[j]._id);

                    for (k = 0; k < $scope.reportData.surveys[i].answerId.length; k++) {
                        for (l = 0; l < answers.length; l++) {
                            if (answers[l]._id === $scope.reportData.surveys[i].answerId[k]) {
                                newSurvey.answers.push(answers[l]);

                                break;
                            }
                        }
                    }

                    foundSurvey = true;
                }

                if (foundSurvey) {
                    break;
                }
            }

            surveyData.push(newSurvey);
        }

        return surveyData;
    };

    var getWearAndTearData = function () {
        var wntData = [],
            i, j;

        for (i = 0; i < $scope.reportData.wearAndTear.length; i++) {
            for (j = 0; j < $scope.wearAndTearImages.length; j++) {
                if ($scope.wearAndTearImages[j]._id ===  $scope.reportData.wearAndTear[i].imageId || $scope.wearAndTearImages[j]._id ===  $scope.reportData.wearAndTear[i].featured){
                    wntData.push($scope.wearAndTearImages[j]);

                    break;
                }
            }
        }

        return wntData;
    };

    var prepareReportForDisplay = function () {
        var displayData = {};

        //In case something goes wrong, we do not want the old report data, if any, to be used
        //for printing - thus reset the old data
        reportDisplayData.setData(displayData);

        for (var key in $scope.reportData) {
            if ($scope.reportData.hasOwnProperty(key)) {
                switch (key) {
                    case 'includeHeight':
                        if ($scope.reportData.includeHeight) {
                            displayData.averageHeight = getAverageHeight();
                        }

                        break;

                    case 'includeWeight':
                        if ($scope.reportData.includeWeight) {
                            displayData.averageWeight = getAverageWeight();
                        }

                        break;

                    case 'includeAge':
                        if ($scope.reportData.includeAge) {
                            displayData.averageAge = getAverageAge();
                        }

                        break;

                    case 'includeTime':
                        if ($scope.reportData.includeTime) {
                            displayData.averageTime = getAverageTime();
                        }

                        break;

                    case 'includeDistance':
                        if ($scope.reportData.includeDistance) {
                            displayData.averageDistance = getAverageDistance();
                        }

                        break;

                    case 'includeRating':
                        if ($scope.reportData.includeRating || $scope.weartest.automaticRating) {
                            displayData.testRating = $scope.weartestRating;
                        }

                        break;

                    case 'includeOccupations':
                        if ($scope.reportData.includeOccupations) {
                            displayData.occupations = getParticipantsProfessions();
                        }

                        break;

                    case 'includeLocation':
                        if ($scope.reportData.includeLocation) {
                            displayData.locations = getParticipantsLocations();
                        }

                        break;

                    case 'testSummary':
                        displayData.summary = $scope.reportData.testSummary;

                        break;

                    case 'performanceZones':
                        displayData.performanceZones = getPerformanceZoneData();

                        break;

                    case 'surveys':
                        displayData.surveys = getSurveyData();

                        break;

                    case 'wearAndTear':
                        displayData.wearAndTear = getWearAndTearData();

                        break;

                    case 'testerQuotes':
                        displayData.testerQuotes = $scope.reportData.testerQuotes;
                        break;

                    case 'areasOfImpCon':
                        displayData.areasOfImpCon = $scope.reportData.areasOfImpCon;
                        break;

                    case 'keytakeAways':
                        displayData.keytakeAways = $scope.reportData.keytakeAways;
                        break;

                    case 'ratingGroupSelection':
                        displayData.ratingGroupSelection = $scope.ratingGroupSelection;
                        break;

                    case 'includeStyleNumber':
                        displayData.styleNumber = $scope.reportData.includeStyleNumber;
                        break;

                    case 'includeSupplier':
                        displayData.supplier = $scope.reportData.includeSupplier;
                        break;

                    case 'includeFactory':
                        displayData.factory = $scope.reportData.includeFactory;
                        break;

                    case 'includeSeason':
                        displayData.season = $scope.reportData.includeSeason;
                        break;

                    case 'includeLast':
                        displayData.last = $scope.reportData.includeLast;
                        break;

                    case 'includeProductDeveloper':
                        displayData.productDeveloper = $scope.reportData.includeProductDeveloper;
                        break;

                    case 'includeDesigner':
                        displayData.designer = $scope.reportData.includeDesigner;
                        break;

                }
            }
        }

        displayData.userData = participants;
        displayData.unregisteredUsers = unregisteredUsers;
        displayData.weartestImage = $scope.getImageForWearTest();
        displayData.weartest = $scope.weartest;
        displayData.ratingsGroupWeights = $scope.ratingsGroupWeights;
        displayData.initialStageWeights = $scope.initialStageWeights;
        displayData.finalStageWeights = $scope.finalStageWeights;
        displayData.versionAWeights = $scope.versionAWeights;
        displayData.versionBWeights = $scope.versionBWeights;
        displayData.versionCWeights = $scope.versionCWeights;
        displayData.versionDWeights = $scope.versionDWeights;
        displayData.versionEWeights = $scope.versionEWeights;
        if($scope.starActualRating) {
            displayData.testRating = $scope.weartestRating;
            displayData.starActualRating = Math.round($scope.starActualRating) / 100;
        }
        displayData.success = true;

        reportDisplayData.setData(displayData);
    };

    var getUpdatedWearAndTear = function(wearAndTear) {
        var i, newImage = {},
            wearAndTearNew = [];

        for (i = 0; i < wearAndTear.length; i++) {
            newImage = {};
            if (wearAndTear[i].imageId !== '') {
                newImage.imageId = wearAndTear[i].imageId;
            }
            if (wearAndTear[i].comments !== '') {
                newImage.comments = wearAndTear[i].comments;
            }
            if (wearAndTear[i].featured !== '') {
                newImage.featured = wearAndTear[i].featured;
            }
            wearAndTearNew.push(newImage);

        }
        $scope.reportData.wearAndTear = wearAndTearNew;
        return wearAndTearNew;
    }

    var checkSurveyExist = function(surveyId){
        for(var i = 0; i < $scope.reportData.surveys.length; i++){
            if($scope.reportData.surveys[i].surveyId === surveyId){
                return true;
            }
        }
        return false;
    }

    var updateGroupWeightsInSurvey = function() {
        var i, key;
        for(i = 0; i < $scope.weartest.productSurveys.length; i++){
            var surveyTemp = {};
            if(!checkSurveyExist($scope.weartest.productSurveys[i].survey_id)) {
                surveyTemp.surveyId = $scope.weartest.productSurveys[i].survey_id;
                surveyTemp.answerId = [];
                surveyTemp.questionId = [];
                surveyTemp.ratingGroup = false;
                surveyTemp.initVsFinal = false;
                surveyTemp.aVsB = false;
                $scope.reportData.surveys.push(surveyTemp);
            }
        }
        for (i = 0; i < $scope.reportData.surveys.length; i++) {
            $scope.reportData.surveys[i].ratingGroup = false;
            $scope.reportData.surveys[i].initVsFinal = false;
            $scope.reportData.surveys[i].aVsB = false;

            for (key in $scope.ratingGroupBySurvey) {
                if ($scope.reportData.surveys[i].surveyId === key) {
                    $scope.reportData.surveys[i].ratingGroup = true;
                    break;
                }
            }
            for (key in $scope.initVsFinalBySurvey) {
                if ($scope.reportData.surveys[i].surveyId === key) {
                    $scope.reportData.surveys[i].initVsFinal = true;
                    break;
                }
            }
            for (key in $scope.AVsBBySurvey) {
                if ($scope.reportData.surveys[i].surveyId === key) {
                    $scope.reportData.surveys[i].aVsB = true;
                    break;
                }
            }
        }
        return $scope.reportData.surveys;
    };

    $scope.saveSelection = function (newReport) {
        var path,
            newReportRecord,
            reportId;

        if (newReport) {
            if (angular.isUndefined($scope.reportData.reportName) || $scope.reportData.reportName === null || $scope.reportData.reportName === '') {
                notificationWindow.show('Error. Specify a name for the report', false);

                return;
            }

            path = '/api/mesh01/weartestReports';

            newReportRecord = {};

            newReportRecord.weartestId = $scope.reportData.weartestId;
            newReportRecord.reportName = $scope.reportData.reportName;
            newReportRecord.includeHeight = $scope.reportData.includeHeight;
            newReportRecord.includeWeight = $scope.reportData.includeWeight;
            newReportRecord.includeAge = $scope.reportData.includeAge;
            newReportRecord.includeTime = $scope.reportData.includeTime;
            newReportRecord.includeDistance = $scope.reportData.includeDistance;
            newReportRecord.includeRating = $scope.reportData.includeRating;
            newReportRecord.includeOccupations = $scope.reportData.includeOccupations;
            newReportRecord.includeLocation = $scope.reportData.includeLocation;
            newReportRecord.testSummary = $scope.reportData.testSummary;
            newReportRecord.testerQuotes = $scope.reportData.testerQuotes;
            newReportRecord.areasOfImpCon = $scope.reportData.areasOfImpCon;
            newReportRecord.keytakeAways = $scope.reportData.keytakeAways;
            newReportRecord.ratingGroupSelection = $scope.ratingGroupSelection;
            newReportRecord.performanceZones = $scope.reportData.performanceZones;
            newReportRecord.surveys = updateGroupWeightsInSurvey(); //$scope.reportData.surveys;
            newReportRecord.wearAndTear = getUpdatedWearAndTear($scope.reportData.wearAndTear);

            notificationWindow.show('Saving as new report...', true);

            $http.post(path, newReportRecord)
                .success(function (result) {
                    var path,
                        projection,
                        query;

                    if (result._id) {
                        reportId = result._id;

                        path = '/api/mesh01/activityLogs';

                        query = {
                            'userId': {
                                '$in': participantIds
                            },
                            'wearTests._id': $scope.weartest._id
                        };

                        path += '?query=' + JSON.stringify(query);

                        projection = {
                            '_id': 1,
                            'durationHours': 1,
                            'durationMinutes': 1,
                            'distance': 1,
                            'distanceUnits': 1,
                            'notes': 1
                        };

                        path += '&projection=' + JSON.stringify(projection);

                        notificationWindow.show('Report saved successfully. Building report for display...', true);

                        $http.get(path)
                            .success(function (results) {
                                if (angular.isArray(results)) {
                                    activityLogs = results;

                                    if($scope.weartest.automaticRating) {
                                        $scope.updateGroupWeights();
                                    }
                                    prepareReportForDisplay();

                                    $location.path('/report/' + reportId);
                                } else {
                                    notificationWindow.show('Error. Could not build report for display.', false);
                                }
                            })
                            .error(function (err) {
                                console.log(err);

                                notificationWindow.show('Error. Could not build report for display.', false);
                            });
                    } else {
                        notificationWindow.show('Error. Could not save report', false);
                    }
                })
                .error(function (err) {
                    console.dir(err);

                    notificationWindow.show('Error. Could not save report.', false);
                });
        } else {
            path = '/api/mesh01/weartestReports/' + $scope.reportData._id;

            notificationWindow.show('Saving changes to report...', true);
            $scope.reportData.ratingGroupSelection =  $scope.ratingGroupSelection;
            updateGroupWeightsInSurvey();
            $http.put(path, $scope.reportData)
                .success(function (result) {
                    var path,
                        projection,
                        query;

                    if (result._id === $scope.reportData._id) {
                        path = '/api/mesh01/activityLogs';

                        query = {
                            'userId': {
                                '$in': participantIds
                            },
                            'wearTests._id': $scope.weartest._id
                        };

                        path += '?query=' + JSON.stringify(query);

                        projection = {
                            '_id': 1,
                            'durationHours': 1,
                            'durationMinutes': 1,
                            'distance': 1,
                            'distanceUnits': 1
                        };

                        path += '&projection=' + JSON.stringify(projection);

                        notificationWindow.show('Report saved successfully. Building report for display...', true);

                        $http.get(path)
                            .success(function (results) {
                                if (angular.isArray(results)) {
                                    activityLogs = results;
                                    if($scope.weartest.automaticRating) {
                                        $scope.updateGroupWeights();
                                    }
                                    prepareReportForDisplay();

                                    $location.path('/report/' + $scope.reportData._id);
                                } else {
                                    notificationWindow.show('Error. Could not build report for display.', false);
                                }
                            })
                            .error(function (err) {
                                console.log(err);

                                notificationWindow.show('Error. Could not build report for display.', false);
                            });
                    } else {
                        notificationWindow.show('Error. Could not save report.', false);
                    }
                })
                .error(function (err) {
                    console.dir(err);

                    notificationWindow.show('Error. Could not save report.', false);
                });
        }
    };

    if ($scope.mode === 'editReport') {
        loading.savedReports = true;
    }

    //Get the weartest details
    path = '/api/mesh01/weartest/' + weartestId;

    projection = {
        '_id': 1,
        'imageSetId': 1,
        'participants': 1,
        'productSurveys': 1,
        'productName': 1,
        'retailPrice': 1,
        'wearTestStartDate': 1,
        'wearTestEndDate': 1,
        'expectationsOverview': 1,
        'name': 1,
        'identification': 1,
        'rating': 1,
        'automaticRating': 1,
        'ratingGroupWeights': 1,
        'styleNumber': 1,
        'supplier': 1,
        'factory': 1,
        'season': 1,
        'last': 1,
        'productDeveloper': 1,
        'designer': 1
    };

    path += '?projection=' + JSON.stringify(projection);

    notificationWindow.show('Retrieving product test details...', true);

    getTagsInfo();

    $http.get(path)
        .success(function (result) {
            if (result._id === weartestId) {
                $scope.weartest = result;

                $scope.reportData.weartestId = $scope.weartest._id;

                getParticipantDetails();

                getSurveyDetails();

                if ($scope.mode === 'editReport') {
                    retrieveSavedReports();
                }

                getImagesetDetailsOfWeartest();

                if ($scope.weartest.automaticRating) {
                    getWeartestRating();
                //  getRatingsGroupWeights();
                    getRatingsGroupWeightsBySurvey();
                } else {
                    $scope.weartestRating = $scope.weartest.rating;
                }
                loadSurveyIds();

                getActivityLogs();

            } else {
                notificationWindow.show('Error. Could not retrieve details of product test', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error. Could not retrieve details of product test', false);
        });
}]);