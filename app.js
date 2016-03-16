//New Relic Performance monitoring tool
if (process.env.NODE_ENV === 'production') {
    require('newrelic');
}

'use strict';

//Dependencies
var express = require('express'),
    jwt = require('jwt-simple'),
    routes = require('./routes'),
    config = require('./config'),
    configuredRoutes = require('./config/routes'),
    RedisStore = require('connect-redis')(express),
    url = require('url'),
    api = require('./routes/old_api'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    executeRequest = require('./routes/api'),
    redis = require('redis'),
    _ = require('underscore'),
    helmet = require('helmet'),
    cors = require('cors'),
    redisClient;

//Initialize passport
require('./config/passport')(passport);
require('./config/passport.bearer')(passport);


//Start off the express app
var app = express();

// For cross domain calls
app.use(cors());

//Connect to redis client
redisClient = redis.createClient(config.redis.port, config.redis.host);

//Authorize redis connection
redisClient.auth(config.redis.password);

//Basic / Default Express configuration
//We are also making use of Passport here for sessions and authentication
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.engine('html', require('ejs').renderFile);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.favicon());
    app.use(express.cookieParser('wear-test-mesh-01'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
        secret: 'M3sh01 w34rt35t 4ppl1c4t10n',
        store: new RedisStore({
            client: redisClient
        })
    }));

    //Passport configuration
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(helmet());
    app.use(helmet.frameguard('deny'));

    app.use(express.logger('dev'));
    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/pdf/:filename', routes.downloadPDF);

/*
Generic Template Request Handler
*/
app.get('/partials/*', routes.ensureAuthForRoute, routes.renderTemplate);


/*Route Handlers*/
app.get('/', routes.index);

app.get('/partials/:name', routes.partials);
app.get('/partials/registration/:name', routes.registrationFiles);

app.get('/profile/questions', api.getProfileQuestions);
app.post('/api/registerUser', api.registerUser);
app.put('/api/updateUser', passport.authenticate('bearer', { session: true, assignProperty: true }), api.updateUser);
app.put('/api/updatePassword', ensureAuthenticatedApi, api.updatePassword);
app.post('/login/local', api.loginUserLocally);
app.post('/login/external', api.loginUserExternally);

app.post('/logout', api.logoutUser);
app.post('/AdminProfileLandingPageCtrl', api.logoutUser);
app.get('/authenticationState', api.getUserAuthenticationState);

app.get('/survey/:userType', api.getSurvey);

app.get('/wearTests/:username', passport.authenticate('bearer', { session: true, assignProperty: true }), api.getWearTestsForUser);
app.get('/wearTests/open/:userId', passport.authenticate('bearer', { session: true, assignProperty: true }), api.getOpenWearTests);
app.post('/wearTests/participation/:participationStatus', passport.authenticate('bearer', { session: true, assignProperty: true }), api.updateWearTestItemParticipation);

app.get('/activityLogs/:userId', passport.authenticate('bearer', { session: true, assignProperty: true }), api.getActivityLogsForUser);
app.post('/activityLogs', passport.authenticate('bearer', { session: true, assignProperty: true }), api.saveActivityLog);
app.put('/activityLogs', passport.authenticate('bearer', { session: true, assignProperty: true }), api.updateActivityLog);

//app.get('/tableControlApi/:tableType', ensureAuthenticatedApi, api.getRecords);
//app.get('/tableControlApi/:tableType/:feature', ensureAuthenticatedApi, api.getRecords);
//app.post('/tableControlApi/:tableType', ensureAuthenticatedApi, api.createRecord);
//app.put('/tableControlApi/:tableType/:itemId', ensureAuthenticatedApi, api.saveRecord);
//app.delete('/tableControlApi/:tableType/:itemId', ensureAuthenticatedApi, api.deleteRecord);

app.get('/tableControlApi/:tableType/:feature', passport.authenticate('bearer', { session: true, assignProperty: true }), api.getRecords);
app.get('/tableControlApi/:tableType', passport.authenticate('bearer', { session: true, assignProperty: true }), api.getRecords);
app.post('/tableControlApi/:tableType', passport.authenticate('bearer', { session: true, assignProperty: true }), api.createRecord);
app.put('/tableControlApi/:tableType/:itemId', passport.authenticate('bearer', { session: true, assignProperty: true }), api.saveRecord);
app.delete('/tableControlApi/:tableType/:itemId', passport.authenticate('bearer', { session: true, assignProperty: true }), api.deleteRecord);


