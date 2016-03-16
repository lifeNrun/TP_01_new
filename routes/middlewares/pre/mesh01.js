'use strict';

var config = require('../../../config'),
    url = require('url'),
    _ = require('underscore'),
    brand = 'mesh01',
    handler = {};

/*
Function
    Handles straightforward requests
Description
    Handler for a simple request for a single record or multiple records - each of same collection
*/
function processSimpleRequest(request) {
    var query = request.query.query || {},

        projection = request.query.projection || {},

        limit = request.query.limit || 0,

        orderBy = request.query.orderBy || {},

        hierarchy = url.parse(request.url).pathname.split('/'),

        //Remove any query parameters to the request
        collectionName = hierarchy[3],

        recordId = hierarchy[4],

        path = '/' + collectionName,

        method = request.method,

        body,
        options;

    if (recordId) {
        recordId = recordId.split('?')[0];

        path += '/' + recordId;
    }

    if (typeof query === 'string') {
        query = JSON.parse(query);
    }

    if (typeof projection === 'string') {
        projection = JSON.parse(projection);
    }

    if (typeof orderBy === 'string') {
        orderBy = JSON.parse(orderBy);
    }

    if (typeof limit === 'string') {
        limit = parseInt(limit, 10);
    }

    if (method !== 'GET') {
        body = JSON.stringify(request.body);
    } else {
        body = '';
    }

    options = {
        host: config.api.host,
        path: path,
        port: config.api.port,
        query: query,
        projection: projection,
        limit: limit,
        orderBy: orderBy,
        data: body
    };

    return options;
}

/*
Function
    Activity Logs handler
Description
    Handler for activityLogs collection
*/
handler.activityLogs = function (request, callback) {
    var hierarchy = url.parse(request.url).pathname.split('/'), 
        user = request.user,
        method = request.method;

    if (!user) {
        callback(new Error('Unauthorized Access'));

        return;
    }

    if (method === 'GET') {
        //Check if requesting for a feature
        if ((hierarchy[4] && hierarchy[4] !== 'feature') || !hierarchy[4]) {
            request.preparedOptions = processSimpleRequest(request);
        }

        callback();
    } else if (method === 'POST') {
        request.body['createUserId'] = user._id;
        request.body['createUsername'] = user.username;
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;

        request.preparedOptions = processSimpleRequest(request);

        callback();
    } else if (method === 'PUT') {
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;
        request.body['modifiedDate'] = new Date();

        request.body['id'] = request.body['_id'];

        delete request.body['_id'];

        request.preparedOptions = processSimpleRequest(request);

        callback();
    }
};

/*
Function
    Participant Roster Update Handler
Description 
    Handler for updates to participant roster
*/
handler.bulkEmail = function (request, callback) {
    var user = request.user,
        method = request.method;

    if (!user) {
        callback(new Error('Unauthorized Access'));

        return;
    } else if (user.utype === 'Tester') {
        callback(new Error('Unauthorized Access'));

        return;
    }

    if (method !== 'POST') {
        callback(new Error('Method type not supported'));

        return;
    }

    request.preparedOptions = processSimpleRequest(request);

    //Temporary fix - since the endpoint is not correctly named
    request.preparedOptions.path = '/bulk-emails';

    callback();
};

/*
Function
    Configuration Handler
Description 
    Handler for application cinfiguration updates
*/
handler.configuration = function (request, callback) {
    var method = request.method;
    var user = request.user;
    var noAuthReqConfig = ['SURVEY_ANSWER_CHART_COLORS'];
    var query = request.query.query || {};

    query = typeof query === 'string' ? JSON.parse(query) : query;

    if (user.utype !== 'Admin') {
        if (noAuthReqConfig.indexOf(query.key) === -1) {
            callback(new Error('Unauthorized Access'));

            return;
        }
    }

    request.preparedOptions = processSimpleRequest(request);

    callback();
};

/*
Function
    Cloudinary Image / Vimeo video Deletion Handler
Description 
    Handler for deletion of images / videos uploaded to cloudinary / vimeo
    Handle is called "images" because API has /images handler
*/
handler.images = function (request, callback) {
    var method = request.method;

    if (method !== 'DELETE') {
        callback(new Error('Method type not supported'));
    }

    request.preparedOptions = processSimpleRequest(request);

    callback();
};

