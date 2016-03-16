/*********************************************************************
    This file contains the declaration and definition of modules.
**********************************************************************/

'use strict';

//Module for registration of user
var registrationApp = angular.module('registrationApp', []);

//Module for registered user dashboard / control panel / profile
var dashboardApp = angular.module('dashboardApp', ['$strap.directives']);

//Module for creation of survey
var surveyApp = angular.module('surveyApp', []);

var landingApp = angular.module('landingApp', []);

//Module related to Image Sets
var imagesetApp = angular.module('imagesetApp', []);

//Main module - one module to rule them all, one module to bind them
var app = angular.module('wearTestWebApp', [
    'ui.bootstrap',
    'registrationApp',
    'dashboardApp',
    'surveyApp',
    'landingApp',
    'imagesetApp',
    'WTContent',
    'ui.tinymce',
    'infinite-scroll',
    'once',
    'ngDraggable',
    'doubleScrollBars'
]);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: '/partials/main-landing.html',
            controller: 'MainLandingCtrl'
        })
        .when('/login', {
            templateUrl: '/partials/login-page.html',
            controller: 'LoginPageCtrl'
        })
        .when('/forgot-password', {
            templateUrl: '/partials/forgot-password.html',
            controller: 'ForgotPasswordCtrl'
        })
        .when('/dashboard/ProductTests/:item', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl'
        })
        .when('/dashboard/ProductTest/:item', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl'
        })
        .when('/dashboard/ProductTest/:weartestid/:item', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl',
            reloadOnSearch: false
        })
        .when('/dashboard/ProductTest/:weartestid/:item/:subitem', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl'
        })
        .when('/dashboard/:item/:mode/:itemId/:section', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl',
            reloadOnSearch: false
        })
        .when('/dashboard/:item/:mode/:itemId/:section/:subSection', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl',
            reloadOnSearch: false
        })
        .when('/dashboard/:item/:mode/:itemId/:section/survey/:surveyId', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl'
        })
        .when('/dashboard/:item/:mode', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl'
        })
        .when('/dashboard', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl'
        })
        .when('/dashboard/:item', {
            templateUrl: '/partials/restricted/post-login-redirect.html',
            controller: 'PostLoginRedirectCtrl'
        })
        .when('/register', {
            templateUrl: '/partials/registration-page.html',
            controller: 'RegistrationPageCtrl'
        })
        .when('/register/:userType', {
            templateUrl: '/partials/registration-page.html',
            controller: 'RegistrationPageCtrl'
        })
        .when('/info/Design', {
            templateUrl: '/partials/design-landing.html',
            controller: ''
        })
        .when('/info/Tester', {
            templateUrl: '/partials/tester-landing.html',
            controller: 'BrandDesignLandingCtrl'
        })
        .when('/info/Brand', {
            templateUrl: '/partials/brand-design-landing.html',
            controller: 'BrandDesignLandingCtrl'
        })
        .when('/report/:reportId', {
            templateUrl: '/partials/report-display.html',
            controller: 'ReportDisplayCtrl'
        })
        .when('/pensole', {
            templateUrl: '/partials/redirect.html',
            controller: 'PensoleCtrl'
        })
        .when('/PENSOLE/FOOTLOCKER', {
            templateUrl: '/partials/redirect.html',
            controller: 'PensoleCtrl'
        })
        .when('/pensole/footlocker', {
            templateUrl: '/partials/redirect.html',
            controller: 'PensoleCtrl'
        })
        .when('/pensole-adidas', {
            templateUrl: '/partials/redirect.html',
            controller: 'PensoleCtrl'
        })
        .when('/answerSurvey', {
            templateUrl: '/partials/answer-survey.html',
            controller: 'DirectAnswerSurveyCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptorCacheBuster');
        $httpProvider.interceptors.push('TokenInterceptor');
}]);

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.responseInterceptors.push(function ($q, $location) {
        return function (promise) {
            return promise.then(
                //Success: Just return the response
                function (response) {
                    return response;
                },
                //Error: check the error status to identify unauthorized access
                function (response) {
                    if (response.status === 401) {
                        docCookies.setItem('redirectTo', $location.url());
                        $location.url('/login').search('loginRequired', 'true');
                    }

                    return $q.reject(response);
                }
            );
        };
    });
}]);

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
}]);

jQuery('.fancybox').fancybox({
    'autoDimensions': true,
    'transitionIn': 'none',
    'transitionOut': 'none',
    'overlayShow': true,
    'overlayOpacity': .4,
    'type': 'iframe'
});
