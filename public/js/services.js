/**************************************************************
    This file contains all the services used by the
    application.

    Module: wearTestWebApp
***************************************************************/

'use strict';

/*
Service that returns the async library
*/
app.factory('async', ['$window',
    function ($window) {
        return $window.async;
    }
]);

/*
Service to display status messages to end user
*/

app.factory('$localstorage', ['$window', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        },
        remove: function (key) {
            $window.localStorage.removeItem(key)
        }
    };
}]);

app.factory('notificationWindow', ['$timeout',
    function ($timeout) {
        var notificationWindow = angular.element('.notification-window'),
            notificationMessage = angular.element('.notification-window span'),
            hideInProgress,
            windowShown;

        function cancelHide() {
            if (!hideInProgress) {
                return;
            }

            $timeout.cancel(hideInProgress);

            hideInProgress = undefined;
        }

        function startHidingWindow() {
            if (!windowShown) {
                return;
            }

            hideInProgress = $timeout(function () {
                notificationWindow.animate({ 'top': '-55' });

                windowShown = false;

                hideInProgress = undefined;
            }, 2500);
        };

        return {
            show: function (message, wait) {
                if (windowShown) {
                    //Already status window is shown. Just update text
                    //and reset the time to close window
                    notificationMessage.text(message);

                    cancelHide();
                } else {
                    notificationMessage.text(message);

                    notificationWindow.animate({ 'top': '0' });

                    windowShown = true;
                }

                if (!wait) {
                    startHidingWindow();
                } else {
                    cancelHide();
                }
            },
            hide: function () {
                if (!windowShown) {
                    return;
                }

                notificationWindow.animate({ 'top': '-55' });

                windowShown = false;

                cancelHide();
            }
        };
    }
]);

/*
Service to store cover photos of imagesets
Helpful when the images are used repeatedly and fetching from server
each time does not make sense
*/
app.factory('imageHandler', [
    function () {
        var imageStore = {};

        return {
            setCoverPhoto: function (imagesetId, imageUrl) {
                imageStore[imagesetId] = imageUrl;
            },
            getCoverPhoto: function (imagesetId) {
                return imageStore[imagesetId];
            },
            reset: function () {
                //To be called when the user logs out - as a cleanup act
                imageStore = {};
            }
        };
    }
]);

/*
Service to store tester details
To be used by non-tester users only
*/
app.factory('testerUsersStorage', [
    function () {
        var testerUsers = [];

        return {
            storeTesters: function (testers) {
                testerUsers = testers.slice(0);
            },
            getTesters: function () {
                return testerUsers;
            }
        };
    }
]);

/*
Service to split a (possible) long GET request
into multiple short GET requests
path -> request path (withour query parameters)
query -> query object
field -> query key whose value is an array ($in query)
value -> Above query key's value - which should be an array whose length
        can be really big
projection -> fields to project in result
orderBy -> Sort result before fetching based on a key
*/
app.factory('splitRequest', ['$q', 'async', '$http',
    function ($q, async, $http) {
        var resultArray = [],
            request = {},
            deferred;

        function resultHandler(err) {
            if (err) {
                console.log(err);

                deferred.reject('Error executing request');
            } else {
                deferred.resolve(resultArray);
            }

            resultArray = [];
        }

        function simpleRequest(valueArray, callback) {
            var path = request.path,
                query = request.query,
                projection = request.projection,
                field = request.field,
                orderBy = request.orderBy;

            query[field] = {
                '$in': valueArray
            }

            path += '?query=' + JSON.stringify(query);

            if (projection) {
                path += '&projection=' + JSON.stringify(projection);
            }

            if (orderBy) {
                path += '&orderBy=' + JSON.stringify(orderBy);
            }

            $http.get(path)
                .success(function (result) {
                    var i;

                    if (angular.isArray(result)) {
                        for (i = 0; i < result.length; i++) {
                            resultArray.push(result[i]);
                        }

                        callback();
                    } else {
                        callback(new Error('Error executing get request for path ' + path));
                    }
                })
                .error(function (err) {
                    callback(err);
                });
        }

        return function (path, query, field, value, projection, orderBy) {
            var splitContainer = [],
                individualSplits = [],
                key,
                i, j;

            deferred = $q.defer();

            request.path = path;

            request.projection = projection;

            request.orderBy = orderBy;

            request.query = query;

            request.field = field;

            if (value.length > 75) {
                //Split the query into multiple queries
                for (i = 0, j = value.length; i < j; i += 75) {
                    individualSplits = value.slice(i, i + 75);

                    splitContainer.push(individualSplits)

                    individualSplits = [];
                }
                
                //Execute multiple requests with the split query
                async.each(splitContainer, simpleRequest, resultHandler);
            } else {
                //Request can be safely executed without splitting
                simpleRequest(value, resultHandler);
            }

            return deferred.promise;
        };
    }
]);

