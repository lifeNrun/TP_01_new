'use strict';

var handler = {},
    url = require('url'),
    _ = require('underscore');

/*
Function
    Activity Logs handler
Description
    Handler for activityLogs collection
*/
handler.activityLogs = function (request, response) {
    response.send(request.responseResult);
};

/*
Function
    Participant Roster Update Handler
Description 
    Handler for updates to participant roster
*/
handler.bulkEmail = function (request, response) {
    response.send(request.responseResult);
};

/*
Function
    Configuration handler
Description
    Handler for images and videos
*/
handler.configuration = function (request, response) {
    response.send(request.responseResult);
};

/*
Function
    Media handler
Description
    Handler for images and videos
*/
handler.images = function (request, response) {
    response.send(request.responseResult);
};


/*
+Function
    Imageset handler
Description
    Handler for imagesets collection
*/
handler.imagesets = function (request, response) {
    response.send(request.responseResult);
};

/*
Function
    Participant Roster Update Handler
Description 
    Handler for updates to participant roster
*/
handler.rosterUpdate = function (request, response) {
    response.send(request.responseResult);
};


/*
Function
    Share survey
Description
    Handler for sharing surveys
*/
handler.shareSurvey = function (request, response) {
    response.send(request.responseResult);
};

/*
Function
    Surveys handler
Description
    Handler for surveys collection
*/
handler.surveys = function (request, response) {
    var user = request.user,
        result = request.responseResult,
        method = request.method,
        i;

    if (user && user.utype === 'Brand') {
        //Brand user can only see the survey that they own (and public surveys)
        if (_.isArray(result)) {
            for (i = 0; i < result.length; i++) {
                if (result[i].type === 'Activity') {
                    //Activity surveys are available to all Brands
                    continue;
                } else if (result[i].isPublic === true) {
                    //Public surveys are availalbe to all Brands
                    continue;
                }

                if (result[i].allowed.indexOf(user.company) === -1) {
                    throw new Error('Unauthorized Access');
                } else if (!result[i].allowed || result[i].allowed.length === 0) {
                    throw new Error('Unauthorized Access');
                }
            }
        } else if (_.isObject(result)) {
            if (result.type !== 'Activity' && result.isPublic !== true) {
                if (result.allowed.indexOf(user.company) === -1) {
                    throw new Error('Unauthorized Access');
                }
            }
        }
    }

    response.send(result);
};

/*
Function
    Submitted Surveys handler
Description
    Handler for surveys_submitted collection
*/
handler.surveys_submitted = function (request, response) {
    response.send(request.responseResult);
};

/*
Function
    Unregistered user Handler
Description
    Handler for updates to unregisterd users
*/
handler.unregisteredUsers = function (request, response) {
    var result = request.responseResult,
        i;

    if (_.isArray(result)) {
        for (i = 0; i < result.length; i++) {
            delete result[i].email;
        }
    } else if (_.isObject(result)) {
        delete result.email;
    }

    response.send(result);
};

/*
Function
    User handler
Description
    Handler for users collection
*/
handler.users = function (request, response) {
    var user = request.user,
        result = request.responseResult,
        method = request.method,
        i;

    if (method === 'GET') {
        //Ensure that password is not sent back
        if (_.isArray(result)) {
            for (i = 0; i < result.length; i++) {
                delete result[i].password;
            }
        } else if (_.isObject(result)) {
            delete result.password;
        }

        response.send(result);
    } else if (method === 'PUT') {
        //Update the current user session
        if (result._id === request.user._id) {
            //Delete the password from the update
            delete result.password;

            //Update existing session
            request.login(result, function (err) {
                if (err) {
                    throw new Error('Error while updating existing session');
                }

                //Wait for 2 seconds before returning to ensure that the session is indeed updated
                setTimeout(function () {
                    response.send(result);
                }, 2000);
            });
        }

        response.send(result);
    }
};

/*
Function
    Weartest handler
Description
    Handler for weartest collection
*/
handler.weartest = function (request, response) {
    response.send(request.responseResult);
};

/*
Function
    Weartest Reports handler
Description
    Handler for weartestReports collection
*/
handler.weartestReports = function (request, response) {
    response.send(request.responseResult);
};

/*
Function
    Router
Description
    Depending on the collection associated with the API request,
    route to the corresponding handler
*/
var routeToCollection = function (request, response) {
    var collectionName = url.parse(request.url).pathname.split('/')[3];

    try {
        handler[collectionName](request, response);
    } catch (e) {
        if (e.message === 'Unauthorized Access') {
            return response.status(403).send({
                error: 'Forbidden. You are not authorized to make that request'
            });
        } else if (e.message === 'Error while updating existing session') {
            return response.status(500).send({
                error: 'Error while updating current session'
            });
        } else {
            if (e instanceof TypeError) {
                return response.status(400).send({
                    error: 'Unknown collection'
                });
            } else {
                //Unknown error. Propagate.
                throw new Error(e);
            }
        }
    }

    //Note: We could have a generic response here since each collection simply modifies the result and sends it back.
    //However, there are certain modifications that are asynchronous and the handler wishes to wait for the modification
    //to complete before responding. Thus, the response is handed over to each collection instead, even though this may
    //result in repetition
};

module.exports = routeToCollection;
