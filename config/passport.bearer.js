/*
   * Bearer strategy for token authentication when accessing API endpoints
   */
var BearerStrategy = require('passport-http-bearer').Strategy, 
    jwt = require('jwt-simple'),
    http = require('http'),
    makeRequest = require('../routes/query').execute,
    config = require('./'),
    req = http.IncomingMessage.prototype;

module.exports = function(passport) {
    passport.use(new BearerStrategy({ "passReqToCallback": true },
        function(req, token, done) {
            try {
                var tokenSecret = config.token;
                //we attempt to decode the token the user sends with his requests
                var decoded = jwt.decode(token, tokenSecret);                
                
                //--------------------
                 var path,
                query,
                projection,
                body,
                method,
                options;

                path = '/users';
    
                query = {
                    _id : decoded._id,
                    username: decoded.username,
                    utype: decoded.utype,
                    email: decoded.email
                };
    
                //Don't return the password
                projection = {
                    password: 0
                };
    
                options = {
                    host: config.api.host,
                    path: path,
                    port: config.api.port,
                    apiKey: config.api.key,
                    method: 'GET',
                    query: JSON.stringify(query),
                    projection: JSON.stringify(projection),
                    limit: 0,
                    orderBy: JSON.stringify({}),
                    data: '',
                    headers: {}
                };
                
                
              function successCallback(result) {
                //API returns with an array of results since we did not query using id.
                //This array can be empty signalling that the user does not exist
                if (result.length > 0 && result[0].username === decoded.username) {
                    //Perfect match!
                    req.user = result[0];   
                    //User is not a brand user or user is a brand user with company defined.
                    //Either way, allow login and pass the user information to be stored in the session
                    return done(null, result[0]);
                } else {
                    //No match found. Either username or password is incorrect.
                    //Refuse to allow login
                    return done(null, false, {
                        message: "Invalid username or password."
                    });
                }
            };  
                
                function errorCallback(err) {
                //Error in querying API. Let passport know and refuse login
                return done(err);
            };
                
                
                //Call the API and verify if the user exists
            makeRequest(options, successCallback, errorCallback);

                
                //--------------------
                // // 
                // // //Right now just checking the user object for testing. Implement proper user checking later
                // // if (decoded !== null) {
                // //     return done(null, decoded); //allows the call chain to continue to the intented route
                // // } else {
                // //     return done(null, false); //no such user
                // // }

                //TODO: must check the token expiry and ensure the token is still valid
                //if token is expired return 401! (throw an exception, will be caught by catch clause)

                ////we find the user that has made the request
                ////Implement later
                //User.findOne({ email: decoded.sub }, function (err, user) {
                //    if (err) { return done(err); }
                //    if (!user) {
                //        return done(null, false); //no such user
                //    }
                //    else {
                //        return done(null, user); //allows the call chain to continue to the intented route
                //    }
                //});
            } catch (err) {
                console.log(err);
                return done(null, false); //returns a 401 to the caller
            }
        }));
};