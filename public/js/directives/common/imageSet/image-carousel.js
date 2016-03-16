imagesetApp.directive('imageCarousel', [function () {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			imageset: '=',
			imageMode: '='
		},
		templateUrl: '/partials/restricted/common/imageSets/carousel.html',
		link: function (scope, iElement, iAttr) {
			if (angular.isUndefined(scope.imagesetMode)) {
				scope.imagesetMode = "c_fit";
			}

            scope.$watch('imageset', function () {
                if (angular.isUndefined(scope.imageset)) {
                    return;
                }

                scope.record = scope.imageset;
                angular.element("#imageCarousel").modal();

                //Returns the scaled version of the image
                scope.getScaledImage = function (fullSizeImageUrl) {

                    //Prepare the regular expression for the host URL
                    var hostUrlRe = /\/[^\/]+\/[^\/]+$/;

                    //Get the host URL
                    var hostUrl = fullSizeImageUrl.split(hostUrlRe)[0];

                    //Get the remaining part of the URL
                    var tempString = fullSizeImageUrl.split(hostUrl + '/')[1];

                    var imageIdUrlRe = /\//;

                    //Get the public ID of the image along with the extension
                    var imageIdUrl = tempString.split(imageIdUrlRe)[1];

                    //Get the scaled image width
                    //var width = "w_" + config.scaledImageWidth;
                    var width = "w_350";


                    //Get the scaled image height
                    //var height = "h_" + config.scaledImageHeight;
                    var height = "h_200";

                    //Finally return the URL
                    return hostUrl + '/' + width +',' + height + ',' + scope.imageMode + '/' + imageIdUrl;
                };
            });
		}
	};
}]);
