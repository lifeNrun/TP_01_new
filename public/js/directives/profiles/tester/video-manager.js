dashboardApp.directive('videoManager', [
    function () {
        return {
            restrict: 'E',
            templateUrl: '/partials/restricted/profiles/tester/video-manager.html',
            controller: 'VideoManagerCtrl'
        };
    }
]);
