var unirest = require('unirest'),
    async = require('async'),
    config = require('../config');

//Give the answer and the possible choices, function returns
//the weight for that answer
var _getWeightForAnswer = function (answer, possibleAnswers) {
    for (var i = 0; i < possibleAnswers.length; i++) {
        if (possibleAnswers[i].key === answer.value) {
            return possibleAnswers[i].weight || 0;
        }
    }


    return 0;
};
var _setAvgRatingForQuestionByGroup = function (surveyId, question, submissions, questionWeightsAll, questionWeightsBySurvey, ratingGroupBySurvey) {
    var sum = 0,
        count = 0,
        avg = 0,
        questionWeights = {},
        questionWeightsTemp = {};

    for (var i = 0; i < submissions.length; i++) {
        if (submissions[i].surveyId !== surveyId) {
            continue;
        }

        for (var j = 0; j < submissions[i].answers.length; j++) {
            if (submissions[i].answers[j].questionId === question._id) {
                sum += _getWeightForAnswer(submissions[i].answers[j], question.options.values);

                count++;

                //We are not getting the same question in the same survey again
                break;
            }
        }
    }

    if (count > 0) {
        avg = sum / count;
    }

    if (!questionWeightsAll[question.stage]) {
        questionWeightsAll[question.stage] = [];
    }
    if (!questionWeightsAll[question.version]) {
        questionWeightsAll[question.version] = [];
    }
    if (!questionWeights[question.ratingGroup]) {
        questionWeights[question.ratingGroup] = [];
    }
    if (!ratingGroupBySurvey[surveyId]) {
        ratingGroupBySurvey[surveyId] = [];
    }
    if (!questionWeightsTemp[question.version]) {
        questionWeightsTemp[question.version] = [];
    }
    if (!questionWeightsTemp[question.stage]) {
        questionWeightsTemp[question.stage] = [];
    }
    if (!questionWeightsBySurvey[surveyId]) {
        questionWeightsBySurvey[surveyId] = [];
    }

    questionWeights[question.ratingGroup].push(avg);
    questionWeightsAll[question.stage].push(questionWeights);
    questionWeightsAll[question.version].push(questionWeights);
    if(question.version === undefined || question.version === 'A' || question.version.length === 0) {
        ratingGroupBySurvey[surveyId].push(questionWeights);
        questionWeightsTemp[question.stage].push(questionWeights);
    }
    questionWeightsTemp[question.version].push(questionWeights);
    questionWeightsBySurvey[surveyId].push(questionWeightsTemp);
    return questionWeightsAll;
};

//Given the question and the submissions, this function calculates
//the average weight for that question based on all the answers for that question
var _setAvgRatingForQuestion = function (surveyId, question, submissions, questionWeights) {
    var sum = 0,
        count = 0,
        avg = 0;

    for (var i = 0; i < submissions.length; i++) {
        if (submissions[i].surveyId !== surveyId) {
            continue;
        }

        for (var j = 0; j < submissions[i].answers.length; j++) {
            if (submissions[i].answers[j].questionId === question._id) {
                sum += _getWeightForAnswer(submissions[i].answers[j], question.options.values);

                count++;

                //We are not getting the same question in the same survey again
                break;
            }
        }
    }

    if (count > 0) {
        avg = sum / count;
    }

    if (!questionWeights[question.ratingGroup]) {
        questionWeights[question.ratingGroup] = [];
    }

    questionWeights[question.ratingGroup].push(avg);

    return questionWeights;
};

