'use strict';

var Query = require('./query').prepare;

/*
Function
    Prepare and execute the API request
Description
    Pseudo function to prepare and execute the request
    Expects request options to be provided in the request.
    This function calls the appropriate request method with the options
    passed
*/
var executeRequest = function (request, response, next) {
    var options = request.preparedOptions || {},
        newRequest = new Query(options),
        method = request.method;

    function handleRequestSuccess(result) {
        if (method === 'GET' || method === 'PUT' || method === 'POST') {
            //Call post API middleware to process the result
            request.responseResult = result;

            next();
        } else {
            response.send(result);
        }
    }

    function handleRequestError(error) {
        response.status(500).send({
            error: 'An error occurred while executing request'
        });
    }

    switch (method) {
        case 'GET':
            newRequest.get(handleRequestSuccess, handleRequestError);
            break;
        case 'POST':
            newRequest.post(handleRequestSuccess, handleRequestError);
            break;
        case 'PUT':
            newRequest.put(handleRequestSuccess, handleRequestError);
            break;
        case 'DELETE':
            newRequest.delete(handleRequestSuccess, handleRequestError);
            break;
        default:
            return response.status(400).send({
                error: 'Request method ' + method + ' is not supported'
            });
    }
};

module.exports = executeRequest;
