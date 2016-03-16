imagesetApp.directive('imageUploadStandalone', ['notificationWindow',
function (notificationWindow) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            imageset: '=',
            type: '=',
            returnUrl: '='
        },
        templateUrl: '/partials/restricted/common/imageSets/image-standalone-upload.html',
        link: function (scope, iElement, iAttr) {

            //Get reference to the fileupload and dropzone elements
            var fileUploadElement   = angular.element(iElement).children(".fileupload"),
                addImageButton      = angular.element(iElement).find(".btn-addimages");

            //Initialize the scope values
            scope.pendingImages = [];
            scope.uploadedImages = [];

            //When user clicks on the Add Image button, actually click the file input
            addImageButton.bind("click", function() {
                angular.element(iElement).find(".fileinput").click();
            });

            // Initialize the jQuery file upload component
            fileUploadElement.fileupload({
                xhrFields: {
                    withCredentials: true
                },
                url: '/images',
                type: 'POST',
                dataType: 'json',
                dropZone: iElement
            });

            //This is where we hook into the jquery file uploader plugin
            fileUploadElement.fileupload({

                //This function is called for each image the user tries to upload
                //This is only when the user is loading the images from their hard drive
                //to the browser and doesn't involve sending anything to the server
                add: function (event, data) {
                    // If no FileReader available, simple submit the form
                    if(!window.FileReader || !window.FileReader.prototype.readAsDataURL) {
                        data.submit();
                        return;
                    }

                    //Unique id to keep track which image is which
                    var _id = new Date().getTime() +'-'+ Math.random();

                    data.id = _id;

                    //We have access to the file API, set up some values
                    var file = data.files[0],
                        fileName = file.name,
                        fileReader = new FileReader();

                    //The onload will be called on the next event loop after the file is loaded into the browser
                    fileReader.onload = function (evt) {
                        //We are going to store the values for the image in an array on the scope
                        var fileBinary = evt.target.result,
                            pendingImage = {
                                id: data.id,
                                name: fileName,
                                src: fileBinary,
                                progressInterval: data.progressInterval,
                                data: window.jQuery.extend(true, {}, data),
                                tags: ''
                            };

                        //Save the browser image into the data for use later
                        data.pendingImage = pendingImage;

                        //Wrap this code in apply because this event occurs outside angular
                        //apply() will call digest() afterwards which will update all other listeners
                        //add the image to the collection (which will cause it to be displayed)
                        scope.$apply(function() {
                            scope.pendingImages.push(pendingImage);
                            scope.uploadImages();
                        });
                    };

                    fileReader.readAsDataURL(file);
                },

                done: function (e, data) {
                    //Remove the uploaded image from the pendingImages
                    scope.$apply(function() {
                        for (var i in scope.pendingImages) {

                            if (scope.pendingImages[i].id === data.id) {

                                var newImage = {};

                                if (angular.isUndefined(scope.type)) {
                                    newImage = {
                                        url: data.result.secure_url
                                    };
                                } else {
                                    newImage = {
                                        url: data.result.secure_url,
                                        type: scope.type
                                    };
                                }

                                if (scope.pendingImages[i].tags) {
                                    newImage.tags = scope.pendingImages[i].tags;
                                }

                                //Update the return URL
                                scope.returnUrl = data.result.secure_url;

                                if (scope.imageset) {
                                    scope.imageset.images.push(newImage);
                                    scope.imageset.dirty = true;
                                }

                                //Remove from pendingImages
                                scope.pendingImages.splice(i, 1);

                                return;
                            }
                        }
                    });
                },

                //Update progress
                progressall: function(event, data) {
                    var uploadPercentage = parseInt((data.loaded / data.total) * 100, 10) + '%';

                    notificationWindow.show('Uploading image : ' + uploadPercentage + ' done');
                },

                //Error handler for the file uploader
                error: function(err) {
                    console.log("Error : " + err);
                }

            });

            scope.uploadImages = function (e) {
                for (var i = 0; i < scope.pendingImages.length; i++) {
                    scope.pendingImages[i].data.submit();
                }
            };
        }
    };
}
]);
