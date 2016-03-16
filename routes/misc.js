/*
    Miscellaneous Routes - Features that are not satisified by calling the API alone
*/

var unirest = require('unirest'),
    async = require('async'),
    _ = require('underscore'),
    config = require('../config');

var parseResponse = function (response, callback) {
    var parsedResponse = {},
        error,
        failed = false;

    if (response.error) {
        if (typeof response.error === 'object') {
            error = JSON.stringify(response.error);
        } else {
            error = response.error;
        }

        console.log('[Vimeo] Error. Could not get a successful response. Error is ' + error);
        console.log('[Vimeo] Error. Response status is ' + response.status);

        failed = true;
    } else {
        if (typeof response.body === 'string') {
            parsedResponse = JSON.parse(response.body);
        } else {
            parsedResponse = response.body;
        }
    }

    callback(failed, parsedResponse);
};

var updateVideo = function (vimeoVideoId, updateWith) {
    unirest
        .patch(config.vimeo.endpoint + '/videos/' + vimeoVideoId)
        .set({
            'Authorization': 'bearer ' + config.vimeo.accessToken,
            'Accept': 'application/vnd.vimeo.*+json;version=3.2'
        })
        .send(updateWith)
        .end(function (response) {
            parseResponse(response, function (result) {
                //Nothing to do for now.
            });
        });
};

var addVideoToAlbum = function (vimeoVideoId) {
    unirest
        .put(config.vimeo.endpoint + '/me/albums/' + config.vimeo.albumId + '/videos/' + vimeoVideoId)
        .set({
            'Authorization': 'bearer ' + config.vimeo.accessToken,
            'Accept': 'application/vnd.vimeo.*+json;version=3.2'
        })
        .end(function (response) {
            parseResponse(response, function (result) {
                //Nothing to do for now.
            });
        });
};

/*
 Returns a Vimeo video upload ticket or the status of the video
*/
exports.getVimeoVideo = function (req, res) {
    var query = req.query,
        vimeoVideoId;

    if (query.status) {
        vimeoVideoId = req.params['vimeoVideoId'];

        //Check video status
        unirest
            .get(config.vimeo.endpoint + '/videos/' + vimeoVideoId)
            .set({
                'Authorization': 'bearer ' + config.vimeo.accessToken,
                'Accept': 'application/vnd.vimeo.*+json;version=3.2'
            })
            .query({
                'fields': 'status'
            })
            .end(function (response) {
                parseResponse(response, function (failed, result) {
                    if (failed) {
                        res.send('Error in determining status', 500);
                    } else {
                        if (result.status === 'available') {
                            //Video is ready and can be viewed
                            res.send('available', 200);
                        } else {
                            //Any other status and return in progress
                            res.send('in progress', 200);
                        }
                    }
                });
            });
    } else {
        //Get a new video upload ticket
        //The API requires a POST call although we are inside a GET request
        unirest
            .post(config.vimeo.endpoint + '/me/videos')
            .set({
                'Authorization': 'bearer ' + config.vimeo.accessToken,
                'Accept': 'application/vnd.vimeo.*+json;version=3.2'
            })
            .query({
                'type': 'streaming'
            })
            .end(function (response) {
                var result = {};

                parseResponse(response, function (failed, parsedResponse) {
                    if (failed) {
                        res.send('Error getting upload ticket', 500);
                    } else {
                        result.upload_link = parsedResponse.upload_link_secure;

                        result.complete_uri = parsedResponse.complete_uri;

                        res.send(result);
                    }
                });
            });
    }
};

exports.getVimeoVideoPath = function (req, res) {
    var complete_uri,
        username,
        weartestId;

    if (typeof req.body === 'string') {
        complete_uri = (JSON.parse(req.body)).complete_uri;
        username = (JSON.parse(req.body)).username;
        weartestId = (JSON.parse(req.body)).weartestId;
    } else {
        complete_uri = req.body.complete_uri;
        username = req.body.username;
        weartestId = req.body.weartestId;
    }

    unirest
        .delete(config.vimeo.endpoint + complete_uri)
        .set({
            'Authorization': 'bearer ' + config.vimeo.accessToken
        })
        .end(function (response) {
            var failed = false,
                location,
                result;
            
            if (response.error) {
                if (typeof response.error === 'object') {
                    error = JSON.stringify(response.error);
                } else {
                    error = response.error;
                }

                console.log('[Vimeo] Error. Could not get details of uploaded video. Error is ' + error);
                console.log('[Vimeo] Error. Response status is ' + response.status);

                failed = true;
            } else {
                location = response.headers.location;

                if (location) {
                    result = {
                        vimeoVideoId: location.substring(location.substring(location.indexOf('/') + 1).indexOf('/') + 2)
                    };
                } else {
                    console.log('[Vimeo] Error. Could not get location of uploaded video.');
                    console.log('[Vimeo] Error. Headers are ' + JSON.stringify(response.headers));

                    failed = true;
                }
            }

            if (failed) {
                res.send('Error getting upload ticket', 500);
            } else {
                //Update the title of the video with the username and the weartest ID to which
                //the video was uploaded to
                updateVideo(result.vimeoVideoId, {
                    'name': username + ' - ' + weartestId
                });

                //Also, group the uploaded video to the respective album
                addVideoToAlbum(result.vimeoVideoId);

                res.send(result);
            }            
        });
};

