'use strict';
var passport = require('passport'),
    config = require('../config'),
    http = require('http'),
    apiHelper = require('../lib/api_helper'),
    jwt = require('jwt-simple'),
    fs = require('fs');
// returns default success callback function.
// it just sends `{data: data}` json response. data is an object parsed the body of the API response.

function defaultSuccess(res, sensitiveAttributes) {
    return function (data) {
        if (sensitiveAttributes) {
            for (var i = 0; i < sensitiveAttributes.length; i++) {
                delete data[sensitiveAttributes[i]];
            }
        }

        res.json({
            data: data
        });
    };
}
// returns default error callback function.
// It tries the API request again. fn is the function to try again.
var again = function defaultError(req, res, fn) {
    return function (err) {
        console.log("Error while reading data : ", err);
        setTimeout(function () {
            fn(req, res);
        }, 5000);
    }
}
//Returns the profile questions
exports.getProfileQuestions = function (req, res) {
    //Contains the location of the file
    var fileLocation = __dirname + '/../data/profile-questions.json';
    //Read the file asynchronously
    fs.readFile(fileLocation, 'utf8', function (err, data) {
        if (err) {
            throw err;
        } else {
            res.json({
                questions: JSON.parse(data)
            });
        }
    });
};

//Log the user locally
exports.loginUserLocally = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.session.messages = [info.message];
            return res.json({
                status: "authentication error",
                error: info.message
            });
        }
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }

            delete user.password;

            //return res.json({
            //    status: "authentication success",
            //    user: user
            //});
            
            //user has authenticated correctly thus we create a JWT token 
            var payload = {
                    _id : user._id,
                    username: user.username,
                    utype: user.utype,
                    email: user.email
            };

            var tokenSecret = config.token;
            var token = jwt.encode(payload, tokenSecret);
            
            req.headers = req.headers || {};
            req.headers.Authorization = 'Bearer ' + token;
            req.body.access_token = token;
                
            return res.json({ token: token, status: "authentication success", user: user });

        });
    })(req, res, next);
};

//Log the user to external website
exports.loginUserExternally = function (req, res) {
    var username = req.body.UserName;
    var password = req.body.Password;

    var path = "/v1/security/login?UserName=" + username + "&Password=" + password;
    var postData = '';

    var options = {
        host: "apimesh.cloudapp.net",
        port: 80,
        path: path,
        method: 'POST',
        data: postData
    };

    function success(result) {
        var token,
            username,
            redirectUrl;

        //Verify that the login was a success and not the HTTP request
        if (result === null) {
            return res.json({
                status: "failed",
                error: "Invalid username or password"
            });
        } else if (result.securityInfo === undefined) {
            //Log the result to identify the cause
            console.dir(result);
            return res.json({
                status: "failed",
                error: "Unable to login at this moment. Try again after some time."
            });
        } else {
            token = result.securityInfo.token;
            username = result.username;
            redirectUrl = "http://design.mesh01.com/login?username=" + username + "&sessionid=" + token + "&FromUrl=http://design.mesh01.com/forms/designoffice/overview.aspx";

            return res.json({
                status: "authentication success",
                redirectUrl: redirectUrl
            });
        }
    }

    function error(err) {
        console.log("Error while logging externally : ", err);
        res.send(err, 500);
    }

    apiHelper.request(options, success, error);
};

//User log out
//This API will log the user out. Restricted views will no longer be accessible

exports.logoutUser = function (req, res) {
    req.logout();
    // Expire the token
    // Not implemented yet
    
    //Ensure that session is cleared
    req.session.destroy(function () {
        res.send(200);
    });
};

