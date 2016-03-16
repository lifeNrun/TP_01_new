dashboardApp.controller('ReportDisplayCtrl', ['$scope', '$location', 'reportDisplayData', 'notificationWindow',
function ($scope, $location, reportDisplayData, notificationWindow) {
    'use strict';

    var foundUser,
        newGroup,
        infoExist = false,
        surveys = [];
    
    $scope.averages = [];

    $scope.reportData = reportDisplayData.getData();

    $scope.wearAndTearImages = [];

    $scope.absUrl = $location.absUrl();

    if (!$scope.reportData.success) {
        $scope.error = true;
        return;
    }

    var sort_by = function(field, reverse, primer){
        var key = primer ?
           function(x) {return primer(x[field])} :
           function(x) {return x[field]};

       reverse = !reverse ? 1 : -1;

       return function (a, b) {
           return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
         }
    }

    // used for sorting whole data by uploadedById to display the WearAndTear data in order in report
    // since there is a limitation to 3 per iteration in html.
    $scope.reportData.wearAndTear.sort(sort_by('uploadedById', true, function(a){return a}));

    $scope.featuredImages = [];
    var removeTestImage = [];

    for (var i = 0; i < $scope.reportData.wearAndTear.length; i++) {
        foundUser = false;

        for (var j = 0; j < $scope.wearAndTearImages.length; j++) {
            if ($scope.wearAndTearImages[j].uploadedById === $scope.reportData.wearAndTear[i].uploadedById) {
                $scope.wearAndTearImages[j].images.push($scope.reportData.wearAndTear[i]);

                foundUser = true;

                break;
            }
        }

            if (!angular.isUndefined($scope.reportData.wearAndTear[i].featured) && $scope.reportData.wearAndTear[i].featured.length > 0) {
                    $scope.featuredImages.push($scope.reportData.wearAndTear[i]);
                }
            if ((angular.isUndefined($scope.reportData.wearAndTear[i].imageId) || $scope.reportData.wearAndTear[i].imageId.length == 0)) {
                removeTestImage.push(i);
            }

            if (!foundUser) {
            newGroup = {};
            newGroup.uploadedById = $scope.reportData.wearAndTear[i].uploadedById;
            newGroup.images = [];
            newGroup.images.push($scope.reportData.wearAndTear[i]);

            $scope.wearAndTearImages.push(newGroup);
        }
    }

    //Remove image which has no comments
    for (var i = removeTestImage.length-1; i >= 0 ; i--) {
        $scope.reportData.wearAndTear.splice(removeTestImage[i],1);
    }

    if ($scope.reportData.styleNumber) {
        infoExist = true;
        $scope.averages.push({
            text: "Style#:",
            value: $scope.reportData.weartest.styleNumber
        });
    }

    if ($scope.reportData.supplier) {
        infoExist = true;
        $scope.averages.push({
            text: "Supplier:",
            value: $scope.reportData.weartest.supplier
        });
    }

    if ($scope.reportData.factory) {
        infoExist = true;
        $scope.averages.push({
            text: "Factory:",
            value: $scope.reportData.weartest.factory
        });
    }

    if ($scope.reportData.season) {
        infoExist = true;
        $scope.averages.push({
            text: "Season:",
            value: $scope.reportData.weartest.season
        });
    }

    if ($scope.reportData.last) {
        infoExist = true;
        $scope.averages.push({
            text: "Last:",
            value: $scope.reportData.weartest.last
        });
    }

    if ($scope.reportData.productDeveloper) {
        infoExist = true;
        $scope.averages.push({
            text: "Product Developer:",
            value: $scope.reportData.weartest.productDeveloper
        });
    }

    if ($scope.reportData.designer) {
        infoExist = true;
        $scope.averages.push({
            text: "Designer:",
            value: $scope.reportData.weartest.designer
        });
    }


    if (angular.isDefined($scope.reportData.averageHeight)) {
        infoExist = true;
        $scope.averages.push({
            text: "Average Height:",
            value: $scope.reportData.averageHeight
        });
    }

    if (angular.isDefined($scope.reportData.averageAge)) {
        infoExist = true;
        $scope.averages.push({
            text: "Average Age:",
            value: $scope.reportData.averageAge + " years"
        });
    }

    if (angular.isDefined($scope.reportData.averageWeight)) {
        infoExist = true;
        $scope.averages.push({
            text: "Average Weight:",
            value: $scope.reportData.averageWeight
        });
    }

    if (angular.isDefined($scope.reportData.averageTime)) {
        infoExist = true;
        $scope.averages.push({
            text: "Average Time:",
            value: $scope.reportData.averageTime
        });
    }

    if (angular.isDefined($scope.reportData.averageDistance)) {
        infoExist = true;
        $scope.averages.push({
            text: "Average Distance:",
            value: $scope.reportData.averageDistance
        });
    }

    //Report Correction - Remove surveys which have no questions or answers
    //Such a scenario arises when in report creation, user selects and de-selects a survey
    //chart and answers. The survey is still added to the report which should not happen
    for (var i = 0; i < $scope.reportData.surveys.length; i++) {
        if (($scope.reportData.surveys[i].questions && $scope.reportData.surveys[i].questions.length > 0) || ($scope.reportData.surveys[i].answers && $scope.reportData.surveys[i].answers.length > 0)) {
            surveys.push($scope.reportData.surveys[i]);
        }
    }

    $scope.reportData.surveys = surveys.splice(0);

    surveys = [];

    //Calculate the height of the resulting canvas
    var getHeightForResultingCanvas = function(questionData) {
        var legendTexts = [];
        var textLineCountArray = [];
        var words,
            lengthOfLine,
            newLength,
            lines,
            i, j,
            totalLines,
            newHeight;

        if (angular.isDefined(questionData.cumulativeData) && angular.isDefined(questionData.cumulativeData.data)) {
            legendTexts = questionData.cumulativeData.data.slice(0);
        }

        for (i = 0; i < legendTexts.length; i++) {
            words = legendTexts[i].value.split(' ');
            lengthOfLine = 0;
            lines = 1;

            for (j = 0; j < words.length; j++) {
                //Calculate the number of lines that the 
                //legend's text would take
                lengthOfLine = lengthOfLine + words[j].length + 1;

                //Check if the addition of the next word will exceed the limited
                //width of the legend
                newLength = lengthOfLine;

                if ((j + 1) < words.length) {
                    newLength = newLength + words[j + 1].length + 1;
                }

                if (newLength > 24) {
                    lengthOfLine = 0;
                    lines++;
                }
            }

            textLineCountArray[i] = lines;
        }

        //Recalculate the height of the canvas based on the number of lines
        //the legend occupies
        //Only change if the new height is greater than 220 - the height of the donut
        totalLines = 0;

        for (j = 0; j < textLineCountArray.length; j++) {
            totalLines = totalLines + textLineCountArray[j];
        }

        newHeight = totalLines * 17 + 100;

        if (newHeight > 220) {
            return newHeight;
        } else {
            return 220;
        }
    };

    var getHorizontalChartQuestions = function (surveyData) {
        var result = [];
        
        surveyData = JSON.parse(JSON.stringify(surveyData));

        for (var i = 0; i < surveyData.questions.length; i++) {
            if (surveyData.questions[i].type === "Numeric" || surveyData.questions[i].type === "Rating") {
                result.push(surveyData.questions[i]);
            }
        }

        return result;
    };

    var getDonutChartQuestions = function (surveyData) {
        var result = [],
            group = [];

        surveyData = JSON.parse(JSON.stringify(surveyData));

        for (var i = 0; i < surveyData.questions.length; i++) {
            if (surveyData.questions[i].type === "Single Selection" || surveyData.questions[i].type === "Multiple Selection") {
                //Calculate the height of the resulting svg
                surveyData.questions[i].expectedHeight = getHeightForResultingCanvas(surveyData.questions[i]);
                group.push(surveyData.questions[i]);
            }

            if (group.length === 2) {
                result.push(group.slice(0));
                group = [];
            }
        }

        if (group.length !== 0) {
            result.push(group);
        }

        return result;
    };

    var addKeyIfNotExists = function (i, key, versionWeights, chartData)
    {
        var entry,
            color = ["#C4F91E", "#F15838", "#7AC0E5", "#FFF14C", "#FBF6B4", "#2A3A8B", "#FCAF56", "#441B56", "#3094AE", "#DE803D", "#725A8F", "#1076B6", "#80432A"];
        //add key if doesn't exists in versionB
        if (!versionWeights.hasOwnProperty(key)) {
            entry = {
                    key: key,
                    value: 0,
                    color: color[i],
                    displayYLabel: '',
                    percentage: ''
                };
            chartData.push(entry);
            if (!versionWeights[key]) {
                versionWeights[key] = 0;
            }
        }
        return chartData;
    };

    var sortArrayByKey = function(chartDataObj1, chartDataObj2) {
        var chartDataTemp1 = chartDataObj1,
            chartDataTemp2 = chartDataObj2,
            chartDataTemp = [],
            entry;
        for (var i = 0; i < chartDataTemp1.length; i++) {
                for (var j = 0; j < chartDataTemp2.length; j++) {
                    if(chartDataTemp1[i].key === chartDataTemp2[j].key) {
                        entry = {
                                key: chartDataTemp2[j].key,
                                value:chartDataTemp2[j].value,
                                color: chartDataTemp2[j].color,
                                displayYLabel: chartDataTemp2[j].displayYLabel,
                                percentage: chartDataTemp2[j].percentage
                            };
                        chartDataTemp.push(entry);
                    }
                }
            }
        return chartDataTemp;
    };

    var getCumulativeDataForAVsBChart = function ()
    {
            var i,j,
                 chartData = {},
                 returnValue = [],
                 min = 1,
                 max = 5,
                 entry,
                 color,
                 initialStageWeights,
                 finalStageWeights,
                 versionAWeights,
                 versionBWeights,
                 versionCWeights,
                 versionDWeights,
                 versionEWeights,
                 key;
                chartData.data = [];   //A data
                chartData.data1 = []; //B data
                chartData.data2 = [];   //C data
                chartData.data3 = []; //D data
                chartData.data4 = []; //E data
                chartData.dataTemp = [];

                color = ["#C4F91E", "#F15838", "#7AC0E5", "#FFF14C", "#FBF6B4", "#2A3A8B", "#FCAF56", "#441B56", "#3094AE", "#DE803D", "#725A8F", "#1076B6", "#80432A"];


            versionAWeights = $scope.reportData.versionAWeights;
            versionBWeights = $scope.reportData.versionBWeights;
            versionCWeights = $scope.reportData.versionCWeights;
            versionDWeights = $scope.reportData.versionDWeights;
            versionEWeights = $scope.reportData.versionEWeights;

            //For A data
            for (key in versionAWeights) {
                if (versionAWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: versionAWeights[key],
                            color: color[0],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.data.push(entry);
                }
            };
            //For B data
            for (key in versionBWeights) {
                if (versionBWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: versionBWeights[key],
                            color: color[1],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.data1.push(entry);
                }
            };
            //For C data
            for (key in versionCWeights) {
                if (versionCWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: versionCWeights[key],
                            color: color[2],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.data2.push(entry);
                }
            };
            //For D data
            for (key in versionDWeights) {
                if (versionDWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: versionDWeights[key],
                            color: color[3],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.data3.push(entry);
                }
            };
            //For E data
            for (key in versionEWeights) {
                if (versionEWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: versionEWeights[key],
                            color: color[4],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.data4.push(entry);
                }
            };

            //Add key if doesn't exist.
            for (key in versionAWeights) {

                //add key if doesn't exists in versionB
                if (!versionBWeights.hasOwnProperty(key)) {
                    chartData.data1  = addKeyIfNotExists(1, key, versionBWeights, chartData.data1);
                }
                //add key if doesn't exists in versionC
                if (!versionCWeights.hasOwnProperty(key)) {
                    chartData.data2  = addKeyIfNotExists(2, key, versionCWeights, chartData.data2)
                }
                //add key if doesn't exists in versionD
                if (!versionDWeights.hasOwnProperty(key)) {
                    chartData.data3  = addKeyIfNotExists(3, key, versionDWeights, chartData.data3);
                }
                //add key if doesn't exists in versionE
                if (!versionEWeights.hasOwnProperty(key)) {
                    chartData.data4  = addKeyIfNotExists(4, key, versionEWeights, chartData.data4);
                }
            };

           //For B data
            for (key in versionBWeights) {
                //add key if doesn't exists in versionA
                if (!versionAWeights.hasOwnProperty(key)) {
                    chartData.data  = addKeyIfNotExists(0, key, versionAWeights, chartData.data)
                }
                //add key if doesn't exists in versionC
                if (!versionCWeights.hasOwnProperty(key)) {
                    chartData.data2  = addKeyIfNotExists(2, key, versionCWeights, chartData.data2)
                }
                //add key if doesn't exists in versionD
                if (!versionDWeights.hasOwnProperty(key)) {
                    chartData.data3  = addKeyIfNotExists(3, key, versionDWeights, chartData.data3)
                }
                //add key if doesn't exists in versionE
                if (!versionEWeights.hasOwnProperty(key)) {
                    chartData.data4  = addKeyIfNotExists(4, key, versionEWeights, chartData.data4)
                }
            };

            //For C data
            for (key in versionCWeights) {

                //add key if doesn't exists in versionA
                if (!versionAWeights.hasOwnProperty(key)) {
                    chartData.data  = addKeyIfNotExists(0, key, versionAWeights, chartData.data)
                }
                //add key if doesn't exists in versionC
                if (!versionBWeights.hasOwnProperty(key)) {
                    chartData.data1  = addKeyIfNotExists(1, key, versionBWeights, chartData.data1)
                }
                //add key if doesn't exists in versionD
                if (!versionDWeights.hasOwnProperty(key)) {
                    chartData.data3  = addKeyIfNotExists(3, key, versionDWeights, chartData.data3)
                }
                //add key if doesn't exists in versionE
                if (!versionEWeights.hasOwnProperty(key)) {
                    chartData.data4  = addKeyIfNotExists(4, key, versionEWeights, chartData.data4)
                }
            };

            //For D data
            for (key in versionDWeights) {

                //add key if doesn't exists in versionA
                if (!versionAWeights.hasOwnProperty(key)) {
                    chartData.data  = addKeyIfNotExists(0, key, versionAWeights, chartData.data)
                }
                //add key if doesn't exists in versionB
                if (!versionBWeights.hasOwnProperty(key)) {
                    chartData.data1  = addKeyIfNotExists(1, key, versionBWeights, chartData.data1)
                }
                //add key if doesn't exists in versionC
                if (!versionCWeights.hasOwnProperty(key)) {
                    chartData.data2  = addKeyIfNotExists(2, key, versionCWeights, chartData.data2)
                }
                //add key if doesn't exists in versionE
                if (!versionEWeights.hasOwnProperty(key)) {
                    chartData.data4  = addKeyIfNotExists(4, key, versionEWeights, chartData.data4)
                }
            };

            //For E data
            for (key in versionEWeights) {

            //add key if doesn't exists in versionA
                if (!versionAWeights.hasOwnProperty(key)) {
                    chartData.data  = addKeyIfNotExists(0, key, versionAWeights, chartData.data);
                }
                //add key if doesn't exists in versionB
                if (!versionBWeights.hasOwnProperty(key)) {
                    chartData.data1  = addKeyIfNotExists(1, key, versionBWeights, chartData.data1);
                }
                //add key if doesn't exists in versionC
                if (!versionCWeights.hasOwnProperty(key)) {
                    chartData.data2  = addKeyIfNotExists(2, key, versionCWeights, chartData.data2);
                }
                //add key if doesn't exists in versionD
                if (!versionDWeights.hasOwnProperty(key)) {
                    chartData.data3  = addKeyIfNotExists(3, key, versionDWeights, chartData.data3);
                }
            };

            // To keep the data in same order for comparison graph
            chartData.data1 = sortArrayByKey(chartData.data, chartData.data1);
            chartData.data2 = sortArrayByKey(chartData.data, chartData.data2);
            chartData.data3 = sortArrayByKey(chartData.data, chartData.data3);
            chartData.data4 = sortArrayByKey(chartData.data, chartData.data4);

            for (var i = 0; i < chartData.data.length; i++) {
                if(chartData.data[i].value <=0 &&
                chartData.data1[i].value <=0 &&
                chartData.data2[i].value <=0 &&
                chartData.data3[i].value <=0 &&
                chartData.data4[i].value <=0 ) {
                chartData.data.splice(i,1);
                chartData.data1.splice(i,1);
                chartData.data2.splice(i,1);
                chartData.data3.splice(i,1);
                chartData.data4.splice(i,1);
                }
            }
        //The domain of the data
        chartData.domain = [min, max];
        returnValue = JSON.parse(JSON.stringify(chartData));

        return returnValue;
    };

    var getCumulativeDataForInitialVsFinalChart = function ()
    {
            var i,j,
                 chartData = {},
                 returnValue = [],
                 min = 1,
                 max = 5,
                 entry,
                 color,
                 initialStageWeights,
                 finalStageWeights,
                 key;
                chartData.data = [];   //Initial data
                chartData.data1 = []; //final data
                chartData.dataTemp = [];

                color = ["#C4F91E", "#F15838", "#7AC0E5", "#FFF14C", "#FBF6B4", "#2A3A8B", "#FCAF56", "#441B56", "#3094AE", "#DE803D", "#725A8F", "#1076B6", "#80432A"];

            initialStageWeights = $scope.reportData.initialStageWeights;
            finalStageWeights = $scope.reportData.finalStageWeights;


            //For initialStage data
            for (key in initialStageWeights) {
                if (initialStageWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: initialStageWeights[key],
                            color: color[0],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.data.push(entry);
                }

                //add key if doesn't exists in final
                if (!finalStageWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: 0,
                            color: color[1],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.dataTemp.push(entry);
                }
            }

            //For finalStage data
            for (key in finalStageWeights) {
                if (finalStageWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: finalStageWeights[key],
                            color: color[1],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.dataTemp.push(entry);
                }
                //add key if doesn't exists in final
                if (!initialStageWeights.hasOwnProperty(key)) {
                    entry = {
                            key: key,
                            value: 0,
                            color: color[0],
                            displayYLabel: '',
                            percentage: ''
                        };
                    chartData.data.push(entry);
                }
            }

            // To keep the data in same order for comparison graph
            var remove = [];
            for (var i = 0; i < chartData.data.length; i++) {
                for (var j = 0; j < chartData.data.length; j++) {
                    if(chartData.data[i].key === chartData.dataTemp[j].key) {
                        if(chartData.data[i].value === 0 && chartData.dataTemp[j].value === 0){
                            remove.push(i);
                        } else {
                            entry = {
                                    key: chartData.dataTemp[j].key,
                                    value:chartData.dataTemp[j].value,
                                    color: chartData.dataTemp[j].color,
                                    displayYLabel: chartData.dataTemp[j].displayYLabel,
                                    percentage: chartData.dataTemp[j].percentage
                                };
                            chartData.data1.push(entry);
                        }
                    }
                }
            }

            // Remove zero value elements.
            for (var i = 0; i < remove.length; i++) {
                chartData.data.splice(remove[i],1);
            }

        //The domain of the data
        chartData.domain = [min, max];
        returnValue = JSON.parse(JSON.stringify(chartData));

        return returnValue;
    };

    for (var i = 0; i < $scope.reportData.surveys.length; i++) {
        var survey = JSON.parse(JSON.stringify($scope.reportData.surveys[i]));

        survey.horizontalChartQuestions = getHorizontalChartQuestions(survey);
        survey.donutChartQuestions = getDonutChartQuestions(survey);

        surveys.push(survey);
    }

    var getCumulativeDataForRatingGroupWeights = function ()
    {
            var i,
                 chartData = {},
                 returnValue = [],
                 min = 1,
                 max = 5,
                 entry,
                 color,
                 key;

            chartData.data = [];

            color = ["#C4F91E", "#F15838", "#7AC0E5", "#FFF14C", "#FBF6B4", "#2A3A8B", "#FCAF56", "#441B56", "#3094AE", "#DE803D", "#725A8F", "#1076B6", "#80432A"];
            var ratingsGroupWeights = $scope.reportData.ratingsGroupWeights;

            for (key in ratingsGroupWeights) {
                if (ratingsGroupWeights.hasOwnProperty(key)) {
                    if (ratingsGroupWeights[key] > 0) {
                        entry = {
                            key: key,
                            value: ratingsGroupWeights[key],
                            color: color[i],
                            displayYLabel: '',
                            percentage: ''
                        };
                        chartData.data.push(entry);
                    }
                }
            }

            //The domain of the data
            chartData.domain = [min, max];
        returnValue = JSON.parse(JSON.stringify(chartData));

        return returnValue;
    };

    $scope.ratingGroupWeights = getCumulativeDataForRatingGroupWeights();
    $scope.initialVsFinalChart = getCumulativeDataForInitialVsFinalChart();
    $scope.versionWeightsChart = getCumulativeDataForAVsBChart();

    $scope.reportData.surveys = surveys.slice(0);

    $scope.getParticipantName = function (participantId) {
        for (var i = 0; i < $scope.reportData.userData.length; i++) {

            if ($scope.reportData.userData[i]._id === participantId) {
                return $scope.reportData.userData[i].username;
            }
        }

        for (i = 0; i < $scope.reportData.unregisteredUsers.length; i++) {
            if ($scope.reportData.unregisteredUsers[i]._id === participantId) {
                return $scope.reportData.unregisteredUsers[i].fname + ' ' + $scope.reportData.unregisteredUsers[i].lname;
            }
        }

        return 'Unknown User';
    };

    $scope.countPointsForImage = function (image, pointColor) {
        var count = 0;

        for (var i = 0; i < image.selectedDataPoints.length; i++) {
            if (image.selectedDataPoints[i].color === pointColor) {
                count++;
            }
        }

        return count;
    };

    $scope.isFreeFormQuestion = function (question) {
        return question.type === "Free form text";
    };

    $scope.getDivision = function (data, perDivision) {
        var result = [],
            count = 1;

        for (var i = 0; i < data.length; i++) {
            if (i % perDivision === 0) {
                result.push(count);
                count = count + 1;
            }
        }

        return result;
    };

    //Returns the data in a division
    $scope.getDataPerDivision = function (divisionNumber, data, perDivision) {
        var result = [],
            count = 0;

        for (var i = 0; i < data.length; i++) {
            //Divide each image into sets of two
            if (i % perDivision === 0) {
                count = count + 1;
            }

            if (count === divisionNumber) {
                //Current count is same as division number provided
                //Current image belongs to the same division
                result.push(data[i]);
            } else if (count > divisionNumber) {
                //No point in continuing - all data of the requested division have been found
                break;
            }
        }

        return result;
    };

    $scope.getAverageValueInUnit =  function(text, value) {
                switch (text) {
                    case 'Average Height':
                    case 'Average Height:':
                        return Math.floor(value/12) +"' "+ value%12 +'"';
                    case 'Average Age':
                    case 'Average Age:':
                        var valueTemp = value.split(" ");
                        return valueTemp[0] + ' yrs';
                    case 'Average Weight':
                    case 'Average Weight:':
                        return value + ' lbs';
                    case 'Average Time':
                    case 'Average Time:':
                        var valueTemp = value.split(":");
                        return valueTemp[0] + ' hrs ' +
                        ((valueTemp[1] === '00')? '' : valueTemp[1] + ' min ') +
                        ((valueTemp[2] === '00')? '' : valueTemp[2] + ' sec');
                    case 'Average Distance':
                    case 'Average Distance:':
                        return value + ' mi';
                }
        return value;
    }

    $scope.getFeaturedImages = function (data, perDivision) {
        var result = [],
            count = 1;

        for (var i = 0; i < data.length; i++) {
            //Divide each image into sets of two
            if (!angular.isUndefined(data[i].featured) && data[i].featured != "" && count <= perDivision) {
               result.push(data[i]);
               count++;
            } else if (count > perDivision) {
                //No point in continuing - all data of the requested perDivision have been found
                break;
            }
        }

        return result;
    };

    $scope.getStringForArray = function (arrayData) {
        var str = "";

        if (angular.isUndefined(arrayData)) {
            return str;
        }

        for (var i = 0; i < arrayData.length; i++) {
            str = str + arrayData[i];

            if (i <= arrayData.length - 1) {
                str = str + ", ";
            }
        }

        return str.substring(0, (str.lastIndexOf(',')));
    };

    $scope.doesInformationSectionExist = function () {
        return infoExist || angular.isDefined($scope.reportData.occupations) || angular.isDefined($scope.reportData.locations);
    };

    //Last code in controller - ready to display report
    notificationWindow.show('Completed. Report is now ready for display', false);
}]);