//Returns an array of tags created by the brand user that is currently logged in
exports.getTagsCreatedByBrand = function (req, res) {
    var user = req.user,
        path = 'http://' + config.api.host + ':' + config.api.port + '/tags',
        query;

    if (!user) {
        return res.send(401);
    } else if (user.utype !== 'Brand' && user.utype !== 'Admin') {
        return res.send(403);
    }

    query = {
        brandUserId: user._id
    };

    async.waterfall([
        function (cb) {
            //Get the tags created by the brands. This gets us the testers tagged by the brand
            //and the tags associated with the testers
            unirest.get(path)
                .query({
                    api_key: config.api.key,
                    query: JSON.stringify(query)
                })
                .end(function (response) {
                    if (response.statusType === 4 || response.statusType === 5) {
                        cb(response);
                    } else {
                        cb(null, response.body);
                    }
                });
        },
        function (tagRecords, cb) {
            //Collect all the tags into a single array
            //Ensure that we do not have duplicates
            var tags = [];

            for (var i = 0; i < tagRecords.length; i++) {
                if (tagRecords[i].tags) {
                    for (var j = 0; j < tagRecords[i].tags.length; j++) {
                        if (tags.indexOf(tagRecords[i].tags[j]) === -1) {
                            tags.push(tagRecords[i].tags[j]);
                        }
                    }
                } else {
                    tagRecords[i].tags = [];
                }
            }

            return cb(null, tags, tagRecords)
        }
    ], function (err, tags, tagRecords) {
        if (err) {
            res.status(500).send({
                error: 'An error occurred fetching the tags of the brand'
            });
        } else {
            res.status(200).send({
                tags: tags,
                tagRecords: tagRecords
            });
        }
    });
};

//Returns an array of tags for a tester created by the brand user logged in
exports.getBrandTagsForTester = function (req, res) {
    var user = req.user,
        testerId = req.params.testerId,
        path = 'http://' + config.api.host + ':' + config.api.port + '/tags',
        query;

    if (!user) {
        return res.send(401);
    } else if (user.utype !== 'Brand' && user.utype !== 'Admin') {
        return res.send(403);
    } else if (!testerId) {
        return res.send(400);
    }

    query = {
        brandUserId: user._id,
        testerUserId: testerId
    };

    unirest.get(path)
        .query({
            api_key: config.api.key,
            query: JSON.stringify(query)
        })
        .end(function (response) {
            var tags = [];

            if (response.statusType === 4 || response.statusType === 5) {
                res.status(500).send({
                    error: 'An error occurred fetching the tags for the tester'
                });
            } else {
                if (_.isArray(response.body) && response.body.length === 1) {
                    tags = response.body[0].tags || [];
                }

                res.send(tags);
            }
        });
};