//Returns if the user is authenticated or not
exports.getUserAuthenticationState = function (req, res) {
    var userDetails;
    
    if (req.headers.authorization || req.body.access_token)
    {
        //Remove this section after all users logged in at least once. It clears all old tokens
        var tokenLength = JSON.stringify(req.headers.authorization).length;
        if (tokenLength > 450)
        {
               req.logout();    
                //Ensure that session is cleared
                req.session.destroy(function () {
                       return  res.json({
                            status: "inactive",
                            userInfo: {}
                        }); 

                });                       
        }
    } else if (!(req.headers.authorization || req.body.access_token))
           {
               req.logout();    
                //Ensure that session is cleared
                req.session.destroy(function () {
                       return  res.json({
                            status: "inactive",
                            userInfo: {}
                        }); 
                });           
           }

    
    //Allow access if request is already logged in express through paspport local
      if (req.isAuthenticated())
      {
          userDetails = JSON.parse(JSON.stringify(req.user));
            return  res.json({
                        status: "active",
                        userInfo: userDetails
                        });                
      }
      else
      {
          //Allow access based on token for non cookies clients
          passport.authenticate('bearer', { session: true, assignProperty: true }, function(err, user, info) {
                if (err) { return res.json({
                            status: "inactive",
                            userInfo: {}
                        }); 
                }
                if (!user) { 
                    return  res.json({
                            status: "inactive",
                            userInfo: {}
                        }); 
                }
                 userDetails = JSON.parse(JSON.stringify(req.user));
                    return  res.json({
                                status: "active",
                                userInfo: userDetails
                                });    
             
          })(req, res);                  
      }
    
    
    //If you have come this far, then User is not logged in
        return res.json({
            status: "inactive",
            userInfo: {}
        }); 

    //     if (req.isAuthenticated()) {
    //         //User is authenticated / logged in
    //         userDetails = JSON.parse(JSON.stringify(req.user));
    // 
    //         delete userDetails.password;
    // 
    //         res.json({
    //             status: "active",
    //             userInfo: userDetails
    //         });
    //     } else {
    //         //User is not logged in
    //         res.json({
    //             status: "inactive",
    //             userInfo: {}
    //         });
    //     }
};

//Public routes
exports.public = function (req, res) {
    var name = req.params.name,
        path = '/',
        options;

    switch (name) {
        case 'HomeLandingCarousel':
            path = path + 'imagesets?query={"name":"Home%20Landing%20Carousel"}';
            break;

        case 'HomePageBrands':
            path = path + 'imagesets?query={"name":"HomePageBrands"}';
            break;

        case 'homeDesignersMore':
            path = path + 'blogContents?query={"location":"home-designers-more"}';
            break;

        case 'homeTestersMore':
            path = path + 'blogContents?query={"location":"home-testers-more"}';
            break;

        case 'homeBrandsMore':
            path = path + 'blogContents?query={"location":"home-brands-more"}';
            break;

        case 'testimonials':
            path = path + 'blogContents?query={"location":"Testimonials"}';
            break;

        case 'testerLandingField':
            path = path + 'blogContents?query={"location":"tester-landing-field"}';
            break;

        case 'prodTestingModal':
            path = path + 'blogContents?query={"location":"prod-testing-modal"}';
            break;

        case 'brandLandingDesigns':
            path = path + 'blogContents?query={"location":"brand-landing-designs"}';
            break;

        case 'designLandingCurrent':
            path = path + 'blogContents?query={"location":"design-landing-current"}';
            break;

        case 'designLandingLab':
            path = path + 'blogContents?query={"location":"design-landing-lab"}';
            break;

        case 'testerWeartests':
            path = path + 'weartest?query={"status":"active","isPrivate":false}&orderBy={"createdDate":-1}&limit=3';
            break;

        case 'testerLandingCarousel':
            path = path + 'imagesets?query={"name":"TesterLandingCarousel"}';
            break;

        case 'checkEmail':
            if (req.query.email) {
                path = path + 'users?query={"email":"' + encodeURIComponent(req.query.email) + '"}';
                break;
            }
            else {
                res.json({
                    error: 'Email needed'
                });
                return;
            }

        case 'checkUsername':
            if (req.query.username) {
                path = path + 'users?query={"username":"' + encodeURIComponent(req.query.username) + '"}';
                break;
            }
            else {
                res.json({
                    error: 'Username needed'
                });
                return;
            }
    }

    options = {
        host: config.tableControls.hostName,
        port: config.tableControls.port,
        path: path,
        method: 'GET',
        headers: {}
    };

    function success(data) {
        if (data && data.code !== undefined) {
            res.json({
                error: data
            });
        }
        else {
            res.json(data);
        }
    }

    function error(err) {
        console.log('Error while fetching public data %s: %s', name, JSON.stringify(err));
        res.json(err);
    }

    apiHelper.request(options, success, error);
};

