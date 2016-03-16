var config = require('../config'),
    extend = require('util')._extend,
    http = require('http'),
    FormData = require('form-data'),
    fs = require('fs');
/**
 * request
 *
 * sends api request with api_key.
 *
 * options are
 *  - host : host of api server, required
 *  - path : path of api endpoint, required
 *  - port : port of api server, default is 80
 *  - method : method, default is "get"
 *  - headers : header, default is {}
 *              if method is not 'get' and has data,
 *              Content-Length, and Content-Type headers are set automatically.
 *  - data : body string or object. default is ""
 *           if data is string, it should be json foramt.
 *           if data is object, object is converted to json string.
 *
 * @param {object}  options  request options
 * @param {function} success success callback function
 * @param {function} error   error callback function
 */
exports.request = function (options, success, error) {
    var req;
    options = extend({
        data: "",
        method: "get",
        port: 80,
        headers: {}
    }, options);
    var data = options.data;
    var method = options.method.toLowerCase();
    delete options.data;
    // host and path is manatory
    if (!options.host || !options.path) {
        console.log(" [Error in API request] both host and path are required");
        return;
    }
    // if the data is object, covert it to a json string.
    if (typeof data === "object") data = JSON.stringify(data);
    // set Content-Length and Content-Type in case of post request.
    if (method !== "get") {
        var headers = options.headers;
        headers["Content-Length"] = data.length;
        if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
    }
    // adds api key to the query string.
    // check if path already has query string, which starts with ? mark.
    if (options.path.match(".*\\?.*")) {
        options.path += "&api_key=" + config.api.key;
    } else {
        options.path += "?api_key=" + config.api.key;
    }
    // console.log(" => send API request with ", options);
    // sends http request
    req = http.request(options, function (response) {
        var body = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            var data = null;
            // console.log(" => Response : ", body);
            if (body) {
                try {
                    data = JSON.parse(body);
                }
                catch (err) {
                    data = body;
                }
            }
            if (success) success(data);
        });
    });
    req.on('error', function (err) {
        console.log(" => Error while API request : ", err);
        if (error) error(err);
    });
    // if there is data to send
    if (method !== "get" && data.length > 0) {
        req.write(data);
    }
    req.end();
};
/**
 * uploadImages
 *
 * sends api request to upload images with api_key
 *
 * options are
 *  - host : host of api server, required
 *  - path : path of api endpoint, required
 *  - port : port of api server, default is 80
 *
 * @param {array}  files  files to upload
 * @param {object}  options  request options
 * @param {function} success success callback function
 * @param {function} error   error callback function
 */
exports.uploadImages = function (files, options, success, error) {
    var req;
    options = extend({
        port: 80
    }, options);
    if (!options.host || !options.path) {
        console.log(" [Error in API request] both host and path are required");
        return;
    }
    // build form request using form-data
    var form = new FormData();
    files.forEach(function (file) {
        form.append('files[]', fs.createReadStream(file.path));
    });
    options.method = "post";
    options.headers = form.getHeaders();
    // adds api key to the query string.
    // check if path already has query string, which starts with ? mark.
    if (options.path.match(".*\\?.*")) {
        options.path += "&api_key=" + config.api.key;
    } else {
        options.path += "?api_key=" + config.api.key;
    }
    // console.log(" => send API request with ", options);
    // sends http request
    req = http.request(options, function (response) {
        var body = '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            var data = null;
            // console.log(" => Response : ", body);
            if (body) {
                try {
                    data = JSON.parse(body);
                } catch (err) {
                    console.log(" => Error occurred while attempting to read response for API request");
                    console.log(err);

                    if (error) {
                        error(err);
                    }

                    return;
                }
            }
            if (success) success(data);
        });
    });
    req.on('error', function (err) {
        // console.log(" => Error while API request : ", err)
        if (error) error(err);
    });
    form.pipe(req);
};
