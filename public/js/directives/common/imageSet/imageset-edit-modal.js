imagesetApp.directive('imagesetEditModal', ['$http', '$timeout', function ($http, $timeout) {

    'use strict';

    return {
        restrict: 'E',
        templateUrl: '/partials/restricted/common/imageSets/edit-images-modal.html',
        scope: {
            imageset: '=',
            typeSpecific: '=',
            userSpecific: '@'
        },
        link: function (scope, iElement, iAttrs) {

            scope.$watch('imageset', function () {
                var images = [],
                    i;

                if (angular.isUndefined(scope.imageset)) {
                    return;
                }

                scope.record = {};
                scope.copyOfRecord = {};

                //Update the displayed images
                //If a specific type is provided, then display images only of that specific type
                if (angular.isUndefined(scope.typeSpecific)) {
                    angular.copy(scope.imageset, scope.record);
                } else {
                    //Filter the images based on the type
                    angular.copy(scope.imageset, scope.record);
                    scope.record.images = [];

                    for (i = 0; i < scope.imageset.images.length; i++) {
                        if (scope.imageset.images[i].type === scope.typeSpecific) {
                            scope.record.images.push(scope.imageset.images[i]);
                        }
                    }
                }

                //Filter based on uploaded user, if requested
                if (!angular.isUndefined(scope.userSpecific)) {
                    images = scope.record.images.slice(0);
                    scope.record.images = [];

                    for (i = 0; i < images.length; i++) {
                        if (images[i].uploadedById === scope.userSpecific) {
                            scope.record.images.push(images[i]);
                        }
                    }
                }

                //No changes to Image Set yet
                scope.record.dirty = false;

                //Create a copy of the Image Set. This is to identify if there
                //are any genuine changes to the images in the set.
                angular.copy(scope.record, scope.copyOfRecord);

                //Is this image the cover photo?
                scope.isCoverPhoto = function (imageId) {

                    //Get the image identified by the imageIndex
                    for (var i = 0; i < scope.record.images.length; i++) {
                        if (scope.record.images[i]._id === imageId) {
                            if (scope.record.coverPhoto === scope.record.images[i].url) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }

                    return false;
                };

                //Make the image as the cover photo
                scope.setImageAsCoverPhoto = function (imageId) {

                    //Get the url of the image identified by the imageIndex
                    for (var i = 0; i < scope.imageset.images.length; i++) {
                        if (scope.imageset.images[i]._id === imageId) {

                            //Set this image as the cover photo
                            scope.imageset.coverPhoto = scope.imageset.images[i].url;

                            //The imageset is now dirty - it needs to be updated
                            scope.imageset.dirty = true;
                        }
                    }
                };

                //Returns the scaled version of the image
                scope.getScaledImage = function (fullSizeImageUrl, width, height, cropMode) {

                    //Prepare the regular expression for the host URL
                    var hostUrlRe = /\/[^\/]+\/[^\/]+$/;

                    //Get the host URL
                    var hostUrl = fullSizeImageUrl.split(hostUrlRe)[0];

                    //Get the remaining part of the URL
                    var tempString = fullSizeImageUrl.split(hostUrl + '/')[1];

                    var imageIdUrlRe = /\//;

                    //Get the public ID of the image along with the extension
                    var imageIdUrl = tempString.split(imageIdUrlRe)[1];

                    if (!cropMode) {
                        cropMode = 'c_scale';
                    }

                    //Finally return the URL
                    return hostUrl + '/' + width +',' + height + ',' + cropMode + '/' + imageIdUrl;
                };

                //Delete an image from the imageset
                scope.deleteImage = function (imageId) {
                    for (var i = 0; i < scope.imageset.images.length; i++) {
                        if (scope.imageset.images[i]._id === imageId) {

                            //Check if the Image is also the Cover Photo
                            if (scope.isCoverPhoto(imageId)) {
                                //Yes, the deleted image is also the cover photo.
                                //Delete the cover Photo off the Image Set
                                scope.imageset.coverPhoto = null;
                            }

                            scope.imageset.images.splice(i, 1);

                            scope.imageset.dirty = true;
                            break;
                        }
                    }
                };

                //Update the image set
                scope.updateImageset = function (affectedImage) {
                    var _imageset = {},
                        imageChanged = false,
                        images = [],
                        i;

                    for (i = 0; i < scope.copyOfRecord.images.length; i++) {
                        if (scope.copyOfRecord.images[i]._id === affectedImage._id) {
                            //Check if anything has changed - update only in such cases.
                            if (scope.copyOfRecord.images[i].name !== affectedImage.name) {
                                //Name has changed
                                imageChanged = true;
                            } else if (scope.copyOfRecord.images[i].description !== affectedImage.description) {
                                //Description has changed
                                imageChanged = true;
                            } else if (scope.copyOfRecord.images[i].tags !== affectedImage.tags) {
                                //Tags have changed
                                imageChanged = true;
                            }

                            //We found the image that was affected. No need to continue with
                            //the loop
                            break;
                        }
                    }

                    //Proceed only if we have a change
                    if (!imageChanged) {
                        return;
                    } else {
                        if (angular.isUndefined(scope.typeSpecific)) {
                            //Proceed to copy the updated Image Set to the original Image Set
                            angular.copy(scope.record, scope.imageset);
                        } else if (angular.isUndefined(scope.userSpecific)) {
                            //Store the images from the original set
                            images = scope.imageset.images.slice(0);

                            //Proceed to copy the updated Image Set to the original Image Set
                            angular.copy(scope.record, scope.imageset);

                            //Now, add all the images that are NOT of the type passed
                            for (i = 0; i < images.length; i++) {
                                if (images[i].type === scope.typeSpecific) {
                                    //Ignore this image
                                    continue;
                                }

                                //Add it to the original Image Set
                                scope.imageset.images.push(images[i]);
                            }
                        } else {
                            //Store the images from the original set
                            images = scope.imageset.images.slice(0);

                            //Proceed to copy the updated Image Set to the original Image Set
                            angular.copy(scope.record, scope.imageset);

                            //Now, add all the images that are NOT of the type passed
                            for (i = 0; i < images.length; i++) {
                                if (images[i].type === scope.typeSpecific && images[i].uploadedById === scope.userSpecific) {
                                    //Ignore this image
                                    continue;
                                }

                                //Add it to the original Image Set
                                scope.imageset.images.push(images[i]);
                            }
                        }

                        //Ask the host to update the Image Set now
                        scope.imageset.dirty = true;
                    }
                };

                scope.onDropComplete = function (parentIndex, index, obj, evt) {
                    var indexTemp = index + (parentIndex * 4);
                    var otherObj = scope.record.images[indexTemp];
                    var otherIndex = scope.record.images.indexOf(obj);
                    scope.record.images[indexTemp] = obj;
                    scope.record.images[otherIndex] = otherObj;
                    angular.copy(scope.record, scope.imageset);
                    scope.imageset.dirty = true;
                };

                //The getDivision() and getImagesPerDivision() functions are two wonderful
                //algorithms that work with each other.
                //Basically, the view needs to display images in sets of four, with each set
                //being displayed in one row
                //Thus, getDivision() decides the number of rows / sets possible and
                //getImagesPerDisivion decides the images that go in each row / set

                //Divide the number of images in the Image Set into sets of four Images
                scope.getDivision = function () {
                    var result = [],
                        count = 1;

                    for (var i = 0; i < scope.record.images.length; i++) {
                        if (i % 4 === 0) {
                            result.push(count);
                            count = count + 1;
                        }
                    }

                    return result;
                };

                //Returns the images in a division
                scope.getImagesPerDivision = function (divisionNumber) {
                    var result = [],
                        count = 0;

                    for (var i = 0; i < scope.record.images.length; i++) {
                        //Divide each image into sets of four
                        if (i % 4 === 0) {
                            count = count + 1;
                        }

                        if (count === divisionNumber) {
                            //Current count is same as division number provided
                            //Current image belongs to the same division
                            result.push(scope.record.images[i]);
                        } else if (count > divisionNumber) {
                            //No point in continuing - all images of the requested division have been found
                            break;
                        }
                    }

                    return result;
                };

                //Based on the type of the images being displayed, certain features are disabled
                scope.disableCoverPhotoFeature = function (imageType) {
                    //Images of type 'Bio' need this feature
                    if (imageType === 'bio') {
                        return false;
                    }

                    return true;
                };

                scope.disableTagFeature = function (imageType) {
                    //Images of type 'Bio' need this feature
                    if (imageType === 'bio') {
                        return false;
                    }

                    return true;
                };

                scope.disableImageDisplayFeature = function (imageType) {
                    //Images of type 'Rules' do not need this feature
                    if (imageType === 'rules') {
                        return true;
                    }

                    return false;
                };

                //Check if the type of the images filtered is "bio"
                //If so, check if there are more than one image
                //If not, then set the lone image to the cover photo of the Image Set
                $timeout(function () {
                    if (scope.typeSpecific === 'bio') {
                        if (scope.record.images.length === 1) {
                            if (scope.imageset.coverPhoto === null || scope.imageset.coverPhoto === undefined || scope.imageset.coverPhoto === "") {
                                //Set the lone image as the cover photo
                                scope.setImageAsCoverPhoto(scope.record.images[0]._id);
                            }
                        }
                    }
                }, 1000);
            });
        }
    };
}]);