var getWeartestRatings = function (req, res) {
    var weartestId = req.params.weartestId,
        user = req.user;

    if (!weartestId) {
        res.status(400).send({
            error: 'You need to provide a weartestId'
        });

        return;
    }

    async.waterfall([
        function (cb) {
            //First function - get the surveys associated with the weartest
            //and the rating group weights
            var path = 'http://' + config.api.host + ':' + config.api.port + '/weartest/' + weartestId,
                projection = {
                    ratingGroupWeights: 1,
                    productSurveys: 1,
                    owner: 1,
                    brand: 1
                };

            unirest.get(path)
                .query({
                    api_key: config.api.key,
                    projection: JSON.stringify(projection)
                })
                .end(function (response) {
                    if (response.statusType === 4 || response.statusType === 5) {
                        cb(response);
                    } else {
                        cb(null, response.body);
                    }
                });
        },
        function (weartest, cb) {
            //Second function - check user authorization to access that weartest
            if (user.utype !== 'Admin') {
                if (weartest.owner !== user.username && weartest.brand !== user.company) {
                    cb(new Error('Error. Requested weartest does not have authorization information associated with it'));

                    return;
                }
            }

            //Looks like the user is authorized to access the weartest
            cb(null, weartest);
        },
        function (weartest, cb) {
            //Third function - Get the details of the surveys fetched in function 1
            var surveyIds,
                path = 'http://' + config.api.host + ':' + config.api.port + '/surveys',
                query;

            if (weartest.productSurveys) {
                surveyIds = weartest.productSurveys.map(function (survey) {
                    return survey.survey_id;
                });

                query = {
                    _id: {
                        '$in': surveyIds
                    }
                };

                unirest.get(path)
                    .query({
                        api_key: config.api.key,
                        query: JSON.stringify(query)
                    })
                    .end(function (response) {
                        if (response.statusType === 4 || response.statusType === 5) {
                            cb(response);
                        } else {
                            cb(null, weartest, response.body);
                        }
                    });
            } else {
                //No surveys - rating is zero
                cb(null, weartest, []);
            }
        },
        function (weartest, surveys, cb) {
            //Function 4 - Get the submissions for each survey + weartest combination
            var surveyIds,
                path = 'http://' + config.api.host + ':' + config.api.port + '/surveys_submitted',
                query;

            if (surveys.length > 0) {
                surveyIds = surveys.map(function (survey) {
                    return survey._id;
                });

                query = {
                    weartestId: weartest._id,
                    surveyId: {
                        '$in': surveyIds
                    }
                };

                unirest.get(path)
                    .query({
                        api_key: config.api.key,
                        query: JSON.stringify(query)
                    })
                    .end(function (response) {
                        if (response.statusType === 4 || response.statusType === 5) {
                            cb(response);
                        } else {
                            cb(null, weartest, surveys, response.body);
                        }
                    });
            } else {
                //No surveys - no submissions either
                cb(null, weartest, [], []);
            }
        },
        function (weartest, surveys, answers, cb) {
            var sum = 0,
                count = 0,
                avg = 0,
                rating,
                questionWeights = {},
                questionWeightsAll = {},
                questionWeightsBySurvey = {},
                ratingGroupBySurvey = {},
                key, key1, key2, i , j;


            //Function 5 - Algorithm to get the rating
            if (answers.length > 0) {
                //1. For each question (relevant for rating), calculate the average
                //weights using the submitted answers
                for (i = 0; i < surveys.length; i++) {
                    for (j = 0; j < surveys[i].questions.length; j++) {
                        //Is this question relevant for rating?
                        if (surveys[i].questions[j].options.considerForRating === true) {
                            if((!("version" in surveys[i].questions[j])) || surveys[i].questions[j].version === 'A' || surveys[i].questions[j].version.length === 0) {
                                questionWeights = _setAvgRatingForQuestion(surveys[i]._id, surveys[i].questions[j], answers, questionWeights);
                            }
                        }
                    }
                }

                //2. For each rating group, calculate the average of step 1.
                for (key in questionWeights) {
                    if (questionWeights.hasOwnProperty(key)) {
                        sum = 0;
                        count = 0;
                        avg = 0;

                        for (i = 0; i < questionWeights[key].length; i++) {
                            if (questionWeights[key][i] > 0) {
                                sum += questionWeights[key][i];
                                count++;
                            }
                        }

                        if (count > 0) {
                            avg = sum / count;
                        }

                        questionWeights[key] = avg;
                    }
                }

                //3. Multiply each of step 2 by the weight for that rating group
                //4. Add all the step 3's to get the final rating
                sum = 0;

                for (key in questionWeights) {
                    if (questionWeights.hasOwnProperty((key))) {
                        for (i = 0; i < weartest.ratingGroupWeights.length; i++) {
                            if (weartest.ratingGroupWeights[i].name === key) {
                                sum += weartest.ratingGroupWeights[i].weight * questionWeights[key];
                            }
                        }
                    }
                }

                //Multiply and divide by 2 to get it rounded to the nearest 0.5
                //Divide by 100 since the weights multipled earlier are a %
                rating = Math.round(sum / 100 * 2) / 2;

                cb(null, rating);
            } else {
                //No survey submissions - rating is zero
                cb(null, 0);
            }
        }
    ], function (err, rating) {
        if (err) {
            res.status(500).send({
                error: 'An error occurred fetching the ratings of the weartest'
            });
        } else {
            res.status(200).send({
                rating: rating
            });
        }
    });
};

