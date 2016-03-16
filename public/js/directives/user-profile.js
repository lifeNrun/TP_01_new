/**************************************************************
	This file contains the directives applicable to a user
	profile.

    Module: dashboardApp
***************************************************************/
'use strict';

dashboardApp.directive('adminProfile', function () {
	return {
		restrict: 'E',
		scope: {
			userData: '='
		},
		templateUrl: '/partials/restricted/profiles/admin/landing-page.html',
		controller: 'AdminProfileLandingPageCtrl'
	};
});

dashboardApp.directive('testerProfile', function () {
	return {
		restrict: 'E',
		scope: {
			userData: '='
		},
		templateUrl: '/partials/restricted/profiles/tester/landing-page.html',
		controller: 'TesterProfileLandingPageCtrl'
	};
});

dashboardApp.directive('brandProfile', function () {
	return {
		restrict: 'E',
		scope: {
			userData: '='
		},
		templateUrl: '/partials/restricted/profiles/brand/landing-page.html',
		controller: 'BrandProfileLandingPageCtrl'
	};
});

dashboardApp.directive('adminCorrectionReportItem', function () {
	return {
		restrict: 'E',
		templateUrl: '/partials/restricted/profiles/admin/correction-reports.html',
		controller: 'AdminCorrectionReportCtrl'
	};
});

dashboardApp.directive('adminProfileItem', function () {
	return {
		restrict: 'E',
		templateUrl: '/partials/restricted/profiles/admin/profile-item.html',
		controller: 'AdminProfileItemCtrl'
	};
});

dashboardApp.directive('adminToolsItem', function () {
	return {
		restrict: 'E',
		templateUrl: '/partials/restricted/profiles/admin/tools-item.html',
		controller: 'AdminToolsItemCtrl'
	};
});

dashboardApp.directive('testerActivityLogsItem', function () {
	return {
		restrict: 'E',
		templateUrl: '/partials/restricted/profiles/tester/activity-logs-item.html',
		controller: 'ActivityLogsItemCtrl'
	};
});

dashboardApp.directive('testerProductTestsItem', function () {
	return {
		restrict: 'E',
		templateUrl: '/partials/restricted/profiles/tester/product-tests-item.html',
		controller: 'ProductTestsItemCtrl'
	};
});

dashboardApp.directive('testerProfileItem', function () {
	return {
		restrict: 'E',
		templateUrl: '/partials/restricted/profiles/tester/profile-item.html',
		controller: 'TesterProfileItemCtrl'
	};
});

dashboardApp.directive('adminInfoTab', function () {
	return {
		restrict: 'E',
		templateUrl: '/partials/restricted/profiles/admin/info-tab.html'
	};
});