/*
Function
    Imageset handler
Description
    Handler for imagesets collection
*/
handler.imagesets = function (request, callback) {
    var hierarchy = url.parse(request.url).pathname.split('/'),
        user = request.user,
        userType = user.utype,
        method = request.method;

    if (!user) {
        callback(new Error('Unauthorized Access'));

        return;
    }

    if (method === 'GET') {
        //Check if requesting for a feature
        if ((hierarchy[4] && hierarchy[4] !== 'feature') || !hierarchy[4]) {
            request.preparedOptions = processSimpleRequest(request);
        }

        callback();
    } else if (method === 'POST') {
        if (userType === 'Tester') {
            callback(new Error('Unauthorized Access'));

            return;
        }

        request.body['createUserId'] = user._id;
        request.body['createUsername'] = user.username;
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;

        request.preparedOptions = processSimpleRequest(request);

        callback();
    } else if (method === 'PUT') {
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;
        request.body['modifiedDate'] = new Date();

        request.body['id'] = request.body['_id'];

        delete request.body['_id'];

        request.preparedOptions = processSimpleRequest(request);

        callback();
    } else if (method === 'DELETE') {
        if (user.utype === 'Tester') {
            //Testers cannot delete imagesets
            callback(new Error('Unauthorized Access'));

            return;
        }

        request.preparedOptions = processSimpleRequest(request);

        callback();
    }
};

/*
Function
    Participant Roster Update Handler
Description 
    Handler for updates to participant roster
*/
handler.rosterUpdate = function (request, callback) {
    var user = request.user,
        method = request.method;

    if (!user) {
        callback(new Error('Unauthorized Access'));

        return;
    } else if (user.utype === 'Tester') {
        callback(new Error('Unauthorized Access'));

        return;
    }

    if (method !== 'POST') {
        callback(new Error('Method type not supported'));

        return;
    }

    request.preparedOptions = processSimpleRequest(request);

    //Temporary fix - since the endpoint is not correctly named
    request.preparedOptions.path = '/roster-updates';

    callback();
};


/*
Function
    Share survey
Description 
    Handle for sharing surveys
*/
handler.shareSurvey = function (request, callback) {
    var user = request.user,
        method = request.method;

    if (!user) {
        callback(new Error('Unauthorized Access'));

        return;
    } else if (user.utype === 'Tester') {
        callback(new Error('Unauthorized Access'));

        return;
    }

    if (method !== 'POST') {
        callback(new Error('Method type not supported'));

        return;
    }

    request.preparedOptions = processSimpleRequest(request);

    callback();
};

/*
Function
    Surveys handler
Description
    Handler for surveys collection
*/
handler.surveys = function (request, callback) {
    var hierarchy = url.parse(request.url).pathname.split('/'),
        user = request.user,
        userType,
        method = request.method;

    if (method === 'GET') {
        //Check if requesting for a feature
        if ((hierarchy[4] && hierarchy[4] !== 'feature') || !hierarchy[4]) {
            request.preparedOptions = processSimpleRequest(request);

            if (!_.isEmpty(request.preparedOptions.projection)) {
                //Project the allowed attribute to allow the post request middleware
                //to check if the current user is allowed to request the survey
                request.preparedOptions.projection['type'] = 1;
                request.preparedOptions.projection['allowed'] = 1;
                request.preparedOptions.projection['isPublic'] = 1;
            }

            callback();
        }
    } else if (method === 'POST') {

        if (!user) {
            callback(new Error('Unauthorized Access'));

            return;
        }

        userType = user.utype;

        if (userType === 'Tester') {
            callback(new Error('Unauthorized Access'));

            return;
        } else if (userType === 'Brand') {
            //Brand users cannot create public surveys
            request.body['isPublic'] = false;
        }

        if (!request.body['type'] || request.body['type'] === null || userType === 'Brand') {
            //By default, Wear Test Survey will be created
            //Also, Brand users can only create Wear Test Surveys
            request.body['type'] = 'Wear Test Survey';
        }

        if (request.body['type'] === 'Activity') {
            //Activity surveys do not have any category
            request.body['category'] = '';
        }

        if (!(!user.company || user.company === null)) {
            request.body['allowed'] = [user.company];
        }

        request.body['createUserId'] = user._id;
        request.body['createUsername'] = user.username;
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;

        request.preparedOptions = processSimpleRequest(request);

        callback();
    } else if (method === 'PUT') {
        if (!user) {
            callback(new Error('Unauthorized Access'));

            return;
        }

        userType = user.utype;

        if (userType === 'Tester') {
            callback(new Error('Unauthorized Access'));

            return;
        } else if (userType === 'Brand') {
            if (request.body['allowed'].indexOf(user.company) === -1) {
                //Brand user cannot change other brand's surveys
                callback(new Error('Unauthorized Access'));

                return;
            }

            //Brand user cannot change these attributes
            delete request.body['isPublic'];
            delete request.body['type'];
        }

        //Ensure that these protected fields are not modified
        //They can only be set once the survey is created
        delete request.body['allowed'];
        delete request.body['createUserId'];
        delete request.body['createUsername'];

        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;
        request.body['modifiedDate'] = new Date();

        request.body['id'] = request.body['_id'];

        delete request.body['_id'];

        request.preparedOptions = processSimpleRequest(request);

        callback();
    } else if (method === 'DELETE') {
        if (!user) {
            callback(new Error('Unauthorized Access'));

            return;
        }

        userType = user.utype;

        if (user.utype === 'Tester') {
            //Testers cannot delete imagesets
            callback(new Error('Unauthorized Access'));

            return;
        }

        request.preparedOptions = processSimpleRequest(request);

        callback();
    }
};