//Returns the survey for the user type
exports.getSurvey = function (req, res) {
    var userType = req.params.userType,
        path,
        host,
        options,
        getReq;
    if (userType === "Tester") {
        path = config.surveys.testerSurveyPath;
    } else if (userType === "Designer") {
        path = config.surveys.designerSurveyPath;
    } else if (userType === "Brand") {
        path = config.surveys.brandSurveyPath;
    } else {
        //Unknown user type
        return res.end();
    }
    options = {
        host: config.surveys.host,
        port: config.surveys.port,
        path: path,
        method: 'GET',
        headers: {}
    };

    function success(data) {
        if (data.code !== undefined) {
            res.json({
                error: data
            });
        } else {
            res.json(data);
        }
    }

    function error(err) {
        console.log("Error while fetching survey : ", err);
        res.json(err);
    }
    apiHelper.request(options, success, error);
};
//Register user
exports.registerUser = function (req, res) {
    var user = req.body,
        brand;

    //Process exclusivity of users
    if (user.utype === 'Tester') {
        if (!user.brandAssociation) {
            user.brandAssociation = [];

            user.tags = [];
        } else if (user.brandAssociation.length > 1) {
            user.brandAssociation = [];

            user.tags = [];
        } else if (user.brandAssociation.length !== 0) {
            brand = user.brandAssociation[0];

            brand = brand.toUpperCase();

            if (config.exclusiveBrands.indexOf(brand) === -1) {
                if (config.testerTags.indexOf(brand) === -1) {
                    user.brandAssociation = [];

                    user.tags = [];
                } else {
                    user.tags = [brand];

                    user.brandAssociation = [];
                }
            } else if (brand === 'ELLBEANAMC') {
                //TEMPORARY CODE - Ticket #673
                //Replace exclusive code with tag instead
                //and use regular LLBEAN exclusive code
                user.brandAssociation = ['ELLBEAN'];

                user.tags = ['GLLBEANAMC'];
            } else {
                user.brandAssociation = [brand];

                user.tags = [];
            }
        }
    } else {
        delete user.brandAssociation;

        delete user.tags
    }

    var postData = JSON.stringify(user);
    var options = {
        host: config.mockUser.host,
        port: config.mockUser.port,
        path: config.mockUser.path,
        method: 'POST',
        data: postData
    };

    function success(data) {
        delete data.password;

        res.json(data);
    }

    function error(err) {
        console.log("Error while registering user : ", err);
        res.json({
            error: err
        });
    }
    apiHelper.request(options, success, error);
};
exports.deleteRecord = function (req, res) {
    var tableType = req.params.tableType,
        itemId = req.params.itemId,
        path = '/' + tableType + '/' + itemId;
    var host = config.tableControls.host + path;
    var host = config.tableControls.hostName;
    var options = {
        host: host,
        port: config.tableControls.port,
        path: path,
        method: 'DELETE'
    };
    var success = defaultSuccess(res);
    var error = again(req, res, exports.deleteRecord);
    apiHelper.request(options, success, error);
};
exports.getRecords = function (req, res) {
    var tableType = req.params.tableType,
        feature = req.params.feature,
        path,
        host,
        query,
        userTypeWearTestQuery = '';
    var user = exports.getCurrenSessiontUser(req);
    //Determine the path based on the table type
    if (tableType === "answers") {
        path = '/answers';
    } else if (tableType === "users") {
        if (user.utype.toLowerCase() === "tester") {
            res.json({
                error: 'You are not authorized to perform this query.'
            });
            return;
        }
        path = '/users';
    } else if (tableType === "wearTests") {
        path = '/weartest';
    } else if (tableType === "surveys") {
        path = '/surveys';
    } else if (tableType === "imagesets") {
        path = '/imagesets';
    } else if (tableType === "blogContents") {
        path = '/blogContents';
    } else if (tableType === "messages") {
        path = '/messages';
    } else if (tableType === "activityLogs") {
        path = '/activityLogs';
    } else if (tableType === "surveys_submitted") { // Add surveys_submitted
        path = '/surveys_submitted';
    }
    //Check if the client is requesting for a feature
    if (feature) {
        // Check User Type has Brand if it is brand then add owner and brand restriction to query
        if (user.utype === "Brand")
            userTypeWearTestQuery = ', "$or":[{"owner":"' + user.username + '"},{"brand":"' + user.company + '"}]';
        var featureParams = feature.split('&');
        if (featureParams.length > 1) {
            feature = featureParams[0];
        }
        switch (feature) {
            case "owner":
                //This is applicable only to wear tests (for now)
                //Client is requesting for all wear tests where current
                //logged in user has stake AND the wear test is not yet closed
                if (path === "/weartest") {
                    query = '?query=' + encodeURIComponent('{"$or":[{"owner":"' + user.username + '"},{"brand":"' + user.company + '"}],"status":{"$ne":"closed"}}');
                    path = path + query;
                } else {
                    //Unknown feature
                    res.end();
                }
                break;

            case "ownerAndActive":
                if (path === '/weartest') {
                    query = '?query=' + encodeURIComponent('{"status":"active"' + userTypeWearTestQuery + '}');
                    path = path + query;
                } else {
                    res.end();
                }
                break;

            case "ownerAndDraft":
                if (path === '/weartest') {
                    query = '?query=' + encodeURIComponent('{"status":{"$in":["draft","pending approval"]}' + userTypeWearTestQuery + '}');
                    path = path + query;
                } else {
                    res.end();
                }
                break;

            case "ownerAndClosed":
                if (path === '/weartest') {
                    query = '?query=' + encodeURIComponent('{"status":"closed"' + userTypeWearTestQuery + '}');
                    path = path + query;
                } else {
                    res.end();
                }
                break;
            case "getAdmins":
                if (path === '/messages') {
                    path = '/users' + '?query={"utype":"Admin"}&projection={"_id":1,"username":1}';
                }
                break;
            case "getBrandUsers":
                //get the brand id
                var company = featureParams[1].split('=')[1];
                if (path === '/messages') {
                    path = '/users' + '?query={"$and":[{"utype":"Brand"},{"company":"' + company + '"}]}&projection={"_id":1,"username":1}';
                }
                break;
            case "getByUsername":
                //get the user id by username
                var username = featureParams[1].split('=')[1];
                if (path === '/messages') {
                    path = '/users' + '?query={"username":"' + username + '"}&projection={"_id":1,"username":1}';
                }
                break;
        }

    } else {
        //Get All Documents
        path = path + '?query={}';

        // Never return the password
        if (tableType == 'users') {
            path += '&projection={"password":0}';
        }
    }
    host = config.tableControls.hostName;
    var options = {
        host: host,
        port: config.tableControls.port,
        path: path,
        method: 'GET'
    };
    var success = defaultSuccess(res);
    var error = again(req, res, exports.getRecords);
    apiHelper.request(options, success, error);
};
/*
	Gets the current loggedin user (if any), given a request object
*/
exports.getCurrenSessiontUser = function (request) {
    return request.user;
    
    // if (!request || !request.session || !request.session.passport || !request.session.passport.user) return undefined;
    // return JSON.parse(request.session.passport.user);
};