var getRatingsGroupWeights = function (req, res) {
    var weartestId = req.params.weartestId,
        user = req.user;

    if (!weartestId) {
        res.status(400).send({
            error: 'You need to provide a weartestId'
        });

        return;
    }

    async.waterfall([
        function (cb) {
            //First function - get the surveys associated with the weartest
            //and the rating group weights
            var path = 'http://' + config.api.host + ':' + config.api.port + '/weartest/' + weartestId,
                projection = {
                    ratingGroupWeights: 1,
                    productSurveys: 1,
                    owner: 1,
                    brand: 1
                };

            unirest.get(path)
                .query({
                    api_key: config.api.key,
                    projection: JSON.stringify(projection)
                })
                .end(function (response) {
                    if (response.statusType === 4 || response.statusType === 5) {
                        cb(response);
                    } else {
                        cb(null, response.body);
                    }
                });
        },
        function (weartest, cb) {
            //Second function - check user authorization to access that weartest
            if (user.utype !== 'Admin') {
                if (weartest.owner !== user.username && weartest.brand !== user.company) {
                    cb(new Error('Error. Requested weartest does not have authorization information associated with it'));

                    return;
                }
            }

            //Looks like the user is authorized to access the weartest
            cb(null, weartest);
        },
        function (weartest, cb) {
            //Third function - Get the details of the surveys fetched in function 1
            var surveyIds,
                path = 'http://' + config.api.host + ':' + config.api.port + '/surveys',
                query;

            if (weartest.productSurveys) {
                surveyIds = weartest.productSurveys.map(function (survey) {
                    return survey.survey_id;
                });

                query = {
                    _id: {
                        '$in': surveyIds
                    }
                };

                unirest.get(path)
                    .query({
                        api_key: config.api.key,
                        query: JSON.stringify(query)
                    })
                    .end(function (response) {
                        if (response.statusType === 4 || response.statusType === 5) {
                            cb(response);
                        } else {
                            cb(null, weartest, response.body);
                        }
                    });
            } else {
                //No surveys - rating is zero
                cb(null, weartest, []);
            }
        },
        function (weartest, surveys, cb) {
            //Function 4 - Get the submissions for each survey + weartest combination
            var surveyIds,
                path = 'http://' + config.api.host + ':' + config.api.port + '/surveys_submitted',
                query;

            if (surveys.length > 0) {
                surveyIds = surveys.map(function (survey) {
                    return survey._id;
                });

                query = {
                    weartestId: weartest._id,
                    surveyId: {
                        '$in': surveyIds
                    }
                };

                unirest.get(path)
                    .query({
                        api_key: config.api.key,
                        query: JSON.stringify(query)
                    })
                    .end(function (response) {
                        if (response.statusType === 4 || response.statusType === 5) {
                            cb(response);
                        } else {
                            cb(null, weartest, surveys, response.body);
                        }
                    });
            } else {
                //No surveys - no submissions either
                cb(null, weartest, [], []);
            }
        },
        function (weartest, surveys, answers, cb) {
            var sum = 0,
                count = 0,
                avg = 0,
                rating,
                questionWeights = {},
                questionWeightsAll = {},
                questionWeightsBySurvey = {},
                ratingGroupBySurvey = {},
                key, i , j;

            //Function 5 - Algorithm to get the rating
            if (answers.length > 0) {
                //1. For each question (relevant for rating), calculate the average
                //weights using the submitted answers
                for (i = 0; i < surveys.length; i++) {
                    for (j = 0; j < surveys[i].questions.length; j++) {
                        //Is this question relevant for rating?
                        if (surveys[i].questions[j].options.considerForRating === true) {
                            questionWeights = _setAvgRatingForQuestion(surveys[i]._id, surveys[i].questions[j], answers, questionWeights);
                            _setAvgRatingForQuestionByGroup(surveys[i]._id, surveys[i].questions[j], answers, questionWeightsAll, questionWeightsBySurvey, ratingGroupBySurvey);
                        }
                    }
                }
                 if (!questionWeightsBySurvey["ratinggroup"]) {
                    questionWeightsBySurvey["ratinggroup"] = [];
                }
                questionWeightsBySurvey["ratinggroup"].push(ratingGroupBySurvey);

                //Calculating weights for stage(Initial & final) and version (A, B, C, D & E)
                var qroupQuestionWeights,
                        stageVersionWeights = {};
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
                    // After merged key values, calculate average for respective key (rating group)
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
                        qroupQuestionWeights[key] = Math.round(avg);
                    }
                    //store all rating group in stage and version level.
                    if (!stageVersionWeights[key1]) {
                        stageVersionWeights[key1] = [];
                    }
                    stageVersionWeights[key1].push(qroupQuestionWeights);
                }

                //2. For each rating group, calculate the average of step 1.
                for (key in questionWeights) {
                    if (questionWeights.hasOwnProperty(key)) {
                        sum = 0;
                        count = 0;
                        avg = 0;

                        for (i = 0; i < questionWeights[key].length; i++) {
                            if (questionWeights[key][i] > 0) {
                                sum += questionWeights[key][i];
                                count++;
                            }
                        }

                        if (count > 0) {
                            avg = sum / count;
                        }

                        questionWeights[key] = avg;

                    }
                }
                if (!stageVersionWeights["ratinggroup"]) {
                    stageVersionWeights["ratinggroup"] = [];
                }
                stageVersionWeights["ratinggroup"].push(questionWeights);
                cb(null, stageVersionWeights);
            } else {
                //No survey submissions - rating is zero
                cb(null, 0);
            }
        }
    ], function (err, stageVersionWeights) {
        if (err) {
            res.status(500).send({
                error: 'An error occurred fetching the ratings group values of the weartest'
            });
        } else {
            res.status(200).send({
                questionWeights: stageVersionWeights
            });
        }
    });
};