/*
Function
    Submitted Surveys handler
Description
    Handler for surveys_submitted collection
*/
handler.surveys_submitted = function (request, callback) {
    var hierarchy = url.parse(request.url).pathname.split('/'),
        user = request.user,
        method = request.method;

    if (method === 'GET') {
        //Check if requesting for a feature
        if ((hierarchy[4] && hierarchy[4] !== 'feature') || !hierarchy[4]) {
            request.preparedOptions = processSimpleRequest(request);

            callback();
        }
    } else if (method === 'POST') {

        if (!request.body['unregisteredUserId']) {
            request.body['createUserId'] = user._id;
            request.body['modifiedUserId'] = user._id;
            request.body['createUsername'] = user.username;
            request.body['modifiedUsername'] = user.username;
        } else {
            request.body['createUserId'] = request.body['unregisteredUserId'];
            request.body['modifiedUserId'] = request.body['unregisteredUserId'];
        }

        request.preparedOptions = processSimpleRequest(request);

        callback();
    }
};

/*
Function
    Unregistered users handler
Description
    Handler for unregisteredUsers collection
*/
handler.unregisteredUsers = function (request, callback) {
    var hierarchy = url.parse(request.url).pathname.split('/'),
        user = request.user,
        method = request.method;

    if (method === 'GET' || method === 'POST') {
        //Check if requesting for a feature
        if ((hierarchy[4] && hierarchy[4] !== 'feature') || !hierarchy[4]) {
            request.preparedOptions = processSimpleRequest(request);

            callback();
        }
    } else {
        callback(new Error('Method type not supported'));

        return;
    }
};

/*
Function
    User handler
Description
    Handler for users collection
*/
handler.users = function (request, callback) {
    var hierarchy = url.parse(request.url).pathname.split('/'),
        user = request.user,
        userType,
        brandCompany,
        orQuery,
        unavailToTest,
        method = request.method;

    if (!user) {
        callback(new Error('Unauthorized Access'));

        return;
    }

    userType = user.utype;
    
    unavailToTest = [
        {
           unavailableToTest: false
        },
        {
            unavailableToTest: {
                '$exists': false
            }
        }
    ];

    if (method === 'GET') {
        //Check if requesting for a feature
        if ((hierarchy[4] && hierarchy[4] !== 'feature') || !hierarchy[4]) {
            request.preparedOptions = processSimpleRequest(request);
        }

        if (userType === 'Brand') {
            //Brand users cannot see exclusive testers, unless they explicitly ask for the user (with their id)

            if (!request.preparedOptions.query['_id']) {
                brandCompany = 'E' + user.company.toUpperCase();

                orQuery = [
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
                ];

                request.preparedOptions.query['$and'] = [];

                request.preparedOptions.query['$and'].push({
                    '$or': orQuery
                });

                //Do not return users that are not available (testers can become
                //temporarily unavailable)
                request.preparedOptions.query['$and'].push({
                    '$or': unavailToTest
                });

                if (request.preparedOptions.query['$or']) {
                    //Query already contains a $or.
                    //To work with multiple $or operators, use $and
                    orQuery = JSON.parse(JSON.stringify(request.preparedOptions.query['$or']));

                    request.preparedOptions.query['$and'].push({
                        '$or': orQuery
                    });

                    //Remove the old $or query
                    delete request.preparedOptions.query['$or'];
                }
            }
        } else {
            request.preparedOptions.query['$and'] = [];

            //Do not return users that are not available (testers can become
            //temporarily unavailable)
            request.preparedOptions.query['$and'].push({
                '$or': unavailToTest
            });

            if (request.preparedOptions.query['$or']) {
                //Query already contains a $or.
                //To work with multiple $or operators, use $and
                orQuery = JSON.parse(JSON.stringify(request.preparedOptions.query['$or']));
 
                request.preparedOptions.query['$and'].push({
                    '$or': orQuery
                });
 
                //Remove the old $or query
                delete request.preparedOptions.query['$or'];
            }
        }

        //No type of user can request to see the password
        if (!request.preparedOptions.projection) {
            request.preparedOptions.projection = {};
        }

        request.preparedOptions.projection.password = 0;

        if (!request.preparedOptions.query) {
            request.preparedOptions.query = {};
        }

        callback();
    } else if (method === 'PUT') {
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;
        request.body['modifiedDate'] = new Date();

        request.body['id'] = request.body['_id'];

        delete request.body['_id'];

        request.preparedOptions = processSimpleRequest(request);

        callback();
    }
};

