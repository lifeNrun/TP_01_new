dashboardApp.factory('Media', ['$http', 'notificationWindow',
function ($http) {
    'use strict';

    return {
        delete: function (mediaUrl, mediaType, callback) {
            var mediaId,
                query,
                path;

            //Images have their unique ID without extension
            if (mediaType === 'image') {
                mediaId = mediaUrl.substring(mediaUrl.lastIndexOf('/') + 1),
                mediaId = mediaId.substring(0, mediaId.indexOf('.'));
            } else if (mediaType === 'video') {
                mediaId = mediaUrl;
            }

            path = '/api/mesh01/images/' + mediaId;

            query = {
                mediaType: mediaType
            };

            path += '?query=' + JSON.stringify(query);

            $http.delete(path)
                .success(function (result) {
                    if (callback) {
                        callback(result);
                    }
                })
                .error(function (err) {
                    console.log('ERROR');
                    console.log(err);

                    if (callback) {
                        callback(err);
                    }
                });
        }
    };
}
]);
