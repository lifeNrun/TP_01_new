'use strict';

var config = require('../config'),
    _ = require('underscore'),
    http = require('http');

/*
Function
    Make a HTTP request
Description
    Actually makes a HTTP request based on the options passed
Paramters
    options
        -> type object
        -> HTTP request options
    successCallback, errorCallback
        -> type function
        -> to be called when the HTTP request is a success / failure
*/
function makeRequest(options, successCallback, errorCallback) {
    var request,
        bufferData = new Buffer(options.data),
        bufferLength = bufferData.length;

    options.headers['Content-Length'] = bufferLength;

    options.headers['Content-Type'] = 'application/json';

    options.path += '?api_key=' + options.apiKey;

    if (options.method === 'GET' || options.method === 'DELETE') {
        options.path += '&query=' + encodeURIComponent(options.query) + '&projection=' +
                        encodeURIComponent(options.projection) + '&orderBy=' +
                        encodeURIComponent(options.orderBy);
    }

    if (options.limit !== 0) {
        options.path += '&limit=' + options.limit;
    }

    delete options.apiKey;

    delete options.query;

    delete options.projection;

    delete options.limit;

    delete options.orderBy;

    request = http.request(options, function (response) {
        var body = '';

        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            var data = null;

            //Only consider successful requests
            //Consider 2xx and 3xx status codes as successful - bulk actions returns 202 for example
            if (response.statusCode >= 200 && response.statusCode < 400) {
                if (body) {
                    try {
                        data = JSON.parse(body);
                    } catch (err) {
                        console.log(" => Error occurred while attempting to read response for API request");
                        console.log(err);

                        if (errorCallback) {
                            errorCallback(err);
                        }

                        return;
                    }
                }

                if (successCallback) {
                    successCallback(data);
                }
            } else {
                console.log(" => API request not successful. Status code is : ", response.statusCode)

                if (errorCallback) {
                    errorCallback(new Error('Issues with API request. See status code in console.'));
                }
            }
        });
    });

    request.on('error', function (err) {
        console.log(" => Error while API request : ", err)

        if (errorCallback) {
            errorCallback(err);
        }
    });


    if (options.method !== "GET" && options.data.length > 0) {
        request.write(options.data);
    }

    request.end();
}

/*
Function
    Constructor of a new API request
Description
    Initialize a new request to an API
Parameters
    options
        -> type object
        -> HTTP request options with the following properties
        headers
            -> type object
            -> Request headers
        host
            -> type string
            -> API host (default picked from configuration)
        path
            -> type string
            -> API path (default is empty)
        port
            -> type number
            -> API port
        data
            -> type string
            -> data to pass to API (default is empty)
        apiKey
            -> type string
            -> API key (default picked from configuration)
        query
            -> type object
            -> API query (default no query)
        projection
            -> type object
            -> fields to restrict in result records (default all fields)
        limit
            -> type number
            -> # of records to restrict result to (default 10 records, 0 retrieves all records)
        orderBy
            -> type object
            -> Sort the data in a particular order before sending it
*/
function APIRequest(options) {
    var defaultOptions;

    if (!(this instanceof APIRequest)) {
        return new APIRequest(options);
    }

    defaultOptions = {
        headers: {},
        host: config.api.host,
        path: '',
        port: config.api.port,
        data: '',
        apiKey: config.api.key,
        query: {},
        projection: {},
        orderBy: {},
        limit: 1
    };

    this.options = {};

    _.extend(this.options, defaultOptions, options);

    this.options.query = JSON.stringify(this.options.query);

    this.options.projection = JSON.stringify(this.options.projection);

    this.options.orderBy = JSON.stringify(this.options.orderBy);
}

/*
Function
    GET request
Description
    Executes a GET request
Paramters
    successCallback, errorCallback
        -> type function
        -> To be called when the request is a success / failure
*/
APIRequest.prototype.get = function (successCallback, errorCallback) {
    var options = {};

    _.extend(options, this.options);

    options.method = 'GET';

    makeRequest(options, successCallback, errorCallback);
};

/*
Function
    POST request
Description
    Executes a POST request
Paramters
    successCallback, errorCallback
        -> type function
        -> To be called when the request is a success / failure
*/
APIRequest.prototype.post = function (successCallback, errorCallback) {
    var options = {};

    _.extend(options, this.options);

    options.method = 'POST';

    makeRequest(options, successCallback, errorCallback);
};

/*
Function
    PUT request
Description
    Executes a PUT request
Paramters
    successCallback, errorCallback
        -> type function
        -> To be called when the request is a success / failure
*/
APIRequest.prototype.put = function (successCallback, errorCallback) {
    var options = {};

    _.extend(options, this.options);

    options.method = 'PUT';

    makeRequest(options, successCallback, errorCallback);
};

/*
Function
    DELETE request
Description
    Executes a DELETE request
Paramters
    successCallback, errorCallback
        -> type function
        -> To be called when the request is a success / failure
*/
APIRequest.prototype.delete = function (successCallback, errorCallback) {
    var options = {};

    _.extend(options, this.options);

    options.method = 'DELETE';

    makeRequest(options, successCallback, errorCallback);
};

module.exports = {
    prepare: APIRequest,
    execute: makeRequest
};