/*
Function
    Weartest handler
Description
    Handler for weartest collection
*/
handler.weartest = function (request, callback) {
    var hierarchy = url.parse(request.url).pathname.split('/'),
        user = request.user,
        userType,
        method = request.method;

    if (method === 'GET') {
        //Check if requesting for a feature
        if ((hierarchy[4] && hierarchy[4] !== 'feature') || !hierarchy[4]) {
            request.preparedOptions = processSimpleRequest(request);
        }

        if (user) {
            userType = user.utype;

            if (userType === 'Brand') {
                request.preparedOptions.query['$or'] = [{'owner': user.username}, {'brand': user.company}];
            }
        }

        callback();
    } else if (method === 'POST') {
        if (!user) {
            callback(new Error('Unauthorized Access'));

            return;
        }

        userType = user.utype;

        if (userType === 'Tester') {
            callback(new Error('Unauthorized Access'));

            return;
        }

        request.body['owner'] = user.username;
        request.body['status'] = 'draft';
        request.body['companyOverview'] = user.companyOverview || '';
        request.body['brand'] = user.company;
        request.body['companyWebsite'] = user.website || '';

        if (user.company) {
            //Prefix with E to indicate exclusivity for testers
            request.body['brandAssociation'] = ['E' + user.company.toUpperCase()];
        }

        request.body['createUserId'] = user._id;
        request.body['createUsername'] = user.username;
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;

        request.preparedOptions = processSimpleRequest(request);

        callback();
    } else if (method === 'PUT') {
        if (!user) {
            callback(new Error('Unauthorized Access'));

            return;
        }

        request.body['id'] = request.body['_id'];

        delete request.body['_id'];

        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;
        request.body['modifiedDate'] = new Date();

        request.preparedOptions = processSimpleRequest(request);

        callback();
    } else if (method === 'DELETE') {
        if (!user) {
            callback(new Error('Unauthorized Access'));

            return;
        }

        userType = user.utype;

        if (userType === 'Tester') {
            //Tester cannot delete weartests
            callback(new Error('Unauthorized Access'));

            return;
        }

        request.preparedOptions = processSimpleRequest(request);

        callback();
    }
};

/*
Function
    Weartest Reports handler
Description
    Handler for weartestReports collection
*/
handler.weartestReports = function (request, callback) {
    var hierarchy = url.parse(request.url).pathname.split('/'),
        user = request.user,
        userType,
        method = request.method;

    if (!user) {
        callback(new Error('Unauthorized Access'));

        return;
    }

    userType = user.utype;

    if (userType === 'Tester') {
        callback(new Error('Unauthorized Access'));

        return;
    }

    if (method === 'GET') {
        //Check if requesting for a feature
        if ((hierarchy[4] && hierarchy[4] !== 'feature') || !hierarchy[4]) {
            request.preparedOptions = processSimpleRequest(request);
        }

        callback();
    } else if (method === 'PUT') {
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;
        request.body['modifiedDate'] = new Date();

        request.body['id'] = request.body['_id'];

        delete request.body['_id'];

        request.preparedOptions = processSimpleRequest(request);

        callback();
    } else if (method === 'POST') {
        request.body['createUserId'] = user._id;
        request.body['createUsername'] = user.username;
        request.body['modifiedUserId'] = user._id;
        request.body['modifiedUsername'] = user.username;

        request.preparedOptions = processSimpleRequest(request);

        callback();
    }
};

/*
Function
    Router
Description
    Depending on the collection associated with the API request,
    route to the corresponding handler
*/
var routeToCollection = function (request, response, next) {
    var collectionName = url.parse(request.url).pathname.split('/')[3];

    try {
        handler[collectionName](request, function (err) {
            if (err) {
                if (err.message === 'Unauthorized Access') {
                    return response.status(403).send({
                        error: 'Forbidden. You are not authorized to make that request'
                    });
                } else if (err.message === 'Method type not supported') {
                    return response.status(400).send({
                        error: 'Requested method is not supported for this collection'
                    });
                } else if (err.message === 'Weartest identification issue') {
                    return response.status(500).send({
                        error: 'Could not assign an identification value to the weartest'
                    });
                }
            } else {
                return next();
            }
        });
    } catch (e) {
        if (e instanceof TypeError) {
            return response.status(400).send({
                error: 'Unknown collection'
            });
        } else {
            //Unknown error. Propagate.
            throw new Error(e);
        }
    }
};

module.exports = routeToCollection;
