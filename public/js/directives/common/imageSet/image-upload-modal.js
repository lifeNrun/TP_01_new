imagesetApp.directive('imageUploadModal', ['$timeout',  function ($timeout) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            imageset: '=',
            defaultTags: '=',
            defaultType: '=',
            uploadedById: '@'
        },
        templateUrl: '/partials/restricted/common/imageSets/image-upload-modal.html',
        link: function (scope, iElement, iAttr) {

            //Get reference to the fileupload and dropzone elements
            var fileUploadElement   = angular.element(iElement).children(".fileupload"),
                dropZoneElement     = angular.element(iElement).find("#dropzone"),
                addImageButton      = angular.element(iElement).find(".btn-addimages"),
                progressBar         = angular.element(iElement).find(".bar");

            //Initialize the scope values
            scope.pendingImages = [];
            scope.uploadProgress = 0;
            scope.uploading = false;
            scope.uploadComplete = false;

            //When user clicks on the Add Image button, actually click the file input
            addImageButton.bind("click", function() {
                angular.element(iElement).find(".fileinput").click();
            });

            //Prevent user from dropping files anywhere outside the dropzones
            angular.element(window.document).bind('drop dragover', function (e) {
                e.preventDefault();
            });

            // Initialize the jQuery file upload component
            fileUploadElement.fileupload({
                xhrFields: {
                    withCredentials: true
                },
                url: '/images',
                type: 'POST',
                dataType: 'json',
                dropZone: dropZoneElement
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
                    if (data.loaded !== data.total) {
                        progressBar.css('width', '100%');

                        $timeout(function() {
                            progressBar.css('width', '0%');

                            //Uploading is finished
                            scope.uploading = false;
                            scope.uploadProgress = 0;
                        }, 500);
                    }
                    //Remove the uploaded image from the pendingImages
                    scope.$apply(function() {
                        for (var i in scope.pendingImages) {

                            if (scope.pendingImages[i].id === data.id) {

                                var newImage = {};

                                if (angular.isUndefined(scope.defaultTags)) {
                                    if (angular.isUndefined(scope.defaultType)) {
                                        newImage = {
                                            url: data.result.secure_url
                                        };
                                    } else {
                                        newImage = {
                                            url: data.result.secure_url,
                                            type: scope.defaultType
                                        };
                                    }
                                } else if (!angular.isUndefined(scope.defaultType)) {
                                    newImage = {
                                        url: data.result.secure_url,
                                        tags: scope.defaultTags,
                                        type: scope.defaultType
                                    };
                                } else {
                                    newImage = {
                                        url: data.result.secure_url,
                                        tags: scope.defaultTags
                                    };
                                }

                                //Assign the uploaded by Id to the image
                                if (!angular.isUndefined(scope.uploadedById)) {
                                    newImage.uploadedById = scope.uploadedById;
                                }

                                scope.imageset.images.unshift(newImage);
                                scope.imageset.dirty = true;

                                //Remove from pendingImages
                                scope.pendingImages.splice(i, 1);

                                return;
                            }
                        }
                    });
                },

                stop: function (e) {

                },

                //Update progress
                progressall: function(event, data) {

                    //Update upload progress
                    progressBar.css('width', parseInt((data.loaded / data.total) * 100, 10) + '%');

                    if (data.loaded === data.total) {
                        //Upload completed
                        scope.uploading = false;
                        scope.uploadComplete = true;
                        //Reset after 5 seconds
                        $timeout(function () {

                            //Reset the progress bar
                            progressBar.css('width', '0%');

                            //Uploading is finished
                            scope.uploadComplete = false;
                            scope.uploadProgress = 0;
                        }, 5000);
                    }
                },

                //Error handler for the file uploader
                error: function(err) {
                    console.log("Error : " + JSON.stringify(err));

                    scope.uploading = false;
                }

            });

            scope.uploadImages = function () {
                scope.uploadProgress = 0;
                scope.uploading = true;

                for (var i = 0; i < scope.pendingImages.length; i++) {
                    scope.pendingImages[i].data.submit();
                }
            };
        }
    };
}]);