exports.saveRecord = function (req, res) {
    var path = req.params.tableType,
        id = req.params.itemId,
        recordToSave = req.body,
        user = exports.getCurrenSessiontUser(req);

    //The server should take the responsibility of ensuring the data is in right format
    //before carrying out the action
    //For now, let this IF condition exists. Once the client has been corrected to ensure
    //that it does not delete the _id parameter, this IF condition will be removed (the body will not)
    if (recordToSave._id) {
        recordToSave.id = recordToSave._id;

        delete recordToSave._id;
    }

    recordToSave.modifiedUserId = user._id;
    recordToSave.modifiedUsername = user.username;
    recordToSave.modifiedDate = new Date();
    delete recordToSave.createdDate;

    var host = config.tableControls.hostName,
        plainData = JSON.stringify(recordToSave),
        bufferDataLength = new Buffer(plainData).length,
        options = {
            host: host,
            port: config.tableControls.port,
            path: '/' + path + '/' + id,
            method: 'PUT',
            data: plainData,
            headers: {
                "Content-Length": bufferDataLength,
                "Content-Type": "application/json"
            }
        },
        sensitiveField = ['password'],
        success = defaultSuccess(res, sensitiveField),
        error = again(req, res, exports.saveRecord);

    apiHelper.request(options, success, error);
};

