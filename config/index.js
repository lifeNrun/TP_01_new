'use strict';

var url = require('url'),
    redisUrl = url.parse(process.env.REDISTOGO_URL || 'redis://redistogo:a3b1c6a1dbbeebde50f7df6af96a13d5@grouper.redistogo.com:10042/'),
    redisAuth = redisUrl.auth.split(':'),
    defaultWearTestApiHost = "topcoder-sandbox1-api.herokuapp.com",
    defaultWearTestApiPort = 80,
    defaultWearTestApiKey = "5555555555", // "38e237b9cb1845a19c4465ab649c3c6d"
    wearTestApiHost = process.env.apiHost || defaultWearTestApiHost,
    wearTestApiPort = process.env.apiPort || defaultWearTestApiPort,
    wearTestApiKey = process.env.apiKey || defaultWearTestApiKey;

module.exports = exports = {
    api: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        key: wearTestApiKey
    },
    token: "Mesh01SecretKey",

    redis: {
        host: redisUrl.hostname,
        port: redisUrl.port,
        username: redisAuth[0],
        password: redisAuth[1]
    },

    vimeo: {
        endpoint: 'https://api.vimeo.com',
        accessToken: process.env.vimeoAccessToken,
        albumId: process.env.vimeoAlbumId
    },

    endpoints: {
        user: '/users',
        weartest: '/weartest'
    },

    mode: process.env.NODE_ENV || 'development',

    //Configuration for logging in the user normally (that is, not through social networks)
    userLogin: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        path: "/users"
    },

    //Surveys - Registration of the users
    surveys: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        testerSurveyPath: '/surveys?query={"name":"Registration-v1"}',
        designerSurveyPath: '/surveys?query={"name":"enreeco-design-v1"}',
        brandSurveyPath: '/surveys?query={"name":"enreeco-brand-v1"}'
    },

    //MockUser Registration - store the user credentials
    mockUser: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        path: "/users"
    },

    //Tables accessible to admin
    tableControls: {
        hostName: wearTestApiHost,
        port: wearTestApiPort
    },

    //WearTests
    wearTests: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        path: "/weartest"
    },

    //Activity Logs
    activityLogs: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        path: "/activityLogs"
    },

    //Upload Image
    uploadImage: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        path: "/images"
    },

    //Roster updates
    rosterUpdates: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        path: "/roster-updates"
    },

    //Send email
    sendEmail: {
        host: wearTestApiHost,
        port: wearTestApiPort,
        path: "/bulk-emails"
    },

    exclusiveBrands: ['ELLBEAN', 'EGORE', 'ELLBEANAMC', 'ESUPERFEET', 'EALTRA', 'EVIONIC', 'ESFC'],

    testerTags: ['GLLBEANTESTER', 'GLLBEAN1912', 'GSIERRACLUB', 'GLLBEANAMC', 'GSHOESFORCREWS']
};
