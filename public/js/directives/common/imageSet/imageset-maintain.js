imagesetApp.directive('imagesetSingleDisplay', ['$http', function ($http) {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			displayEntryId: '='
		},
		templateUrl: '/partials/restricted/common/imageSets/maintain.html',
		link: function (scope, iElement, iAttr) {
			//Get the imageset details
			$http.get('/query/imagesets?query={"_id":"' + scope.displayEntryId + '"}')
				.success(function (result) {
					scope.imageset = result[0];
				});
		}
	};
}]);
