/***************************************************************
 This contains the controller for the "Profile" dashboard
item of a user of type Admin
***************************************************************/

dashboardApp.controller('AdminProfileItemCtrl', ['$scope', 'loginState', function ($scope, loginState) {
	'use strict';

	//% of completion of the profile
	$scope.completed = 0;

	//Get information on the logged in user
	$scope.fetchUserDetails = function () {
		loginState.getLoginState(function (data) {
			$scope.user = data.userInfo;
		});
	};

	//Initially, fetch the user details
	$scope.fetchUserDetails();
}]);
