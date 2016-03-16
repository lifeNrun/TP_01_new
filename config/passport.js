var LocalStrategy = require('passport-local').Strategy,
    config = require('./'),
    makeRequest = require('../routes/query').execute;

module.exports = function (passport) {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            //Local strategy is to query the API and verify if a user with the provided username and password exist
            var path,
                query,
                projection,
                body,
                method,
                options;

            path = '/users';

            query = {
                username: username,
                password: password
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
                if (result.length > 0 && result[0].username === username) {
                    //Perfect match!

                    //Is the user a brand user? If so, check if the user is associated with a brand company
                    if (result[0].utype === 'Brand' && (!result[0].company || result[0].company === '')) {
                        //Yes, user is a brand user and they are not associated with a company
                        //Refuse to allow login
                        return done(null, false, {
                            message: "Thank you for registering as a brand user for Mesh01. In order to successfully login we need to verify your account. Please email info@mesh01.com or call us at 603-766-0955. We are looking forward to hearing from you."
                        });
                    }

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
            }

            function errorCallback(err) {
                //Error in querying API. Let passport know and refuse login
                return done(err);
            }

            //Call the API and verify if the user exists
            makeRequest(options, successCallback, errorCallback);
        }));

    //Serialize and De-serialize functions to allow passport to persist the user session
    //We store the entire user profile (sans password) in the request session
    //so we won't call the API each time
    passport.serializeUser(function (user, done) {
        done(null, JSON.stringify(user));
    });

    passport.deserializeUser(function (user, done) {
        done(null, JSON.parse(user));
    });
};
