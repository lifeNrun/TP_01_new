dashboardApp.controller('WeartestSurveyCtrl', ['$scope', '$http', '$filter', '$routeParams',  '$location', 'downloadAsCSV', 'notificationWindow', 'Surveys', 'splitRequest',
function ($scope, $http, $filter, $routeParams, $location, downloadAsCSV, notificationWindow, Surveys, splitRequest) {
    'use strict';

    //Surveys of the current Wear Test that have been submitted
    var path,
        projection,
        weartestId = $routeParams['itemId'],
        submittedSurveys = [],
        participantDetails = [],
        unregisteredUsers = [],
        unregisteredUserIds = [],
        originalSurveyDetails = [];

    $scope.weartest = {};

    $scope.absUrl = $location.absUrl();

    //In the middle of loading data
    $scope.loading = true;
    $scope.preparingDataForExport = false;

    //Ascending or descending sort - default descending
    $scope.reverse = true;

    //Selective user displ  ay - default show all user entries
    $scope.userFilter = "All";

    //Selective survey display
    $scope.surveyFilter = null;

    //Keeps track of the column currently being the basis of sorting - default is the date of creation of the answer
    $scope.currentSortColumn = "createdDate";

    $scope.weartestOnTeamParticipants = [];

    $scope.chartLimit = 3;

    $scope.logLimit = 15;

    $scope.selectedSurveyQuestions = [];

    $scope.exportLink = '';

    //Collects the "on team" participants of the Wear Test
    var getWearTestOnTeamParticipants = function () {
        var i;

        $scope.weartestOnTeamParticipants.push({
            userIdkey: 'All',
            username: 'All'
        });

        for (i = 0; i < $scope.weartest.participants.length; i++) {
            if ($scope.weartest.participants[i].status === 'on team') {
                $scope.weartestOnTeamParticipants.push($scope.weartest.participants[i]);
            }
        }
    };

    var _getUnregisteredUserNames = function () {
        if (unregisteredUserIds.length === 0) {
            return;
        }

        var path = '/api/mesh01/unregisteredUsers',
            query = {
                '_id': {
                    '$in': unregisteredUserIds
                }
            };

        var promise = splitRequest(path, query, '_id', unregisteredUserIds);

        promise.then(
            function (result) {
                if (angular.isArray(result)) {
                    unregisteredUsers = result;
                }
            }
        );
    };

    var getParticipantDetails = function (next) {
        var path = '/api/mesh01/users',
            query,
            promise,
            participantIds = [],
            participants = $scope.weartest.participants,
            projection,
            i;

        if (participants.length == 0) {
            //skip requesting details
            participantDetails = [];
            next();
        }
    
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
            'user_imageset': 1,
            'height': 1,
            'weight': 1
        };

        notificationWindow.show('Getting information on participants of product test...', true);

        promise = splitRequest(path, query, '_id', participantIds, projection);

        promise.then(
            function (results) {
                if (angular.isArray(results)) {
                    participantDetails = results;

                    notificationWindow.show('Information on participants received.', false);
                    
                } else {
                    notificationWindow.show('Error retrieving details of participants of product test', false);
                }
                next();
            },
            function (err) {
                console.log(err);

                notificationWindow.show('Error retrieving details of participants of product test', false);
                next();
            }
        );
    };
  
    //Get the submitted surveys
    var getSubmittedSurveys = function () {
        var path,
            surveyIds = [],
            query,
            i;

        for (i = 0; i < $scope.weartest.productSurveys.length; i++) {
            surveyIds.push($scope.weartest.productSurveys[i].survey_id)
        }

        path = '/api/mesh01/surveys_submitted';

        query = {
            'weartestId': weartestId,
            'surveyId': {
                '$in': surveyIds
            }
        };

        path += '?query=' + JSON.stringify(query);

        notificationWindow.show('Retrieving submitted surveys...', true);

        $http.get(path)
            .success(function (result) {
                if (angular.isArray(result)) {
                    var path,
                        query,
                        surveyIds = [],
                        i;

                    submittedSurveys = result;

                    //Now, proceed to get information on the surveys themselves
                    //Collect all the survey Ids
                    for (i = 0; i < submittedSurveys.length; i++) {
                        //Add the ID only if it does not exist
                        if (surveyIds.indexOf(submittedSurveys[i].surveyId) === -1) {
                            //Entry does not exist. Add it.
                            surveyIds.push(submittedSurveys[i].surveyId);
                        }

                        //Check if the submission was by an unregistered user
                        if (submittedSurveys[i].unregisteredUserId) {
                            //Yes it is. Remember it
                            if (unregisteredUserIds.indexOf(submittedSurveys[i].unregisteredUserId) === -1) {
                                unregisteredUserIds.push(submittedSurveys[i].unregisteredUserId);
                            }
                        }
                        
                        //for each question prepend the question number
                        for(var j = 0; j < submittedSurveys[i].answers.length; j++) {
                            submittedSurveys[i].answers[j].questionName =
                                (j+1) + '. ' + submittedSurveys[i].answers[j].questionName;
                        }
                    }

                    if (surveyIds.length === 0) {
                        notificationWindow.show('No surveys have been submitted', false);

                        $scope.loading = false;

                        return;
                    }

                    //Silently fetch the names of the unregistered users
                    _getUnregisteredUserNames();

                    path = '/api/mesh01/surveys';

                    query = {
                        '_id': {
                            '$in': surveyIds
                        }
                    };

                    path += '?query=' + JSON.stringify(query);

                    notificationWindow.show('Retrieving information on the surveys associated with the product test...', true);

                    //Get details of the surveys now
                    $http.get(path)
                        .success(function (result) {
                            if (angular.isArray(result)) {
                                originalSurveyDetails = result;
                
                                getWearTestOnTeamParticipants();

                                //Retrieve participants' details
                                getParticipantDetails( function() {
                                
                                    $scope.loading = false;
                
                                    notificationWindow.show('Successfully retrieved all details', false);
                
                                    //Prepare the data for exporting
                                    $scope.prepareDataForExport();
                
                                    //Prepare the complete set of surveys for exporting
                                    $scope.prepareAllDataForExport();
                                  
                                });
                
                            } else {
                                notificationWindow.show('Error retrieving details on associated surveys', false);
                            }
                        })
                        .error(function (err) {
                            notificationWindow.show('Error retrieving details on associated surveys', false);
                        });
                } else {
                    notificationWindow.show('Error retrieving details on submitted surveys', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error retrieving details on submitted surveys', false);
            });
    };

    //Custom filter based on the selected user and survey
    $scope.customFilter = function (entry) {
        //Check if all user entries to be shown
        if ($scope.userFilter === "All") {
            //Check for a specific survey answer
            if (entry.surveyId === $scope.surveyFilter) {
                return true;
            }
        } else if (entry.userId === $scope.userFilter) {
            //Check for a specific survey answer
            if (entry.surveyId === $scope.surveyFilter) {
                return true;
            }
        }

        //All other cases it is false
        return false;
    };

    //Prepare the data in csv format
    $scope.prepareDataForExport = function () {
        var columnHeaders,
            columnKeys,
            answers,
            rowEntry = {},
            csvString,
            submissions = [];

        $scope.preparingDataForExport = true;

        //If data is still loading, nothing to do
        if ($scope.loading === true) {
            $scope.preparingDataForExport = true;
            return;
        }

        //Prepare the data
        columnHeaders = ['Date', 'User', 'Question', 'Response', 'Comment'];

        columnKeys = ['createdDate', 'username', 'questionName', 'value', 'comment'];

        for (var i = 0; i < submittedSurveys.length; i++) {
            answers = submittedSurveys[i].answers.slice(0);

            for (var j = 0; j < answers.length; j++) {

                //Verify that that entry is valid as per the filter
                if ($scope.customFilter(answers[j]) === false) {
                    //Skip this entry
                    continue;
                }

                rowEntry = {};
                rowEntry.createdDate = $filter('date')(answers[j].createdDate, 'MM/dd/yy');
                rowEntry.username = $scope.getUserNameForId(answers[j].userId);
                rowEntry.questionName = answers[j].questionName;
                if (answers[j].type === "Multiple Selection") {
                    rowEntry.value = answers[j].valueArray;
                } else {
                    rowEntry.value = answers[j].value;
                }
                rowEntry.comment = answers[j].comment;

                submissions.push(rowEntry);
            }
        }

        //Get the CSV format
        csvString = downloadAsCSV(columnHeaders, columnKeys, submissions);
        $scope.exportLink = csvString;

        $scope.preparingDataForExport = false;
    };

    //Finds the weight for the answer
    $scope.getAnswerWeight = function (options, value) {
        if (options == undefined || options.values == undefined) {
            return null;
        }
        
        for (var i = 0; i < options.values.length; i++) {
            if (options.values[i].value === value) {
                return options.values[i].weight;
            }
        }
        return null;
    }
  
    //Finds the question by id
    $scope.getQuestion = function (questions, id) {
        if (questions == undefined) {
            return null;
        }
        
        for (var i = 0; i < questions.length; i++) {
            if (questions[i]._id === id) {
                return questions[i];
            }
        }
        return null;
    }
  
    $scope.getAgeFromBirthday = function (dateOfBirth) {  
        if (!dateOfBirth) {
            return;
        }
    
        dateOfBirth = +new Date(dateOfBirth);    
        return ~~((Date.now() - dateOfBirth) / (31557600000));
    };
  
    //Prepare the data in csv format
    $scope.prepareAllDataForExport = function () {
        var initialHeaders,
            columnHeaders,
            columnKeys,
            answers,
            rowEntry = {},
            headerEntry = {},
            csvString,
            submissions = [],
            surveyName,
            questionId,
            questionName,
            questionKey,
            surveyQuestions,
            surveyQuestion,
            weightKey,
            questionsMapped = {},
            triggerDates = {},
            surveysProcessed = {},
            surveyId,
            appendSurveyHeader,
            originalQuestions = {},
            user = {};

        $scope.preparingDataForExport = true;

        //If data is still loading, nothing to do
        if ($scope.loading === true) {
            $scope.preparingDataForExport = false;

            return;
        }

        //Initial headers and columns keys
        initialHeaders = ['Tester', 'Age', 'Gender', 'Shoe Size', 'Shoe Width', 'Shirt Size', 'Jacket Size', 'Glove Size',
                'Waist', 'Inseam', 'Height', 'Weight', 'Survey'];

        columnKeys = ['username', 'userage', 'usergender', 'usershoeSize', 'usershoeWidth', 'usershirtSize', 'userjacketSize', 'usergloveSize',
            'userwaist', 'userinseam', 'userheight', 'userweight', 'surveyName'];

        //get triggerDate values for all surveys. We will need it to sort the output
        for (var i = 0; i < $scope.weartest.productSurveys.length; i++) {
            triggerDates[$scope.weartest.productSurveys[i].survey_id] = new Date($scope.weartest.productSurveys[i].triggerDate);
        }

        //get questions from original surveys
        for (var i = 0; i < originalSurveyDetails.length; i++) {
            originalQuestions[originalSurveyDetails[i]._id] = originalSurveyDetails[i].questions;
        }

        for (var i = 0; i < submittedSurveys.length; i++) {
          console.log(submittedSurveys[i].createUsername);
            surveyId = submittedSurveys[i].surveyId;
            appendSurveyHeader = false;

            if (surveysProcessed[surveyId] == undefined || !surveysProcessed[surveyId]) {
                surveysProcessed[surveyId] = true;
                appendSurveyHeader = true;
            }
          
            surveyName = submittedSurveys[i].surveyName;
            answers = submittedSurveys[i].answers.slice(0);
    
            user = $scope.getUserInfoForId(submittedSurveys[i].userId);
          
            rowEntry = {};
            rowEntry.username = user.username;
            rowEntry.userage = $scope.getAgeFromBirthday(user.dateOfBirth);
            rowEntry.usergender = user.gender;
            rowEntry.usershoeSize = user.shoeSize;
            rowEntry.usershoeWidth = user.shoeWidthStr;
            rowEntry.usershirtSize = user.shirtSize;
            rowEntry.userjacketSize = user.jacketSize;
            rowEntry.usergloveSize = user.gloveSize;
            rowEntry.userwaist = user.waistMeasurement;
            rowEntry.userinseam = user.inseamLength;
            rowEntry.userheight = user.height;
            rowEntry.userweight = user.weight;
            rowEntry.surveyName = surveyName;
            rowEntry.triggerDate = triggerDates[surveyId];
            rowEntry.surveyId = surveyId;
          
            //make it appear at the same block later during sorting
            headerEntry = {
                isHeader : true,
                triggerDate : rowEntry.triggerDate,
                surveyId : surveyId,
                asArray : []
            };
            
            if (appendSurveyHeader) {
                //copy initial configured headers to the header-like row entry
                for (var k = 0; k < initialHeaders.length; k++) {
                    headerEntry[columnKeys[k]] = initialHeaders[k];
                    headerEntry.asArray.push(initialHeaders[k]);
                }
            }     
          
            surveyQuestions = originalQuestions[surveyId];
    
            for (var j = 0; j < answers.length; j++) {
                questionId = answers[j].questionId;
                surveyQuestion = $scope.getQuestion(surveyQuestions, questionId);

                //if the submitted survey has a question that no longer exists in the survey, skip it
                if(surveyQuestion == null) {
                    rowEntry = null;
                    if (appendSurveyHeader) {
                        appendSurveyHeader = false;
                        surveysProcessed[surveyId] = false;
                    }
                    break;
                }
            
                questionName = (j+1)+'. '+surveyQuestion.question;
    
                questionKey = "Q" + j;
                weightKey = "W" + j;
                if (questionsMapped[questionKey] == undefined) {
                    questionsMapped[questionKey] = questionKey;
              
                    //add Question header mapping
                    columnKeys.push(questionKey);
                    
                    //add Weight header mapping
                    columnKeys.push(weightKey);
                }
                if (appendSurveyHeader) {
                    headerEntry[questionKey] = questionName;
                    //add Question name to the array
                    headerEntry.asArray.push(questionName);
                    //add blank value to the array as a placeholder for weight column
                    headerEntry.asArray.push("");
                }
            
                if (answers[j].type === "Multiple Selection") {
                    rowEntry[questionKey] = answers[j].valueArray;
                    rowEntry[weightKey] = null;
                } else if (answers[j].type === "Single Selection") {
                    rowEntry[questionKey] = answers[j].value;
                    rowEntry[weightKey] = $scope.getAnswerWeight(surveyQuestion.options, answers[j].value);
                } else if (answers[j].type === "Numeric" || answers[j].type === "Rating") {
                    rowEntry[questionKey] = answers[j].value;
                    rowEntry[weightKey] = answers[j].value
                } else {
                    rowEntry[questionKey] = answers[j].value;
                    rowEntry[weightKey] = null;
                }    
            }
            if (appendSurveyHeader) {
                submissions.push(headerEntry);
            }
            if (rowEntry != null) {
                submissions.push(rowEntry);
            }
        }

        //order by triggerDate ascending
        submissions.sort( function (a, b) {
            if (a.triggerDate > b.triggerDate) {
                return 1;
            } else if (a.triggerDate < b.triggerDate) {
                return -1;
            }

            //then by surveyId, in case there are two different surveys with the same triggerDate
            if (a.surveyId > b.surveyId) {
                return 1;
            } else if (a.surveyId < b.surveyId) {
                return -1;
            }
    
            //then by header
            if (b.isHeader) {
                return 1;
            } else if (a.isHeader) {
                return -1;
            }
      
            //and then by username, to make it consistent
            if (a.username > b.username) {
                return 1;
            } else if (a.username < b.username) {
                return -1;
            }
            return 0;
        });
    
        //set csv column headers to the first header in the sorted result
        columnHeaders = submissions[0].asArray;
    
        //and finally remove the very first header-like values row
        submissions = submissions.slice(1);
    
        //Get the CSV format
        csvString = downloadAsCSV(columnHeaders, columnKeys, submissions);
        $scope.exportLinkAll = csvString;

        $scope.preparingDataForExport = false;
    };
  
    //For the survey, given the question, prepare the data for the chart to display the data visually
    $scope.getCumulativeDataForChart = function (questionId) {
        var i,
            j,
            k,
            returnValue = [],
            questions,
            question,
            answers,
            surveyFilteredAnswers,
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

        if ($scope.loading === true) {
            return;
        }

        //Get the questions of the selected survey
        questions = $scope.selectedSurveyQuestions;

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
        surveySubmissions = $scope.getSurveySubmissions().slice(0);

        if (question.type === "Numeric" || question.type === "Rating") {
            //Get all the answers of that survey (irrespective of user)
            surveyFilteredAnswers = [];
            max = 0;
            value = 0;
            count = 0;

            for (i = 0; i < surveySubmissions.length; i++) {
                //Check if the submission adheres to the filter
                if (surveySubmissions[i].surveyId === $scope.surveyFilter) {
                    //Next, check if the answer is for the question that we are processing currently
                    if (surveySubmissions[i].questionId === questionId) {
                        surveyFilteredAnswers.push(surveySubmissions[i]);
                    }
                }
            }

            for (i = 0; i < surveyFilteredAnswers.length; i++) {
                if (angular.isUndefined(surveyFilteredAnswers[i].value) || surveyFilteredAnswers[i].value === "" || surveyFilteredAnswers[i].value === null) {
                    continue;
                }

                value = parseInt(surveyFilteredAnswers[i].value, 10);

                //Get the answer with the maximum value
                if (max < value) {
                    max = value+1;
                }

                //Get the answer with the least value
                // I subtract 1 from the min so the bar always has length.
                

                if (min === undefined) {
                    min = value-1;
                } else if (value < min) {
                    min = value-1;
                } 


                count = count + 1;
            }

            //In case there is only one answer, then keep minimum to zero.
            if (count === 1) {
                min = 0;
            }
        }

        answers = [];

        for (i = 0; i < surveySubmissions.length; i++) {
            //Check if the submission adheres to the filter
            if ($scope.customFilter(surveySubmissions[i]) === true) {
                //Next, check if the answer is for the question that we are processing currently
                if (surveySubmissions[i].questionId === questionId) {
                    answers.push(surveySubmissions[i]);
                }
            }
        }

        if (answers.length === 0) {
            return returnValue;
        }

        //Depending on the question type, prepare the data
        chartData = {};
        if (question.type === "Numeric" || question.type === "Rating") {
            //Will contain the average value
            chartData.data = [];
            average = 0;
            sum = 0;
            value = 0;
            count = 0;

            for (i = 0; i < answers.length; i++) {
                if (angular.isUndefined(answers[i].value) || answers[i].value === "" || answers[i].value === null) {
                    continue;
                }

                value = parseInt(answers[i].value, 10);

                sum = sum + value;

                count = count + 1;
            }

            if (count !== 0) {
                //average = Math.floor(sum / count);
                //average = Math.round(sum / count);
                average = sum / count;
                average = average.toFixed(1);
            } else {
                average = min;
            }

            chartData.data.push(average);

            //The domain of the data
            chartData.domain = [min, max];
        } else if (question.type === "Multiple Selection") {
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

                //If the user has not selected any option, ignore
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
        } else if (question.type === "Single Selection") {
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

    //Returns the questions of the selected survey
    $scope.getSelectedSurveyQuestions = function () {
        var i,
            duplicateQuestions = [];

        $scope.selectedSurveyQuestions = [];

        //Find the details of the selected survey
        if (angular.isUndefined($scope.surveyFilter)) {
            return;
        }

        for (i = 0; i < originalSurveyDetails.length; i++) {
            if (originalSurveyDetails[i]._id === $scope.surveyFilter) {
                $scope.selectedSurveyQuestions = originalSurveyDetails[i].questions.slice(0);
                break;
            }
        }

        //Remove all questions of type free form
        duplicateQuestions = $scope.selectedSurveyQuestions.slice(0);
        $scope.selectedSurveyQuestions = [];

        for (i = 0; i < duplicateQuestions.length; i++) {
            if (duplicateQuestions[i].type === "Free form text") {
                continue;
            }

            $scope.selectedSurveyQuestions.push(duplicateQuestions[i]);
        }
    };

    //Returns the username for the user Id
    $scope.getUserNameForId = function (userId) {
        var i,
            participants;

        if ($scope.loading) {
            return;
        }

        participants= $scope.weartest.participants.slice(0);

        for (i = 0; i < participants.length; i++) {
            if (participants[i].userIdkey === userId) {
                return participants[i].username;
            }
        }

        for (i = 0; i < unregisteredUsers.length; i++) {
            if (unregisteredUsers[i]._id === userId) {
                return unregisteredUsers[i].fname + ' ' + unregisteredUsers[i].lname;
            }
        }

        //Not found in participant list?
        return 'Unknown User';
    };

    //Returns the user info for the user Id
    $scope.getUserInfoForId = function (userId) {
        var i,
            participants,
            user = { username : 'Unknown User'};

        if ($scope.loading) {
            return user;
        }

        participants = participantDetails;

        for (i = 0; i < participants.length; i++) {
      
            if (participants[i]._id === userId) {
                user = participants[i];
                return user;
            }
        }

        for (i = 0; i < unregisteredUsers.length; i++) {
            if (unregisteredUsers[i]._id === userId) {
                user.username = unregisteredUsers[i].fname + ' ' + unregisteredUsers[i].lname;
                return user;
            }
        }

        //Not found in participant list?
        return user;
    };

    //Returns the filtered survey details
    $scope.getSurveySubmissions = function () {
        var selectedSurveyAnswers = [],
            i,
            k;

        //If data is still loading, return
        if ($scope.loading === true) {
            return selectedSurveyAnswers;
        }

        //Collect all the submissions for the survey
        for (i = 0; i < submittedSurveys.length; i++) {
            selectedSurveyAnswers = selectedSurveyAnswers.concat(submittedSurveys[i].answers);
        }

        return selectedSurveyAnswers;
    };

    //Returns the survey name for the survey Id
    $scope.getSurveyName = function (surveyId) {
        var i;

        if ($scope.loading) {
            return;
        }

        for (i = 0; i < $scope.weartest.productSurveys.length; i++) {
            if ($scope.weartest.productSurveys[i].survey_id === surveyId) {
                return $scope.weartest.productSurveys[i].surveyName;
            }
        }
    };

    //Returns the value of the entry on the basis of which the sort needs to be carried out
    $scope.predicate = function (submission) {
        switch ($scope.currentSortColumn) {
            case "createdDate":
                return submission.createdDate;

            case "userId":
                return $scope.getUserNameForId(submission.userId);

            case "question":
                return submission.questionName;

            case "value":
                return submission.value;

            case "comment":
                return submission.comment;
        }
    };

    //Current sort by column
    $scope.changeSortOrder = function (sortByColumn) {
        //If the sortByColumn is the current column that we are sorting
        //by, then toggle the ascending / descending sort feature
        if ($scope.currentSortColumn === sortByColumn) {
            $scope.reverse = !$scope.reverse;
        } else {
            $scope.currentSortColumn = sortByColumn;
            $scope.reverse = true;
        }
    };

    //Check if the column provided is the sort by column
    $scope.checkSortOrder = function (sortByColumn, sortNature) {
        if ($scope.currentSortColumn === sortByColumn) {
            //Check the ascending nature
            if ($scope.reverse === false && sortNature === "ascending") {
                return true;
            } else if ($scope.reverse === true && sortNature === "descending") {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    $scope.increaseChartDisplayLimit = function () {
        if ($scope.chartLimit > $scope.selectedSurveyQuestions.length) {
            return;
        }

        $scope.chartLimit += 2;
    };

    $scope.increaseLogDisplayLimit = function () {
        if ($scope.logLimit > ($scope.getSurveySubmissions()).length) {
            return;
        }

        $scope.logLimit += 15;
    };

    $scope.getQuestionNumber = function (originalIndex) {
        return Surveys.getQuestionNumber(originalIndex + 1, $scope.selectedSurveyQuestions);
    };

    $scope.prependQuestionNumber = function (questionName) {
        var i,
            questionNo = '';

        $scope.getSelectedSurveyQuestions();

        for (i = 0; i < $scope.selectedSurveyQuestions.length; i++) {
            if ($scope.selectedSurveyQuestions[i].question === questionName) {
                questionNo = $scope.getQuestionNumber(i);
                break;
            }
        }

        return questionNo+'. '+questionName;
    };

    path = '/api/mesh01/weartest/' + weartestId;

    projection = {
        '_id': 1,
        'participants': 1,
        'productSurveys': 1
    };

    path += '?projection=' + JSON.stringify(projection);

    notificationWindow.show('Getting latest product test details...', true);

    $http.get(path)
        .success(function (result) {
            if (result._id === weartestId) {
                $scope.weartest = result;

                //Set default value for selected survey
                if ($scope.weartest.productSurveys.length > 0) {
                    $scope.surveyFilter = $scope.weartest.productSurveys[0].survey_id;
                    getSubmittedSurveys();
                } else {
                    notificationWindow.show('This product test has no surveys associated with it', false);
                }
            } else {
                notificationWindow.show('Error retrieving product test details', false);
            }
        })
        .error(function (err) {
            notificationWindow.show('Error retrieving product test details', false);
        });
}
]);