//Service to detect the user's operating system
//Note - browser may fake the user agent
app.factory('OS',
    function () {
        var version = navigator.appVersion;

        return {
            isMac: function () {
                return version.indexOf('Mac') !== -1;
            }
        }
    }
    );

//This service provides a key-value store for when you want to store a value for a directive
//that is many levels deep
app.factory('store', [function () {
    var store = {};

    return {
        get: function (key) {
            return store[key];
        },

        set: function (key, value) {
            store[key] = value;
        }
    }
}]);

//Check if the roster update has been applied
app.factory('checkRosterUpdates', ['$q', '$http', function ($q, $http) {
    return function (rosterUpdates) {
        return function () {
            var MAX_COUNT = 3;

            var deferred = $q.defer();

            function getRequest(count) {
                var wearTestId = rosterUpdates.wearTestId;
                $http.get('/query/weartest?query={"_id":"' + wearTestId + '"}').then(function (data) {
                    data = data.data[0];
                    for (var i = 0; i < rosterUpdates.testerIds.length; i++) {
                        var tester = rosterUpdates.testerIds[i],
                            found = false;
                        for (var j = 0; j < data.participants.length; j++) {
                            var participant = data.participants[j];
                            if (participant.userIdkey === tester) {
                                if (participant.status === rosterUpdates.newStatus) {
                                    found = true;
                                } else if (count === MAX_COUNT) {
                                    participant.status = rosterUpdates.newStatus;
                                    found = true;
                                }
                                break;
                            }
                        }
                        if (!found) {
                            if (count < MAX_COUNT) {
                                getRequest(count + 1);
                                return;
                            } else {
                                deferred.reject();
                                return;
                            }
                        } else {
                            if (count === MAX_COUNT) {
                                delete data._id;
                                $http.put('/tableControlApi/weartest/' + wearTestId, data).then(function (data) {
                                    deferred.resolve(data);
                                });
                            } else {
                                deferred.resolve(data);
                            }
                            return;
                        }
                    }
                });
            }

            getRequest(1);

            return deferred.promise;
        };
    };
}]);


//Stores the user type of the user registering
app.factory('registerUserType', function () {
    var userType = "";
    return {
        setType: function (newtype) {
            userType = newtype;
        },
        getType: function () {
            return userType;
        }
    };
});

//Calculates the % of completion of the user profile
app.factory('profileDetailCompletion', function () {
    var attributes = ["height", "weight", "shoeSize", "shirtSize", "sleeveLength", "jacketSize", "gloveSize", "dateOfBirth", "gender", "shoeWidthStr", "inseamLength", "waistMeasurement", "fname", "lname", "email", "mobilePhone", "favoriteQuote", "runningShoeSize", "armPreference", "legPreference", "neckMeasurement", "chestMeasurement", "thighMeasurement", "bicepMeasurement", "profession", "favoriteMemory", "address", "winter", "summer", "aboutMe", "shoulderMeasurement", "underBustMeasurement", "seatMeasurement"];

    return {
        getPercentageOfCompletion: function (profileDetails) {
            
            //Start with 2 for the correction factor
            var total = 2;
            var arrayCount = 0;
            for (var i = 0; i < attributes.length; i++) {
                if (!angular.isUndefined(profileDetails[attributes[i]]) && profileDetails[attributes[i]] !== null) {
                    if ((attributes[i] === "underBustMeasurement" || attributes[i] === "seatMeasurement") && profileDetails["gender"] === "male") {
                        //Sometimes, in cases where the user changes the gender, the underBustMeasurement attribute is
                        //present and thus this scenario needs to be handled as well
                        total = total + 3;
                    } else if (typeof profileDetails[attributes[i]] === typeof "hello world") {
                        arrayCount += 1;
                        if (profileDetails[attributes[i]].length !== 0) {
                            if (attributes[i] !== "favoriteQuote" && attributes[i] !== "favoriteMemory" && attributes[i] !== "aboutMe") {
                                total = total + 2;
                            } else {
                                //Favorite Quotes and Favorite Memories and About Me have a
                                //weight of two
                                total = total + 5;
                            }
                        }
                    } else if (typeof profileDetails[attributes[i]] === typeof 3) {
                        total = total + 3;
                    } else if (typeof profileDetails[attributes[i]] === typeof []) {
                        if (profileDetails[attributes[i]].length !== 0) {
                            total = total + 5;
                        }
                    }
                } else if ((attributes[i] === "underBustMeasurement" || attributes[i] === "seatMeasurement") && profileDetails["gender"] === "male") {
                    //Male members will not have this attribute available
                    total = total + 3;
                }
            }

            return total;
        }
    };
});