//Updates the tags for a tester - returns the updated tags back
exports.updateBrandTagForTester = function (req, res) {
    var user = req.user,
        testerId = req.params.testerId,
        updatedTags = req.body;

    if (!user) {
        return res.send(401);
    } else if (user.utype !== 'Brand' && user.utype !== 'Admin') {
        return res.send(403);
    } else if (!testerId) {
        return res.send(400, 'No tester specified');
    } else if (!_.isArray(updatedTags)) {
        return res.send(400, 'No tags to update');
    }

    async.waterfall([
        function (cb) {
            //Get the existing tag record for the tester
            var path = 'http://' + config.api.host + ':' + config.api.port + '/tags',
                query = {
                    brandUserId: user._id,
                    testerUserId: testerId
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
                        if (_.isArray(response.body) && response.body.length === 1) {
                            cb(null, response.body[0], false);
                        } else {
                            cb(null, {}, true);
                        }
                    }
                });
        },
        function (tagRecord, isNew, cb) {
            var path;
            if (isNew) {
                //Brand has never tagged this user before. Create the record
                tagRecord = {
                    brandUserId: user._id,
                    testerUserId: testerId,
                    tags: updatedTags,
                    createUserId: user._id,
                    createUsername: user.username,
                    modifiedUserId: user._id,
                    modifiedUsername: user.username
                };

                path = 'http://' + config.api.host + ':' + config.api.port + '/tags';

                unirest.post(path)
                    .header('Accept', 'application/json')
                    .query({
                        api_key: config.api.key
                    })
                    .send(tagRecord)
                    .end(function (response) {
                        if (response.statusType === 4 || response.statusType === 5) {
                            cb(response);
                        } else {
                            cb(null, response.body);
                        }
                    });
            } else {
                path = 'http://' + config.api.host + ':' + config.api.port + '/tags/' + tagRecord._id;

                tagRecord.tags = updatedTags;
                tagRecord.modifiedUserId = user._id;
                tagRecord.modifiedUsername = user.username;
                tagRecord.modifiedDate = new Date();

                unirest.put(path)
                    .header('Accept', 'application/json')
                    .query({
                        api_key: config.api.key
                    })
                    .send(tagRecord)
                    .end(function (response) {
                        if (response.statusType === 4 || response.statusType === 5) {
                            cb(response);
                        } else {
                            cb(null, response.body);
                        }
                    });
            }
        }
    ], function (err, tagRecord) {
        if (err) {
            res.status(500).send({
                error: 'An error occurred updating the tags for the tester'
            });
        } else {
            res.send(tagRecord.tags);
        }
    });
};

//Updates the tags for many testers - returns only a HTTP status
exports.addBrandTagForTestersInBulk = function (req, res) {
    var payload = req.body,
        user = req.user;

    if (!user) {
        return res.send(401);
    } else if (user.utype !== 'Brand' && user.utype !== 'Admin') {
        return res.send(403);
    } else if ((!payload.testerIds || !payload.tag) || (!_.isArray(payload.testerIds) || payload.tag.length <=0)) {
        return res.send(400);
    }

    async.eachLimit(payload.testerIds, 3,
        function (testerId, cb) {
            async.waterfall([
                function (cb1) {
                    //Get the existing tag record for the tester
                    var path = 'http://' + config.api.host + ':' + config.api.port + '/tags',
                        query = {
                            brandUserId: user._id,
                            testerUserId: testerId
                        };

                    unirest.get(path)
                        .query({
                            api_key: config.api.key,
                            query: JSON.stringify(query)
                        })
                        .end(function (response) {
                            if (response.statusType === 4 || response.statusType === 5) {
                                cb1(response);
                            } else {
                                if (_.isArray(response.body) && response.body.length === 1) {
                                    cb1(null, response.body[0], false);
                                } else {
                                    cb1(null, {}, true);
                                }
                            }
                        });
                },
                function (tagRecord, isNew, cb2) {
                    var path;

                    if (isNew) {
                        //Brand has never tagged this user before. Create the record
                        tagRecord = {
                            brandUserId: user._id,
                            testerUserId: testerId,
                            tags: [payload.tag],
                            createUserId: user._id,
                            createUsername: user.username,
                            modifiedUserId: user._id,
                            modifiedUsername: user.username
                        };

                        path = 'http://' + config.api.host + ':' + config.api.port + '/tags';

                        unirest.post(path)
                            .header('Accept', 'application/json')
                            .query({
                                api_key: config.api.key
                            })
                            .send(tagRecord)
                            .end(function (response) {
                                if (response.statusType === 4 || response.statusType === 5) {
                                    cb2(response);
                                } else {
                                    cb2(null, response.body);
                                }
                            });
                    } else {
                        path = 'http://' + config.api.host + ':' + config.api.port + '/tags/' + tagRecord._id;

                        //Add the tag only if it does not exist already
                        if (tagRecord.tags) {
                            if (tagRecord.tags.indexOf(payload.tag) === -1) {
                                tagRecord.tags.push(payload.tag);
                            } else {
                                return cb2();
                            }
                        } else {
                            tagRecord.tags = [payload.tag];
                        }

                        tagRecord.modifiedUserId = user._id;
                        tagRecord.modifiedUsername = user.username;
                        tagRecord.modifiedDate = new Date();

                        unirest.put(path)
                            .header('Accept', 'application/json')
                            .query({
                                api_key: config.api.key
                            })
                            .send(tagRecord)
                            .end(function (response) {
                                if (response.statusType === 4 || response.statusType === 5) {
                                    cb(response);
                                } else {
                                    cb();
                                }
                            });
                    }
                }
            ], function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            });
        },
        function (err) {
            if (err) {
                console.log(err);

                res.status(500).send({
                    error: 'An error occurred updating the tags of the testers'
                });
            } else {
                res.send(200);
            }
        }
    );
};
