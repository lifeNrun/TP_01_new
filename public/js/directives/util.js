app.directive('processImage', ['$http', '$filter', 'imageHandler',
    function ($http, $filter, imageHandler) {
        return {
            link: function (scope, element, attrs) {
                var imagesetId,
                    width = attrs.imageWidth,
                    height = attrs.imageHeight,
                    mode = attrs.imageMode,
                    path,
                    projection,
                    imagesetWatcher,
                    imageUrl;

                var getCoverPhoto = function () {
                    //Check if the image already exists
                    imageUrl = imageHandler.getCoverPhoto(imagesetId);

                    if (imageUrl) {
                        attrs.$set('src', $filter('getScaledImage')(imageUrl, width, height, mode));
                    } else if (imageUrl !== '') {
                        path = '/api/mesh01/imagesets/' + imagesetId;

                        projection = {
                            '_id': 1,
                            'coverPhoto': 1
                        }

                        path += '?projection=' + JSON.stringify(projection);

                        $http.get(path)
                            .success(function (result) {
                                if (result._id === imagesetId) {
                                    if (!result.coverPhoto) {
                                        result.coverPhoto = '';
                                    }

                                    imageHandler.setCoverPhoto(imagesetId, result.coverPhoto);

                                    if (result.coverPhoto && result.coverPhoto !== '') {
                                        attrs.$set('src', $filter('getScaledImage')(result.coverPhoto, width, height, mode));
                                    }
                                }
                            })
                            .error(function (err) {
                                console.log(err);
                            });
                    }
                }

                imagesetWatcher = scope.$watch(function () {
                    return attrs.imagesetId;
                }, function () {
                    if (attrs.imagesetId && attrs.imagesetId !== '') {
                        imagesetId = attrs.imagesetId;

                        getCoverPhoto();

                        //Stop watching
                        imagesetWatcher();
                    }
                });
            }
        }
    }
]);