app.factory('downloadAsCSV', [function () {
    //Convert the provided value to string
    function stringify(str) {
        //In case no value provided, return empty string
        if (str === null || str === undefined) {
            return '';
        }
            
        //In case number provided, return string format of number
        if (typeof (str) === 'number') {
            return '' + str;
        }
            
        //In case a boolean value provided, return equivalent string
        if (typeof (str) === 'boolean') {
            return (str ? 'TRUE' : 'FALSE');
        }
            
        //In case string provided, return string where single quote is converted to double quotes
        if (typeof (str) === 'string') {
            return str.replace(/"/g, '""');
        }
            
        //In case array is provided, return its string representation
        if (Object.prototype.toString.call(str) === '[object Array]') {
            return str.toString();
        }
    }
        
    //Append new line at the end of the string
    function appendNewLine(str) {
        var newString = str.substr(0, str.length - 1);

        return newString + "\n";
    }
        
    //columnName - Array of the names for the columns
    //columnKeys - Array of the keys for the columns. This will be used to read / identify the data
    //data - Array of objects where each object is a non-header row in the table. The properties of the
    //          object are the columnKeys
    //searchFilter - Search filter to be applied before exporting data
    return function (columnNames, columnKeys, data, searchFilter) {
        var csvString = '',
            csvString1 = '',
            srchString = '',
            i,
            j,
            cellData;

        searchFilter = searchFilter || '';


        //First - prepare the column headers
        for (i = 0; i < columnNames.length; i++) {
            csvString = csvString + '"' + stringify(columnNames[i]) + '",';
        }

        csvString = appendNewLine(csvString);
            
        //Next, prepare the individual row entries
        for (i = 0; i < data.length; i++) {
            csvString1 = '';
            srchString = '';
            for (j = 0; j < columnKeys.length; j++) {
                cellData = data[i][columnKeys[j]];

                csvString1 = csvString1 + '"' + stringify(cellData) + '",';

                if (columnKeys[j] === "fname" || columnKeys[j] === "lname" || columnKeys[j] === "username" || columnKeys[j] === "email" || columnKeys[j] === "brandAssociation") {
                    srchString = srchString + '"' + stringify(cellData) + '",';
                }
            }
            if (srchString.toLowerCase().search(searchFilter.toLowerCase()) != -1) {

                csvString += csvString1;
                csvString = appendNewLine(csvString);
            }
        }

        return csvString;
    };
}]);

app.factory('activityLogCount', function () {
    //Returns the number of days between two dates
    var dateDifferenceInDays = function (startDate, endDate) {
        var utc1,
            utc2,
            _MS_PER_DAY = 1000 * 60 * 60 * 24;

        utc1 = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        utc2 = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    };
    
    //Calculate the number of activity logs expected for the provided Wear Test
    var getExpectedActivityLogCount = function (wearTestDetails) {
        var utc1,
            utc2,
            wearTestStartDate = new Date(wearTestDetails.wearTestStartDate),
            wearTestEndDate = new Date(wearTestDetails.wearTestEndDate),
            //The +1 is to accomodate the end date as a valid day before the activity ends
            numberOfDays = dateDifferenceInDays(wearTestStartDate, wearTestEndDate) + 1,
            numberOfWeeks = Math.ceil(numberOfDays / 7),
            numberOfMonths = (wearTestEndDate.getFullYear() * 12 + wearTestEndDate.getMonth()) - (wearTestStartDate.getFullYear() * 12 + wearTestStartDate.getMonth());

        switch (wearTestDetails.frequencyActivityLog) {
            case "daily":
                //Activity log count will be equal to the duration of the Wear Test
                return numberOfDays;

            case "2xweekly":
                //Activity log count will be twice the duration (in weeks) of the Wear Tes
                return 2 * numberOfWeeks;

            case "weekly":
                //Activity log count will be equal to the duration (in weeks) of the Wear Test
                return numberOfWeeks;

            case "2xmonthly":
                //Activity log count will be twice the duration (in months) of the Wear Test
                return 2 * numberOfMonths;

            case "monthly":
                //Activity log count will be equal to the duration (in months) of the Wear Test
                return numberOfMonths;

            default:
                return 0;
        }
    };

    return {
        get: getExpectedActivityLogCount
    };
});

app.factory('httpRequestInterceptorCacheBuster', ['$q', function ($q) {
    return {
        request: function (request) {
            if (request) {
                if (request.method === "GET" && request.url.indexOf('.html') === -1) {
                    var sep = request.url.indexOf('?') === -1 ? '?' : '&';
                    request.url = request.url + sep + 'cacheSlayer=' + new Date().getTime();
                }
            }

            return request || $q.when(request);
        }
    };
}]);

app.factory('reportDisplayData', function () {
    var data = {};

    return {
        getData: function () {
            return data;
        },
        setData: function (newData) {
            data = newData;
        }
    };
});

app.factory('WTServices', function () {
    
    //Is the data a valid data (in the context of a Wear Test being suitable for activation)
    var isDataValid = function (data, expectedType) {
        if (angular.isUndefined(data) || data === null || data === '') {
            //Data not provided. Invalid Data
            return false;
        } else if (angular.isDefined(expectedType)) {
            if (typeof data !== expectedType) {
                //Data type not met. Invalid data
                return false;
            }
        }
        
        //Data is valid
        return true;
    };

    return {
        getActivationStatus: function (weartest, productImagesUploaded) {
            //Initialize the validation result with a failure.
            //Will be changed upon success
            var validationResult = {
                status: "failed",
                messages: []
            };
            
            //Check if Product Test Title is provided
            if (!isDataValid(weartest.name)) {
                validationResult.messages.push({
                    step: 'overview',
                    text: "Product Test Title is required."
                });
            }
            
            //Check if Product Test Overview is provided
            if (!isDataValid(weartest.wearTestOverview)) {
                validationResult.messages.push({
                    step: 'overview',
                    text: "Product Test overview is required."
                });
            }
            
            //Check if expectations overview is provided
            if (!isDataValid(weartest.expectationsOverview)) {
                validationResult.messages.push({
                    step: 'overview',
                    text: "Product Test Expectation is required."
                });
            }
            
            //Check if product type is provided
            if (!isDataValid(weartest.productType)) {
                validationResult.messages.push({
                    step: 'overview',
                    text: "Product Category is required."
                });
            }
            
            //Check if the activity type is provided
            if (!isDataValid(weartest.activity)) {
                validationResult.messages.push({
                    step: 'overview',
                    text: "Product Activity/Sport is required."
                });
            }
            
            //Check if the number of testers is provided, and if provided, is of type Numeric
            if (!isDataValid(weartest.requiredNumberofTesters, 'number')) {
                validationResult.messages.push({
                    step: 'overview',
                    text: "Number of Testers must be numeric."
                });
            }
            
            //If Wear Test is private, then registration start, end and draft dates are not mandatory
            if (weartest.isPrivate === false) {
                
                //Check if registration start date is provided
                if (!isDataValid(weartest.registrationStart)) {
                    validationResult.messages.push({
                        step: 'dates',
                        text: "Registration start date is required."
                    });
                }
                
                //Check if registration end date is provided
                if (!isDataValid(weartest.registrationDeadline)) {
                    validationResult.messages.push({
                        step: 'dates',
                        text: "Registration end date is required."
                    });
                } else {
                    //Check that registration end date is before registration start date
                    if (new Date(weartest.registrationStart) >= new Date(weartest.registrationDeadline)) {
                        validationResult.messages.push({
                            step: 'dates',
                            text: "Registration start date must be less than registration end date"
                        });
                    }
                }
                
                //Check if draft date is provided
                if (!isDataValid(weartest.draftDate)) {
                    validationResult.messages.push({
                        step: 'dates',
                        text: "Draft Date is required."
                    });
                }

            }
            
            //Check if begin wear test date is provided
            if (!isDataValid(weartest.wearTestStartDate)) {
                validationResult.messages.push({
                    step: 'dates',
                    text: "Product Test Start date is required."
                });
            } else if (weartest.isPrivate === false) {
                //Check if wear test start date is after registration end date
                if (new Date(weartest.registrationDeadline) >= new Date(weartest.wearTestStartDate)) {
                    validationResult.messages.push({
                        step: 'dates',
                        text: "Registration end date must be less than Wear Test start date"
                    });
                }
            }
            
            //Check if end wear test date is provided
            if (!isDataValid(weartest.wearTestEndDate)) {
                validationResult.messages.push({
                    step: 'dates',
                    text: "Product test end date is required."
                });
            } else {
                //Check if wear test end date is after wear test start date
                if (new Date(weartest.wearTestStartDate) >= new Date(weartest.wearTestEndDate)) {
                    validationResult.messages.push({
                        step: 'dates',
                        text: "Product test start date cannot be greater than Product Test end date"
                    });
                }
            }
            
            //Check if featured image is provided
            if (!isDataValid(weartest.featureImageLink)) {
                validationResult.messages.push({
                    step: 'images',
                    text: "Feature Image is required."
                });
            }
            
            //Check if brand image is provided
            if (!isDataValid(weartest.brandLogoLink)) {
                validationResult.messages.push({
                    step: 'images',
                    text: "Brand logo is required."
                });
            }
            
            //Check if product image is provided - when at least one performance zone is present
            if (weartest.performanceZonesDates.length > 0 && productImagesUploaded.length === 0) {
                validationResult.messages.push({
                    step: 'images',
                    text: "One or more product images are required for Performance Zone Surveys."
                });
            }
            
            //Check if at least one of the following has been defined:
            //1. Activity log
            //2. Wear and Tear Dates
            //3. Performance Zone Dates
            //4. Survey
            if (!isDataValid(weartest.frequencyActivityLog) && weartest.productWearAndTearDates.length === 0 && weartest.performanceZonesDates.length === 0 && weartest.productSurveys.length === 0) {
                validationResult.messages.push({
                    step: 'surveys',
                    text: "At least one survey type is required:  Activity Logs, Performance Zones, Product Images or Product Surveys"
                });
            }
            
            //Check if rules is provided
            if (!isDataValid(weartest.rulesLink)) {
                validationResult.messages.push({
                    step: 'rules',
                    text: "Rules are required for a product test."
                });
            }

            if (validationResult.messages.length === 0) {
                //All validations passed.
                //Inform caller
                validationResult.status = "success";
                return validationResult;
            } else {
                //One or more validations failed.
                //Inform caller
                return validationResult;
            }
        }
    };
});

app.constant('wearTestScorePolicy', {
    surveyScore: 15,
    wearAndTearScore: 5,
    performanceZoneScore: 5,
    activityLogScore: 2
});


app.factory('TokenInterceptor', ['$q', '$window', '$location', '$localstorage', function ($q, $window, $location, $localstorage) {

    var token = $localstorage.get('token');
    return {
        request: function (config) {
            
            //The HTTP Bearer authentication strategy authenticates requests based on
            // a bearer token contained in the `Authorization` header field, `access_token`
            // body parameter, or `access_token` query parameter.
             
            //if ($window.sessionStorage.token) {
            token = $localstorage.get('token');
            if (token) {
                config.headers = config.headers || {};
                config.body = config.body || {};
                config.headers.Authorization = 'Bearer ' + token;
                config.body.access_token = token;
            }
            
            //return config;
            return config || $q.when(config);
        },

        requestError: function (rejection) {
            return $q.reject(rejection);
        },
        
        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function (response) {
            //if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
            if (response != null && response.status == 200 && response.data.token) {
                token = $localstorage.get('token');
                if (!token || JSON.stringify(token).length > 450) {
                    $localstorage.set('token', response.data.token);
                    $localstorage.setObject('user', response.data.user);
                }
            }
            return response || $q.when(response);
        },
        
        /* Revoke client authentication if 401 is received */
        responseError: function (rejection) {
            //if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
            if (rejection != null && rejection.status === 401 && (token)) {
                $location.path("/local/login");
            }

            return $q.reject(rejection);
        }
    };
}]);




//This service will inform on the authentication state of the user
//If the user is authenticated, then this service will also
//provide with the details of the authenticated user

app.factory('loginState', ['$http', '$localstorage', function ($http, $localstorage) {
        
    var token = $localstorage.get('token');
    if (!token) {
            //Clear the token from local storage
            $localstorage.remove('token');
             //Clear the token from local storage
            $localstorage.remove("user");
        }
            
    //Is the user authenticated
    var userIsLoggedIn = false,

    //The details of the authenticated user
    loggedInUserInfo = {};

    return {
            
        //Will check with the server for authentication of the user
        getLoginState: function (callbackFn) {
            // HttpRequest without caching for this pass the current time.
            //It's crude, but it's pretty much guaranteed to work regardless of all the outside factors that
            // can make a "proper" solution fail, like misconfigured or buggy proxies.
            var config = { cache: false }
            $http.get('/authenticationState?id=' + new Date().getTime(), config)
                .success(callbackFn);
        },
    };
}]);

