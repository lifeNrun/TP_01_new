var passport = require('passport'),
    fs = require('fs'),
    path = require('path'),

    url = require('url'),
    apiHelper = require('../lib/api_helper');

var preMiddlewares = {
    mesh01: require('./middlewares/pre/mesh01')
},
    postMiddlewares = {
        mesh01: require('./middlewares/post/mesh01')
    };

/*
Function
    Ensure authentication for API call
Description
    Certain API's can be called only by certain users
    This function verifies if the user is authenticated
    and has the necessary permissions to call the API
*/
exports.ensureAuthForAPI = function (request, response, next) {

    var exempted = (request.url.indexOf('/api/mesh01/surveys_submitted') !== -1 && request.method === 'GET') || (request.url.indexOf('/api/mesh01/weartest') !== -1 && request.method === 'GET') || (request.url.indexOf('/api/mesh01/surveys') !== -1 && request.method === 'GET') || (request.url.indexOf('/api/mesh01/surveys_submitted') !== -1 && request.method === 'POST') || (request.url.indexOf('/api/mesh01/unregisteredUsers') !== -1 && request.method === 'GET') || (request.url.indexOf('/api/mesh01/unregisteredUsers') !== -1 && request.method === 'POST');

    //     var authenticated = request.isAuthenticated();
    // 
    //     if (!authenticated && !exempted) {
    //         return response.status(401).send({
    //             error: 'Forbidden. You are not authorized to make that request'
    //         });
    //     }
    // return next();

    //Allow access if request is already logged in express through paspport local
    if (request._passport.session.user || exempted) {
        return next();
    }


    passport.authenticate('bearer', { session: true, assignProperty: true }, function (err, user, info) {
        if (err || !user) {
            return response.status(401).send({
                error: 'Forbidden. You are not authorized to make that request'
            });
        }
        // if (!exempted) {
        //     return response.status(401).send({
        //         error: 'Forbidden. You are not authorized to make that request'
        //     });
        // }
        return next();
    })(request, response, next);


};

/*
Function
    User authentication verifier
Description
    Ensures that the request owner is an authenticated user
    to help prevent unauthorized access (templates only)
*/
exports.ensureAuthForRoute = function (request, response, next) {
    //Restricted templates are located under restricted folder under views
    //Verify if the client requests for restricted templates
    var pathHierarchy = url.parse(request.url).pathname.split('/');

    if (pathHierarchy.indexOf('restricted') === -1) {
        return next();
    } else {
        
        //Allow access if request is already logged in express through paspport local
        if (request._passport.session.user) {
            return next();
        }
      
        //If the control is here, then it means you are using tokens. So authenticate by token strategy.
        passport.authenticate('bearer', { session: true, assignProperty: true }, function (err, user, info) {
            if (err || !user) {
                response.status(401).send({
                    error: 'Forbidden. You are not authorized to make that request'
                });
            }
            return next();
        })(request, response, next);
    
        
        // //Yes, restricted view is requested. Is the user authenticated?
        // if (request.isAuthenticated()) {
        //     return next();
        // } else {
        //     response.status(401).send({
        //         error: 'Forbidden. You are not authorized to make that request'
        //     });
        // }
        
        
        
        
        
    }
};

/*
Function
    Render the requested template
Description
    Generic handler to render requested template
*/
exports.renderTemplate = function (request, response) {
    var templatePath = request.url.substring(1);

    response.render(templatePath);
};

/*
Function
    Route to the relevant brand's middleware
Description
    Identify the associated brand for the API
    and delegate processing to the brand's middleware
    This middleware is called before the API request
*/
exports.preAPIhandler = function (request, response, next) {
    var brand = url.parse(request.url).pathname.split('/')[2];

    try {
        preMiddlewares[brand](request, response, next);
    } catch (e) {
        if (e instanceof TypeError) {
            return response.status(400).send({
                error: 'Unknown Brand Request'
            });
        } else {
            console.log('Error executing request : ', e);
            return response.status(400).send({
                error: 'Request format not supported'
            });
        }
    }
};

/*
Function
    Route to relevant brand's middleware
Description
    Identify the associated brand for the API
    and delegate processing to the brand's middleware
    This middleware is called after the API request
*/
exports.postAPIHandler = function (request, response) {
    var brand = url.parse(request.url).pathname.split('/')[2];

    postMiddlewares[brand](request, response);
};

//The index page
exports.index = function (req, res) {
    res.render('index.html');
};

//The partials that need no authentication for display
exports.partials = function (req, res) {
    var partialName = req.params.name;
    res.render('partials/' + partialName);
};

//The partials for registration
exports.registrationFiles = function (req, res) {
    var partialName = req.params.name;
    res.render('partials/registration/' + partialName);
};

//The partials that need the user to be authenticated for display
exports.restricted = function (req, res) {
    var partialName = req.params.name;
    res.render('partials/restricted/' + partialName);
};

//The partials for the profiles
exports.profiles = function (req, res) {
    var profileType = req.params.profileType,
        pageName = req.params.name;
    res.render('partials/restricted/profiles/' + profileType + '/' + pageName);
};

//The partials for the common features
exports.common = function (req, res) {
    var feature = req.params.feature,
        pageName = req.params.name;
    res.render('partials/restricted/common/' + feature + '/' + pageName);
};

//Download a PDF from public/pdf
exports.downloadPDF = function (req, res) {
    fs.readFile('public/pdf/' + req.params.filename, 'binary', function (err, data) {
        if (err) {
            res.write('File not found.');
        }
        else {
            res.attachment(req.params.filename);
            res.write(data, 'binary');
        }
        res.end();
    });
};
