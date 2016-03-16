/*Controller for partials/restricted/brand-landing-designs/brand-design-landing.html*/
app.controller('BrandDesignLandingCtrl', ['$scope', '$http',
    function ($scope, $http) {
        //The wear tests are being loaded
        $scope.loadingWearTests = true;
        $scope.loading = true;
        $scope.errorLoading = false;
        $scope.blogPosts = [];
        $scope.initBrandLandingDesigns = function () {
            $scope.errorLoading = false;
            var promise = $http.get('/public/brandLandingDesigns');
            promise.then(function (response) {
                    $scope.loading = false;
                    if (response.data.error) {
                        $scope.errorLoading = true;
                        return;
                    }
                    $scope.blogPosts = response.data;
                    console.log($scope.blogPosts);
                },
                function (reason) {
                    console.log(reason.data);
                    $scope.loading = false;
                    $scope.errorLoading = true;
                });
        };

        //Fetch the wear tests
        $scope.fetchWearTests = function () {
            $scope.loadingWearTests = true;
            //This section should use the API to retrieve all the information below and should retrieve the top three
            var url = '/public/testerWeartests';
            $http.get(url)
                .success(function (data) {
                    $scope.wearTests = data;
                    //Done loading
                    $scope.loadingWearTests = false;
                });
        };

        //Returns the image based on the status of the wear test
        $scope.getImageForWearTests = function (wearTestImage, sizeW, sizeH,transformMode) {
            var imageLink = "";
             if (transformMode === undefined ) { var transformMode  = 'c_scale'; }
            if (wearTestImage) {
                if (wearTestImage.indexOf("res.cloudinary.com/weartest/image") !== -1) {
                    var url = wearTestImage.substring(0, wearTestImage.lastIndexOf("/"))
                    var m = url.lastIndexOf("/");
                    var sizeImage = 'h_' + sizeH + ',w_' + sizeW;
                    imageLink = wearTestImage.substring(0, m) + "/" + sizeImage + "," + transformMode + wearTestImage.substring(m)
                } else {
                    imageLink = wearTestImage;
                }
            }
            return imageLink;
        };

        //Get the logged in users info
        $scope.initializeManagement = function () {
            //Fetch the wear tests for the current user
            $scope.fetchWearTests();
            $scope.initBrandLandingDesigns();
        };

        //set wear test info for model
        $scope.setWearTestInfo = function (wearTestItem) {
            $scope.wearTestInfo = wearTestItem;
        };

        //gets the images that are used in Carousel in the main-landing.html
        $scope.getLandingCarouselImages = function () {
            $http.get('/public/testerLandingCarousel')
                .success(function (data) {
                    //save the image set in the scope variable
                    $scope.carouselLandingImages = $scope.adjustLandingCarouselImages(data[0]);
                });
        };

        $scope.initializeManagement();

        $scope.getLandingCarouselImages();
    }
]);
