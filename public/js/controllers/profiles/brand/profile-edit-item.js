dashboardApp.controller('brandProfileEditItemCtrl', ['$scope', '$http', function($scope, $http) {
	'use strict';

	//The options for the Image Set Modal display
	$scope.imageSetModalOptions = {
		dialogFade: true,
		backdropFade: true,
		dialogClass: 'modal wider'
	};

	//Hide the imageset modal initially
	$scope.showImageSetModal = false;

	$scope.update = function() {
		$http.put('/api/updateUser', $scope.userInfo);

		if ($scope.onUpdate) $scope.onUpdate();

		$scope.editing = false;
	};

	$scope.discard = function() {
		if ($scope.onDiscard) $scope.onDiscard();
		$scope.editing = false;
	};

	//Display the Image Set Modal
	$scope.displayImageSetModal = function () {
		$scope.showImageSetModal = true;
	};

	//Close the Image Set Modal
	$scope.closeImageSetModal = function () {
		$scope.showImageSetModal = false;
	};

    //Returns the scaled version of the image
    $scope.getScaledImage = function (fullSizeImageUrl, width, height) {

        if (fullSizeImageUrl === undefined || fullSizeImageUrl === null || fullSizeImageUrl === "") {
            return;
        }

        //Prepare the regular expression for the host URL
        var hostUrlRe = /\/[^\/]+\/[^\/]+$/;

        //Get the host URL
        var hostUrl = fullSizeImageUrl.split(hostUrlRe)[0];

        //Get the remaining part of the URL
        var tempString = fullSizeImageUrl.split(hostUrl + '/')[1];

        var imageIdUrlRe = /\//;

        //Get the public ID of the image along with the extension
        var imageIdUrl = tempString.split(imageIdUrlRe)[1];

        //Finally return the URL
        return hostUrl + '/' + width +',' + height +  '/' + imageIdUrl;
    };

}]);