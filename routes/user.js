/*
    Eventually, plan to move this into a folder named controller
    For now, it resides in the routes folder
    This controller handles requests mainly related to the user collection
    but requires more than the properties of a user collection
*/
var CONSOLE_PREFIX = '[User Controller]';

var async = require('async'),
    unirest = require('unirest'),
    config = require('../config');

//Returns the testers to draft based on the search criteria
//Also returns the number of weartests the participant is an 'on team' member of
var getTestersToDraft = function (req, res) {
    var requestOwner = req.user;
    var originalQuery = JSON.parse(req.query.query);

    if (requestOwner.utype !== 'Brand' && requestOwner.utype !== 'Admin') {
        res.status(401).send('You are not authorized to make this request');

        return;
    }

    //Make sure that only testers that are available to test are retrieved
    if(!originalQuery.$and) {
        originalQuery.$and = [];
    }
    originalQuery.$and.push({$or: [
        {
            unavailableToTest: false
        },
        {
            unavailableToTest: {
                $exists: false
            }
        }
    ]});

    //eliminate testers exclusive to other brands
    if (requestOwner.utype === 'Brand') {
      var brandCompany = 'E' + requestOwner.company.toUpperCase();
      originalQuery.$and.push({$or: [
        {
            'brandAssociation': {
                '$exists': false
            }
        },
        {
            'brandAssociation': {
                '$size': 0
            }
        },
        {
            'brandAssociation': brandCompany
        }
      ]});
    }

    originalQuery = JSON.stringify(originalQuery);

    async.waterfall([
        function (callback) {
            //First, get the regular response for the draft search request
            unirest.get('http://' + config.api.host + ':' + config.api.port + config.endpoints.user)
                .query({
                    api_key: config.api.key,
                    query: originalQuery,
                    projection: req.query.projection,
                    orderBy: req.query.orderBy
                })
                .end(function (response) {
                    if (response.statusType === 4 || response.statusType === 5) {
                        callback(response);
                    } else {
                        callback(null, response.body);
                    }
                });
        },
        function (users, callback) {
            //Now, get all the active weartests for the users
            var userIds = [],
                query = {},
                projection = {},
                options = {};

            users.forEach(function (user) {
                userIds.push(user._id);
            });

            query = {
                'participants.status': 'on team',
                'status': 'active'
            };

            projection.participants = 1;

            unirest.get('http://' + config.api.host + ':' + config.api.port + config.endpoints.weartest)
                .query({
                    api_key: config.api.key,
                    query: JSON.stringify(query),
                    projection: JSON.stringify(projection)
                })
                .end(function (response) {
                    var resultArray = [];
                    if (response.statusType === 4 || response.statusType === 5) {
                        callback(response);
                    } else {
                        for (i = 0; i < response.body.length; i++) {
                            resultArray.push(response.body[i]);
                        }
                        callback(null, users, resultArray);
                    }
                });
        },
        function (users, weartests, callback) {
            //Get the list of on team participants and determine the number of weartests
            //that a participant is active in
            var numActiveTests = {},
                usersWithCounts = [];

            weartests.forEach(function (weartest) {
                weartest.participants.forEach(function (participant) {
                    if (participant.status === 'on team') {
                        if (numActiveTests[participant.userIdkey]) {
                            numActiveTests[participant.userIdkey]++;
                        } else {
                            numActiveTests[participant.userIdkey] = 1;
                        }
                    }
                });
            });

            //Finally, attach the count to the response to be sent back
            users.forEach(function (user) {
                if (numActiveTests[user._id]) {
                    user.participationCount = numActiveTests[user._id];
                } else {
                    user.participationCount = 0;
                }

                usersWithCounts.push(user);
            });

            callback(null, usersWithCounts);
        }
        ], function (err, result) {
        if (err) {
            console.error(CONSOLE_PREFIX, JSON.stringify(err));

            res.status(500).send('An error occurred while processing request');

            return;
        }

        res.send(result);
    });
};

module.exports = {
    getTestersToDraft: getTestersToDraft
};
