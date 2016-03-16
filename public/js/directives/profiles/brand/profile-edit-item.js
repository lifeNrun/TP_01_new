dashboardApp.directive('brandProfileEditItem', function() {
	return {
		restrict: 'E',
		scope: {
			editing: '=',
			userInfo: '=',
			userImageSetDetails: '=',
			onUpdate: '&',
			onDiscard: '&'
		},
		templateUrl: '/partials/restricted/profiles/brand/profile-edit-item.html',
		controller: 'brandProfileEditItemCtrl'
	};
});