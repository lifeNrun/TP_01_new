dashboardApp.controller('WeartestWearandtearCtrl', ['$scope', '$http', '$routeParams', '$filter', 'notificationWindow',
function ($scope, $http, $routeParams, $filter, notificationWindow) {
    'use strict';

    var path,
        projection,
        weartestId = $routeParams['itemId'],
        weartest = {},
        testerDetails = [];

    //Loading data
    $scope.loading = true;

    //Contains images of type wearAndTear ordered by the uploaded tester
    $scope.wearAndTearImages = [];

    //Contains videos uploaded by tester
    $scope.productVideos = [];

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
    };

    $scope.customStrictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false,
        dialogClass: 'modal wear-tear-gallery'
    };

    //Controls display of carousel modal of uploaded images
    $scope.showImageModal = false;

    //Contains the details of the tester uploading the Wear and Tear images
    $scope.participatingTesterDetails = {};

    $scope.showVideosUploadedModal = false;

    //Gets the details of the testers that uploaded the Wear and Tear images
    var getTesterDetails = function () {
        var path,
            query,
            projection,
            userIds = [],
            i;

        path = '/api/mesh01/users';

        for (i = 0; i < $scope.wearAndTearImages.length; i++) {
            userIds.push($scope.wearAndTearImages[i].uploadedById);
        }

        for (i = 0; i < $scope.productVideos.length; i++) {
            if (userIds.indexOf($scope.productVideos[i].uploadedById) === -1) {
                userIds.push($scope.productVideos[i].uploadedById);
            }
        }

        query = {
            '_id': {
                '$in': userIds
            }
        };

        projection = {
            '_id': 1,
            'username': 1
        };

        path += '?query=' + JSON.stringify(query);

        path += '&projection=' + JSON.stringify(projection);

        notificationWindow.show('Retrieving details on users who uploaded the images', true);

        $http.get(path)
            .success(function (result) {
                if (angular.isArray(result)) {
                    testerDetails = result;

                    //Done loading
                    $scope.loading = false;

                    notificationWindow.show('All details have been retrieved successfully', false);
                } else {
                    notificationWindow.show('Error retrieving details of users', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error retrieving details of users', false);
            });
    };

    //Fetch the Image Set details of the Wear Test
    var fetchImageSetDetailsOfWearTest = function () {
        var path,
            projection;

        path = '/api/mesh01/imagesets/' + weartest.imageSetId;

        projection = {
            '_id': 1,
            'images': 1
        };

        path += '?projection=' + JSON.stringify(projection);

        notificationWindow.show('Retrieving details of image collection associated with product test', true);

        $http.get(path)
            .success(function (result) {
                var newTester,
                    testerFound,
                    i, j;

                if (result._id === weartest.imageSetId) {

                    notificationWindow.show('Identifying the product images and videos', false);

                    //Filter out the images of type wearAndTear and order the images by uploaded tester
                    for (i = 0; i < result.images.length; i++) {

                        //Consider only Wear and Tear images and videos
                        if (result.images[i].type !== "wearAndTear" && result.images[i].type !== 'productVideo') {
                            continue;
                        }

                        //Initially, we assume that the tester who uploaded the image does not exist
                        testerFound = false;

                        //Check if the tester already exists
                        if (result.images[i].type === 'wearAndTear') {
                            for (j = 0; j < $scope.wearAndTearImages.length; j++) {
                            
                                if ($scope.wearAndTearImages[j].uploadedById === result.images[i].uploadedById) {
                                    //Tester already exists. Add this image to the Tester's uploaded images
                                    $scope.wearAndTearImages[j].images.push(result.images[i]);

                                    //Tester found
                                    testerFound = true;
                                    break;
                                }
                            }

                            //Create a new tester and associate the current image with that tester, if 
                            //the image still hasn't found a home
                            if (!testerFound) {
                                newTester = {};
                                newTester.uploadedById = result.images[i].uploadedById;
                                newTester.images = [];
                                newTester.images.push(result.images[i]);
                                $scope.wearAndTearImages.push(newTester);
                            }
                         }

                        //Create a new tester and associate the current image with that tester, if 
                        //the image still hasn't found a home
                        //Initially, we assume that the tester who uploaded the video does not exist
                        testerFound = false;

                        //Check if the tester already exists
                        if (result.images[i].type === 'productVideo') {
                            for (j = 0; j < $scope.productVideos.length; j++) {
                            
                                if ($scope.productVideos[j].uploadedById === result.images[i].uploadedById) {
                                    //Tester already exists. Add this image to the Tester's uploaded images
                                    $scope.productVideos[j].videos.push(result.images[i]);

                                    //Tester found
                                    testerFound = true;
                                    break;
                                }
                            }

                            //Create a new tester and associate the current video with that tester, if 
                            //the video still hasn't found a home
                            if (!testerFound) {
                                newTester = {};
                                newTester.uploadedById = result.images[i].uploadedById;
                                newTester.videos = [];
                                newTester.videos.push(result.images[i]);
                                $scope.productVideos.push(newTester);
                            }
                       }
                    }

                    if ($scope.wearAndTearImages.length > 0 || $scope.productVideos.length > 0) {
                        //Fetch the details of the Testers that uploaded the images
                        getTesterDetails();
                    } else {
                        //Done loading
                        $scope.loading = false;

                        notificationWindow.show('No product images or videos found', false);
                    }
                } else {
                    notificationWindow.show('Error retrieving image collection details', false);
                }
            })
            .error(function (err) {
                console.log(err);

                notificationWindow.show('Error retrieving image collection details', false);
            });
    };

    path = '/api/mesh01/weartest/' + weartestId;

    projection = {
        '_id': 1,
        'imageSetId': 1
    };

    path += '?projection=' + JSON.stringify(projection);

    notificationWindow.show('Retrieving latest product test details', true);

    $http.get(path)
        .success(function (result) {
            if (result._id === weartestId) {
                weartest = result;

                fetchImageSetDetailsOfWearTest();
            } else {
                notificationWindow.show('Error retrieving product test details', false);
            }
        })
        .error(function (err) {
            console.log(err);

            notificationWindow.show('Error retrieving product test details', false);
        })

    //Display the Wear and Tear carousel modal
    $scope.openImageModal = function (testerInfo) {
        //Store the tester info
        $scope.participatingTesterDetails = testerInfo;

        //Show the modal
        $scope.showImageModal = true;
    };

    //Hide the Wear and Tear carousel modal
    $scope.closeImageModal = function () {
        //Reset the tester info
        $scope.participatingTesterDetails = {};

        //Close the modal
        $scope.showImageModal = false;
    };

    //Divide the number of Testers into groups of four
    $scope.getDivision = function (type) {
        var result = [],
            asset = (type === 'images')? $scope.wearAndTearImages : $scope.productVideos,
            count = 1;

        for (var i = 0; i < asset.length; i++) {
            if (i % 4 === 0) {
                result.push(count);
                count = count + 1;
            }
        }

        return result;
    };

    //Returns the testers in a division
    $scope.getTestersPerDivision = function (type, divisionNumber) {
        var result = [],
            asset = (type === 'images')? $scope.wearAndTearImages : $scope.productVideos,
            count = 0;

        for (var i = 0; i < asset.length; i++) {
            //Divide each tester into sets of four
            if (i % 4 === 0) {
                count = count + 1;
            }

            if (count === divisionNumber) {
                //Current count is same as division number provided
                //Current tester belongs to the same division
                result.push(asset[i]);
            } else if (count > divisionNumber) {
                //No point in continuing - all testers of the requested division have been found
                break;
            }
        }

        return result;
    };

    //Scales the image based on the needs of the view
    $scope.getScaledImage = function (fullSizeImageUrl, usage) {
        var width,
            height,
            mode = 'c_fit',
            url;

        //Prepare the width and height based on the mode
        if (usage === 'thumbnail') {
            width = 190;
            height = 135;
        } else if (usage === 'carousel') {
            width = 500;
            height = 375;
        }

        url = $filter('getScaledImage')(fullSizeImageUrl, width, height, mode);

        return url;
    };

    //Returns the name of the Tester from the Tester Id
    $scope.getTesterName = function (testerId) {
        var i;

        //Find the tester Id and return the name of the tester
        for (i = 0; i < testerDetails.length; i++) {
            if (testerDetails[i]._id === testerId) {
                return testerDetails[i].username;
            }
        }
    };

    $scope.openVideosUploadedModal = function (testerInfo) {
        //Store the tester info
        $scope.participatingTesterDetails = testerInfo;

        //Show the modal
        $scope.showVideosUploadedModal = true;
    };

    $scope.closeVideosUploadedModal = function () {
        //Reset the tester info
        $scope.participatingTesterDetails = {};

        //Close the modal
        $scope.showVideosUploadedModal = false;
    };
}
]);
