dashboardApp.directive('weartestDraft', ['$timeout',
function ($timeout) {
    'use strict';
    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/draft.html',
        controller: 'WeartestDraftCtrl'
    };
}
]);