exports.createRecord = function (req, res) {
    var path = req.params.tableType;
    var recordToSave = req.body;
    var user = exports.getCurrenSessiontUser(req);
    recordToSave.createUserId = user._id;
    recordToSave.createUsername = user.username;
    recordToSave.modifiedUserId = user._id;
    recordToSave.modifiedUsername = user.username;
    delete recordToSave.createdDate;
    delete recordToSave.modifiedDate;
    delete recordToSave._id;
    var host = config.tableControls.hostName;
    var plainData = JSON.stringify(recordToSave);
    var bufferDataLength = new Buffer(plainData).length;
    var options = {
        host: host,
        port: config.tableControls.port,
        path: '/' + path,
        method: 'POST',
        data: plainData,
        headers: {
            "Content-Length": bufferDataLength,
            "Content-Type": "application/json"
        }
    };
    var success = defaultSuccess(res);
    var error = again(req, res, exports.createRecord);
    apiHelper.request(options, success, error);
};
//Returns the wear tests of which the provided user is a participant
exports.getWearTestsForUser = function (req, res) {
    var username = req.params.username;
    var host = config.wearTests.host;
    var path = config.wearTests.path + '?query={"participants.username":"' + username + '"}';
    var options = {
        host: host,
        port: config.wearTests.port,
        path: path,
        method: 'GET'
    };
    var success = defaultSuccess(res);
    var error = again(req, res, exports.getWearTestsForUser);
    apiHelper.request(options, success, error);
};
//Returns the activity logs of the provided userId
exports.getActivityLogsForUser = function (req, res) {
    var userId = req.params.userId;
    var host = config.activityLogs.host;
    var path = config.activityLogs.path + '?query={"userId":"' + userId + '"}';
    var options = {
        host: host,
        port: config.activityLogs.port,
        path: path,
        method: 'GET'
    };
    var success = defaultSuccess(res);
    var error = again(req, res, exports.getActivityLogsForUser);
    apiHelper.request(options, success, error);
};
//Saves the activity log
exports.saveActivityLog = function (req, res) {
    var logToSave = req.body;
    var host = config.activityLogs.host;
    var user = exports.getCurrenSessiontUser(req);
    logToSave.modifiedUserId = user._id;
    logToSave.modifiedUsername = user.username;
    logToSave.modifiedDate = new Date();
    delete logToSave.createdDate;
    var plainData = JSON.stringify(logToSave);
    var options = {
        host: host,
        port: config.activityLogs.port,
        path: config.activityLogs.path,
        method: 'POST',
        data: plainData
    };

    var success = defaultSuccess(res);
    var error = again(req, res, exports.saveActivityLog);
    apiHelper.request(options, success, error);
};
//Updates an existing activity log
exports.updateActivityLog = function (req, res) {
    var logToSave = req.body;
    var host = config.activityLogs.host;
    var user = exports.getCurrenSessiontUser(req);
    logToSave.modifiedUserId = user._id;
    logToSave.modifiedUsername = user.username;
    logToSave.modifiedDate = new Date();
    logToSave.id = logToSave._id;
    delete logToSave._id;
    var plainData = JSON.stringify(logToSave);
    var path = config.activityLogs.path + '/' + logToSave.id;
    var options = {
        host: host,
        port: config.activityLogs.port,
        path: path,
        method: 'PUT',
        data: plainData
    };
    var success = defaultSuccess(res);
    var error = again(req, res, exports.updateActivityLog);
    apiHelper.request(options, success, error);
};
/*
	Allow to make a free query to the API endpoint (using a query/limit/orderBy parameter)
*/
exports.freeQuery = function (req, res) {
    var tableType = req.params.tableType,
        query = req.query.query,
        limit = req.query.limit,
        orderBy = req.query.orderBy,
        projection = req.query.projection,
        parsedProjection,
        brandCompany;

    if (!query) {
        res.json({
            error: 'No query set. Use ?query={}&orderBy={}&limit=X'
        });
        return;
    }

    var user = exports.getCurrenSessiontUser(req);

    if (tableType === 'users' && user.utype.toLowerCase() === 'tester') {
        res.json({
            error: 'You are not authorized to perform this query.'
        });
        return;
    }

    if (tableType === 'users') {
        if (user.utype === 'Brand') {
            if (typeof query === 'string') {
                query = JSON.parse(query);
            }

            if (!query.utype || query.utype !== 'Tester') {
                //Brand user can read only Tester information
                query['utype'] = 'Tester';
            }

            brandCompany = user.company;

            //Prefix with E to indicate exclusivity
            brandCompany = 'E' + brandCompany.toUpperCase();

            query['$or'] = [
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

            query = JSON.stringify(query);
        }
    }

    if (tableType === 'weartest' && user.utype === 'Tester') {
        if (user.brandAssociation && user.brandAssociation.length !== 0) {
            if (typeof query === 'string') {
                query = JSON.parse(query);
            }

            query['brandAssociation'] = {
                '$in': user.brandAssociation
            };

            query = JSON.stringify(query);
        }
    }

    var path = '/' + tableType + "?query=" + encodeURIComponent(query);

    //If projection is provided, use it
    if (projection) {

        parsedProjection = JSON.parse(projection);

        if (tableType === 'users') {
            //For the users table, no password to be provided
            //Overwrite any request for password
            parsedProjection.password = 0;
        }
    } else if (tableType === 'users') {
        //No password to be fetched
        parsedProjection = {};

        parsedProjection.password = 0;
    }

    if (parsedProjection) {
        path += '&projection=' + encodeURIComponent(JSON.stringify(parsedProjection));
    }

    if (limit) path += '&limit=' + limit;
    if (orderBy) path += '&orderBy=' + encodeURIComponent(orderBy);
    var host = config.tableControls.hostName;
    var options = {
        host: host,
        port: config.tableControls.port,
        path: path,
        method: 'GET'
    };

    function success(data) {
        if (!data) data = [];
        res.json(data);
    }

    function error(err) {
        console.log("Error while reading data " + err);
        res.json({
            error: 'Error occurred: ' + err
        });
    }
    apiHelper.request(options, success, error);
};
//Get all the open-for-registration wear tests
exports.getOpenWearTests = function (req, res) {
    var userId = req.params.userId;
    var host = config.wearTests.host;
    var currentDate = new Date().toISOString();
    var query = {
        "status": "active"
    };
    var path = config.wearTests.path + '?query=' + JSON.stringify(query);
    var options = {
        host: host,
        port: config.wearTests.port,
        path: path,
        method: 'GET'
    };

    function success(data) {
        var parsedData = data ? data : [],
            finalList = [],
            validEntry,
            participants = [];
        for (var i = 0; i < parsedData.length; i++) {
            //The current wear test item is a valid entry (initially)
            validEntry = true;
            participants = parsedData[i].participants;
            //Check the user participation
            for (var j = 0; j < participants.length; j++) {
                //Check if the user exists
                if (participants[j].userIdkey === userId) {
                    //Yes the user exists as a participant
                    //Now check if the user has already requested to join
                    if (participants[j].status !== "requested") {
                        //No, the user has either registered in the wear
                        //test or is already active for this wear test
                        //The wear test should not be considered
                        validEntry = false;
                    }
                }
            }
            //Check if the wear test can be considered
            if (validEntry) {
                finalList.push(parsedData[i]);
            }
        }
        res.json({
            data: finalList
        });
    }
    var error = again(req, res, exports.getOpenWearTests);
    apiHelper.request(options, success, error);
};
//Updates the wear test itemI
exports.updateWearTestItemParticipation = function (req, res) {
    var wearTestItem = req.body;
    var status = req.params.participationStatus;
    var user = exports.getCurrenSessiontUser(req);
    var userRecord = {};
    wearTestItem.modifiedUserId = user._id;
    wearTestItem.modifiedUsername = user.username;
    wearTestItem.modifiedDate = new Date();
    wearTestItem.id = wearTestItem._id;
    delete wearTestItem._id;
    //Update the participation of the user
    //(As of now, only request to join status will be udpated.
    // Other updates need to be handled here itself)
    if (status === "requested") {
        userRecord.username = user.username,
        userRecord.userIdkey = user._id;
        userRecord.status = status;
        //Add this user to the participants list
        wearTestItem.participants.push(userRecord);
    }
    var plainData = JSON.stringify(wearTestItem);
    var path = config.wearTests.path + '/' + wearTestItem.id;
    var options = {
        host: config.wearTests.host,
        port: config.wearTests.port,
        path: path,
        method: 'PUT',
        data: plainData
    };
    var success = defaultSuccess(res);
    var error = again(req, res, exports.updateWearTestItemParticipation);
    apiHelper.request(options, success, error);
};
//Updates user data
exports.updateUser = function (req, res) {
    var userDetails = req.body;
    userDetails.id = userDetails._id;
    delete userDetails._id;
    var user = exports.getCurrenSessiontUser(req);
    userDetails.modifiedUserId = user.id;
    userDetails.modifiedUsername = user.username;
    userDetails.modifiedDate = new Date();
    var postData = JSON.stringify(userDetails);
    var options = {
        host: config.mockUser.host,
        port: config.mockUser.port,
        path: config.mockUser.path + '/' + userDetails.id,
        method: 'PUT',
        data: postData
    };

    function success(data) {
        //we have to update session in here so that when we hit refresh we don't get previous session data
        req.session.passport.user = JSON.stringify(data);

        delete data.password;

        res.json(data);
    }

    function error(err) {
        console.error(err);
        res.json({
            error: err
        });
    }
    apiHelper.request(options, success, error);
};
// uploads image
exports.uploadImage = function (req, res) {
    var options = {
        host: config.uploadImage.host,
        path: config.uploadImage.path
    };

    function success(data) {
        if (data.code) {
            res.json({
                error: data
            })
        } else {
            res.json(data);
        }
    }

    function error(err) {
        console.error(err);
        res.json({
            error: err
        });
    }
    apiHelper.uploadImages(req.files.files, options, success, error);
}

//roster update
exports.rosterUpdates = function (req, res) {
    var options = {
        host: config.rosterUpdates.host,
        port: config.rosterUpdates.port,
        path: config.rosterUpdates.path,
        method: 'POST',
        data: req.body
    };

    function success(data) {
        if (data.code) {
            res.json({
                error: data
            });
        } else {
            res.json(data);
        }
    }

    function error(err) {
        console.log(err);
        res.json({
            error: err
        });
    }

    apiHelper.request(options, success, error);
};

//send email
exports.sendEmail = function (req, res) {
    var options = {
        host: config.sendEmail.host,
        port: config.sendEmail.port,
        path: config.sendEmail.path,
        method: 'POST',
        data: req.body
    };

    function success(data) {
        if (data.code) {
            res.json({
                error: data
            });
        } else {
            res.json(data);
        }
    }

    function error(err) {
        console.log(err);
        res.json({
            error: err
        });
    }

    apiHelper.request(options, success, error);
};

// Forgot Password
exports.resetPassword = function (req, res) {
    var host = config.tableControls.hostName;
    var plainData = JSON.stringify(req.body);
    var bufferDataLength = new Buffer(plainData).length;
    var options = {
        host: host,
        port: config.tableControls.port,
        path: '/password-resets',
        method: 'POST',
        data: plainData,
        headers: {
            "Content-Length": bufferDataLength,
            "Content-Type": "application/json"
        }
    };

    function success(data) {
        if (!data) data = [];
        res.json(data);
    }

    function error(err) {
        console.log("Error while reading data " + err);
        res.json({
            error: err
        });
    }

    apiHelper.request(options, success, error);
};

/*Update current user's password*/
exports.updatePassword = function (request, response) {
    var user = request.user,
        body = request.body,
        updatedUser;

    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    var host = config.tableControls.hostName;

    var path = '/users';

    var query = {
        'username': user.username,
        'password': body.currentPassword
    };

    var projection = {
        '_id': 1
    };

    path += '?query=' + JSON.stringify(query);

    path += '&projection=' + JSON.stringify(projection);

    var options = {
        host: host,
        port: config.tableControls.port,
        path: path,
        method: 'GET'
    };

    function error(err) {
        console.error(err);
        response.json({
            error: err
        });
    }

    function requestSuccess(data) {
        if (data.length !== 1) {
            response.send({
                status: 'error',
                message: 'Current password should be correct'
            });

            return;
        }

        updatedUser = {};

        updatedUser.id = user._id;

        updatedUser.password = body.newPassword;

        updatedUser.modifiedUserId = user._id;
        updatedUser.modifiedUsername = user.username;
        updatedUser.modifiedDate = new Date();

        var postData = JSON.stringify(updatedUser);

        var options = {
            host: config.mockUser.host,
            port: config.mockUser.port,
            path: config.mockUser.path + '/' + updatedUser.id,
            method: 'PUT',
            data: postData
        };

        function success(data) {
            delete data.password;

            response.json(data);
        }

        apiHelper.request(options, success, error);
    }

    apiHelper.request(options, requestSuccess, error);
};