var getRatingsGroupWeightsBySurvey = function (req, res) {
    var weartestId = req.params.weartestId,
        user = req.user;

    if (!weartestId) {
        res.status(400).send({
            error: 'You need to provide a weartestId'
        });

        return;
    }

    async.waterfall([
        function (cb) {
            //First function - get the surveys associated with the weartest
            //and the rating group weights
            var path = 'http://' + config.api.host + ':' + config.api.port + '/weartest/' + weartestId,
                projection = {
                    ratingGroupWeights: 1,
                    productSurveys: 1,
                    owner: 1,
                    brand: 1
                };

            unirest.get(path)
                .query({
                    api_key: config.api.key,
                    projection: JSON.stringify(projection)
                })
                .end(function (response) {
                    if (response.statusType === 4 || response.statusType === 5) {
                        cb(response);
                    } else {
                        cb(null, response.body);
                    }
                });
        },
        function (weartest, cb) {
            //Second function - check user authorization to access that weartest
            if (user.utype !== 'Admin') {
                if (weartest.owner !== user.username && weartest.brand !== user.company) {
                    cb(new Error('Error. Requested weartest does not have authorization information associated with it'));

                    return;
                }
            }

            //Looks like the user is authorized to access the weartest
            cb(null, weartest);
        },
        function (weartest, cb) {
            //Third function - Get the details of the surveys fetched in function 1
            var surveyIds,
                path = 'http://' + config.api.host + ':' + config.api.port + '/surveys',
                query;

            if (weartest.productSurveys) {
                surveyIds = weartest.productSurveys.map(function (survey) {
                    return survey.survey_id;
                });

                query = {
                    _id: {
                        '$in': surveyIds
                    }
                };

                unirest.get(path)
                    .query({
                        api_key: config.api.key,
                        query: JSON.stringify(query)
                    })
                    .end(function (response) {
                        if (response.statusType === 4 || response.statusType === 5) {
                            cb(response);
                        } else {
                            cb(null, weartest, response.body);
                        }
                    });
            } else {
                //No surveys - rating is zero
                cb(null, weartest, []);
            }
        },
        function (weartest, surveys, cb) {
            //Function 4 - Get the submissions for each survey + weartest combination
            var surveyIds,
                path = 'http://' + config.api.host + ':' + config.api.port + '/surveys_submitted',
                query;

            if (surveys.length > 0) {
                surveyIds = surveys.map(function (survey) {
                    return survey._id;
                });

                query = {
                    weartestId: weartest._id,
                    surveyId: {
                        '$in': surveyIds
                    }
                };

                unirest.get(path)
                    .query({
                        api_key: config.api.key,
                        query: JSON.stringify(query)
                    })
                    .end(function (response) {
                        if (response.statusType === 4 || response.statusType === 5) {
                            cb(response);
                        } else {
                            cb(null, weartest, surveys, response.body);
                        }
                    });
            } else {
                //No surveys - no submissions either
                cb(null, weartest, [], []);
            }
        },
        function (weartest, surveys, answers, cb) {
            var sum = 0,
                count = 0,
                avg = 0,
                rating,
                questionWeights = {},
                questionWeightsAll = {},
                questionWeightsBySurvey = {},
                ratingGroupBySurvey = {},
                key, i , j;

            //Function 5 - Algorithm to get the rating
            if (answers.length > 0) {
                //1. For each question (relevant for rating), calculate the average
                //weights using the submitted answers
                for (i = 0; i < surveys.length; i++) {
                    for (j = 0; j < surveys[i].questions.length; j++) {
                        //Is this question relevant for rating?
                        if (surveys[i].questions[j].options.considerForRating === true) {
                            _setAvgRatingForQuestionByGroup(surveys[i]._id, surveys[i].questions[j], answers, questionWeightsAll, questionWeightsBySurvey, ratingGroupBySurvey);
                        }
                    }
                }

                if (!questionWeightsBySurvey["ratinggroup"]) {
                    questionWeightsBySurvey["ratinggroup"] = [];
                }
                questionWeightsBySurvey["ratinggroup"].push(ratingGroupBySurvey);
                cb(null, questionWeightsBySurvey);
            } else {
                //No survey submissions - rating is zero
                cb(null, 0);
            }
        }
    ], function (err, questionWeightsBySurvey) {
        if (err) {
            res.status(500).send({
                error: 'An error occurred fetching the ratings group values of the weartest'
            });
        } else {
            res.status(200).send({
                questionWeights: questionWeightsBySurvey
            });
        }
    });
};

module.exports = {
    getWeartestRatings: getWeartestRatings,
    getRatingsGroupWeights: getRatingsGroupWeights,
    getRatingsGroupWeightsBySurvey: getRatingsGroupWeightsBySurvey
};
