/**************************************************************
    This file contains all the controllers used by the
    directives applicable to a user profile / control
    panel / dashboard

    Module: dashboardApp
***************************************************************/

'use strict';

/* Controller for views/partials/restricted/dashboard-page.html */
dashboardApp.controller('PostLoginRedirectCtrl', ['$scope', '$location', 'loginState', function ($scope, $location, loginState) {

    //Get the login state of the user
    loginState.getLoginState(function (data) {
        if (data.status === "active") {
            //User is logged in - store the logged in user's information
            $scope.user = data.userInfo;
        } else {
            //User is not logged in - navigate to the login page
            $location.path('/login');
        }
    });
}]);

/* Controller for the landing page of a user of type administrator */
dashboardApp.controller('AdminProfileLandingPageCtrl', ['$scope', '$routeParams', '$http', '$location', 'loginState', 'store', 'imageHandler', '$localstorage',
    function ($scope, $routeParams, $http, $location, loginState, store, imageHandler, $localstorage) {

        //Keeps track of the currently active dashboard item
        $scope.activeDashboardItem = $routeParams['item'];

        //Set a dashboard item as active dashboard item
        $scope.loadItem = function (itemName) {
            $location.path('/dashboard/' + itemName);
        };

        //Get the logged in users info
        loginState.getLoginState(function (data) {
            //Store the user data
            $scope.currentUser = data.userInfo;
        });

        //Log out the user
        $scope.logout = function () {
            $http.post('/logout')
                .success(function (data) {
                    
                    //Clear the token from local storage
                    $localstorage.remove('token');
                     
                    //Cleanup
                    imageHandler.reset();

                    $location.path('/');
                });
        };
    }]);

/* Controller for the landing page of a user of type tester */
dashboardApp.controller('TesterProfileLandingPageCtrl', ['$scope', '$routeParams', '$http', '$location', 'loginState', 'store', 'imageHandler', '$localstorage',
    function ($scope, $routeParams, $http, $location, loginState, store, imageHandler, $localstorage) {

        //Read the route parameters to identify the dashboard item
        //to load.
        //If none provided, redirect to Activity logs
        var item = $routeParams.item;

        if (angular.isUndefined(item)) {
            $location.path('/dashboard/Profile');
            return;
        } else {
            if ($location.path().substring(0, '/dashboard/ProductTests/'.length) === '/dashboard/ProductTests/') {
                $scope.activeDashboardItem = 'ProductTests';
                store.set('testerPTItem', item);
            } else {
                $scope.activeDashboardItem = item;
            }
        }

        //Set a dashboard item as active dashboard item
        $scope.loadItem = function (itemName) {
            $scope.activeDashboardItem = itemName;
        };

        //Get the logged in users info
        loginState.getLoginState(function (data) {
            //Store the user data
            $scope.currentUser = data.userInfo;
        });

        //Returns true if the item passed is the currently active item
        $scope.isActiveItem = function (item) {
            return $scope.activeDashboardItem === item;
        };

        //Log out the user
        $scope.logout = function () {
            $http.post('/logout')
                .success(function (data) {
                    //Clear the token from local storage
                     $localstorage.remove('token');
                     
                    //Cleanup
                    imageHandler.reset();

                    $location.path('/');
                });
        };

    }]);

/* Controller for the landing page of a user of type brand */
dashboardApp.controller('BrandProfileLandingPageCtrl', ['$scope', '$routeParams', '$http', '$location', 'loginState', 'store', 'imageHandler', '$localstorage',
    function ($scope, $routeParams, $http, $location, loginState, store, imageHandler, $localstorage) {

        $scope.activeDashboardItem = $routeParams['item'];

        if (!$scope.activeDashboardItem) {
            $location.path('/dashboard/weartests/current');
            return;
        }

        //Set a dashboard item as active dashboard item
        $scope.loadItem = function (itemName) {
            $scope.activeDashboardItem = itemName;
        };

        //Get the logged in users info
        loginState.getLoginState(function (data) {
            //Store the user data
            $scope.currentUser = data.userInfo;
        });

        //Returns true if the item passed is the currently active item
        $scope.isActiveItem = function (item) {
            return $scope.activeDashboardItem === item;
        };

        //Log out the user
        $scope.logout = function () {
            $http.post('/logout')
                .success(function (data) {
                    
                    //Clear the token from local storage
                     $localstorage.remove('token');
                     
                    //Cleanup
                    imageHandler.reset();

                    $location.path('/');
                });
        };
    }]);