//app.get('/query/:tableType', ensureAuthenticatedApi, api.freeQuery);
app.get('/query/:tableType', passport.authenticate('bearer', { session: true, assignProperty: true }), api.freeQuery);
app.post('/images', api.uploadImage);
app.post('/resetPassword', api.resetPassword);

//Restricted routes. User must be logged in to be directed to these
//ensureAuthenticated is a function defined later to ensure that the
//user is authenticated before proceeding to server the page
app.get('/partials/restricted/:name', passport.authenticate('bearer', { session: true, assignProperty: true }), ensureAuthenticated, routes.restricted);
app.get('/partials/restricted/profiles/:profileType/:name', passport.authenticate('bearer', { session: true, assignProperty: true }), ensureAuthenticated, routes.profiles);
app.get('/partials/restricted/common/:feature/:name', passport.authenticate('bearer', { session: true, assignProperty: true }), ensureAuthenticated, routes.common);

//Public routes for lading page
app.get('/public/:name', api.public);

//Roster updates
app.post('/rosterUpdates', api.rosterUpdates);

//Send email
app.post('/sendEmail', api.sendEmail);


/*
Generic API Request Handler
*/
_.each(configuredRoutes, function (route) {
    var handler = require('./routes/' + route.controller),
        middlewares = [];

    if (route.authenticationRequired) {
        middlewares.push(routes.ensureAuthForAPI);
    }

    middlewares.push(handler[route.method]);

    app[route.verb.toLowerCase()](route.path, middlewares);
});

app.get('/api/*', routes.ensureAuthForAPI, routes.preAPIhandler, executeRequest, routes.postAPIHandler);
app.put('/api/*', routes.ensureAuthForAPI, routes.preAPIhandler, executeRequest, routes.postAPIHandler);
app.post('/api/*', routes.ensureAuthForAPI, routes.preAPIhandler, executeRequest, routes.postAPIHandler);
app.delete('/api/*', routes.ensureAuthForAPI, routes.preAPIhandler, executeRequest, routes.postAPIHandler);

app.use(routes.index);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port') + " in " + config.mode + " mode...");
    console.log("Using API host: " + config.api.host + ":" + config.api.port + " with key: " + config.api.key);
});

//Passport will make use of this function as a middleware to ensure that
//the user can access certain pages only when the user has been previously authenticated
function ensureAuthenticated(req, res, next) {
        
    // if (req.isAuthenticated()) {
    //     return next();
    // } else {
    //     res.send(401);
    // }
    
    //// if (req._passport.session.user) {
    ////     return next();
    //// }
    
    //Ensure token exists, else logout
    if (!(req.headers.authorization || req.body.access_token)) {
        req.logout();    
        //Ensure that session is cleared
        req.session.destroy(function () {
            res.send(401);
        });
    }
    
    //Check for cookie
    if (req.isAuthenticated()) {
        return next();
    }
    //Check for token
    else {
        passport.authenticate('bearer', { session: true, assignProperty: true }, function (err, user, info) {
            if (err || !user) {
                res.send(401);
            }
            return next();
        })(req, res, next);
    }
}

function ensureAuthenticatedApi(req, res, next) {
    // if (req.isAuthenticated()) {
    //     return next();
    // } else {
    //     res.json({
    //         error: 'You are not logged in.'
    //     });
    // }
    
    //Ensure token exists, else logout
    if (!(req.headers.authorization || req.body.access_token)) {
        req.logout();    
        //Ensure that session is cleared
        req.session.destroy(function () {
            res.json({
                error: 'You are not logged in.'
            });
        });
    }

    //Allow access if request is already logged in express through paspport local
    if (req.isAuthenticated()) {
        return next();
    }
    //Check for token
    else {
        passport.authenticate('bearer', { session: true, assignProperty: true }, function (err, user, info) {
            if (err || !user) {
                res.json({
                    error: 'You are not logged in.'
                });
            }
            return next();
        })(req, res, next);
    }
}


