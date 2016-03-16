imagesetApp.directive('imagesetEdit', ['$http', '$timeout', function ($http, $timeout) {

    'use strict';

    return {
        restrict: 'E',
        templateUrl: '/partials/restricted/common/imageSets/edit-images.html',
        scope: {
            imageset: '='
        },
        link: function (scope, iElement, iAttrs) {

            scope.$watch('imageset', function () {
                if (angular.isUndefined(scope.imageset)) {
                    return;
                }

                //Update the displayed images
                scope.record = scope.imageset;

                if (angular.isUndefined(scope.record._id) && !angular.isUndefined(scope.record.id)) {
                    scope.imagesetId = scope.record.id;
                } else {
                    scope.imagesetId = scope.record._id;
                }

                scope.imageMode = "c_fit";
                scope.dirty = false;
                scope.coverPhotoImage = scope.record.coverPhoto;
                scope.showCarouselModal = false;
                scope.showDeletionConfirmation = false;
                scope.imageDeleted = false;
                scope.showEditImagesetModal = false;

                scope.modalOptions = {
                    backdropFade: true,
                    dialogFade: true
                };

                //Different Statuses for an Image Set
                scope.imageSetStatuses = [
                    {
                        name: "Active",
                        value: "active"
                    },
                    {
                        name: "Disabled",
                        value: "disabled"
                    }
                ];

                //Different types of Image Sets
                scope.imageSetTypes = [
                    {
                        name: "Answer",
                        value: "Answer"
                    },
                    {
                        name: "Profile",
                        value: "Profile"
                    },
                    {
                        name: "WearTest",
                        value: "WearTest"
                    }
                ];

                //We can create an API service for that!
                //put / update the imageset
                scope.putImageset = function () {
                    //Update only if the imageset has been changed
                    if (scope.record.dirty === false) {
                        return;
                    }

                    scope.record.coverPhoto = scope.coverPhotoImage;

                    var _imageset = angular.copy(scope.record);

                    //Fixing internal server error on the api side
                    _imageset.id = _imageset._id;
                    delete _imageset._id;

                    $http.put('/tableControlApi/imagesets/' + scope.imagesetId, _imageset)
                        .then(function (result) {

                            scope.record.dirty = false;

                            //If the update happened through a modal, close it
                            if (scope.showEditImagesetModal) {
                                scope.hideEditImagesetModal();
                            }
                        });

                };

                // watch for imageset.dirty
                scope.$watch('record.dirty', function () {
                    if (scope.record.dirty === true) {
                        scope.putImageset();
                    }
                });

                scope.updateTags = function () {
                    scope.record.dirty = true;
                };

                //Is this image the cover photo?
                scope.isCoverPhoto = function (imageIndex) {

                    //Get the image identified by the imageIndex
                    for (var i = 0; i < scope.record.images.length; i++) {
                        if (i === imageIndex) {
                            if (scope.coverPhotoImage === scope.record.images[i].url) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }

                    return false;
                };

                //Make the image as the cover photo
                scope.setImageAsCoverPhoto = function (imageIndex) {

                    //Get the url of the image identified by the imageIndex
                    for (var i = 0; i < scope.record.images.length; i++) {
                        if (i === imageIndex) {

                            //Set this image as the cover photo
                            scope.coverPhotoImage = scope.record.images[i].url;

                            //The imageset is now dirty - it needs to be updated
                            scope.record.dirty = true;
                        }
                    }
                };

                //Update the image scaling mode
                scope.updateMode = function (newMode) {
                    scope.imageMode = newMode;
                };

                //Is the image scaling mode active
                scope.isModeActive = function (mode) {
                    return scope.imageMode === mode;
                };

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

                //Display the carousel for the images
                scope.displayCarousel = function () {
                    scope.showCarouselModal = true;
                };

                //Close the carousel modal
                scope.hideCarousel = function () {
                    scope.showCarouselModal = false;
                };

                //Confirm that the user wishes to delete the image
                scope.confirmDeletion = function (imageId) {
                    scope.showDeletionConfirmation = true;
                    scope.deleteImageId = imageId;
                };

                //Close the deletion confirmation
                scope.hideDeletionConfirmation = function () {
                    scope.showDeletionConfirmation = false;
                };

                //Delete an image from the imageset
                scope.deleteImage = function () {
                    for (var i = 0; i < scope.record.images.length; i++) {
                        if (scope.record.images[i]._id === scope.deleteImageId) {
                            scope.record.images.splice(i, 1);
                            scope.record.dirty = true;

                            scope.imageDeleted = true;
                            $timeout(function () {
                                scope.hideDeletionConfirmation();
                                scope.imageDeleted = false;
                            }, 3000);
                            break;
                        }
                    }
                };

                scope.displayEditImagesetModal = function () {
                    scope.showEditImagesetModal = true;
                };

                scope.hideEditImagesetModal = function () {
                    scope.showEditImagesetModal = false;
                };
            });
        }
    };
}]);
