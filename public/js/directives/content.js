/**************************************************************
	This file contains the directives applicable for content

    Module: dashboardApp
***************************************************************/
j$ = jQuery.noConflict();

//this is the first definition of the module, must have the [] parameters
var module = angular.module('WTContent',['ngSanitize']);

module.directive('wtContentView', function($http,$rootElement){
  return {
    //templateUrl: '/template/wt-blog-view.html',
    templateUrl: '/partials/content-view.html',
    restrict: 'E',
    scope: {
            location: '=',
            limit: '=',
            audience: '=',
            tags: '=',
            showTitle: '=',
            showTags: '=',
            showDate: '=',
            raw: '='
        },
    transclude:true,
	replace: false,
    controller: function($scope,$element,$compile,$http, $sanitize,$attrs) {
			
			$scope.loading = true;
			$scope.errorLoading = false;
			$scope.blogPosts = [];

			function init()
			{
				$scope.errorLoading = false;
				var queryObj = {location:$scope.location,status:'Active'};
				if($scope.audience  && $scope.audience.length>0) queryObj.audience = $scope.audience;
				if($scope.tags && $scope.tags.length>0) queryObj.tags = $scope.tags;
				var query = '?query='+JSON.stringify(queryObj);
				//console.log(query);
				delete $http.defaults.headers.common['X-Requested-With'];
				var promise = $http.get('/query/blogContents'+query);
				promise.then(function(response) {
					$scope.loading = false;
					//console.log(response);
					if(response.data.error ){
						$scope.errorLoading = true;
						return;
					}
					$scope.blogPosts = response.data;
			
				},
			  	function(reason) {
					console.log(reason.data);
					$scope.loading = false;
					$scope.errorLoading = true;
				  });
			}
			
			init();
    },
    link: function (scope,element,attr) {
	}
}});

module.directive('publicBlogPosts', function() {
	return {
		templateUrl: '/partials/content-view.html',
		restrict: 'E',
		scope: {
			name: '='
		},
		controller: ['$scope', '$http', function($scope, $http) {
			function error() {
				$scope.errorLoading = true;
			}

			$scope.blogPosts = [];

			$scope.errorLoading = false;
			
			var path = '/public/' + $scope.name;

			$http.get(path).success(function (data) {
				$scope.loading = false;

				if (data.code) {
					error();
				}

				$scope.blogPosts = data;
			}).error(error);
		}]
	};
});
	



