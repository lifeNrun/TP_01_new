dashboardApp.directive('weartestEdit', ['$timeout', 'imageHandler', 'OS', 
function ($timeout, imageHandler, OS) {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/edit.html',
        controller: 'WeartestCreateEditCtrl',
        link: function (scope, element, attrs) {
            var surveyFilterWatch;

            //Tooltip for multiple selection
            scope.multiSelectTooltip = OS.isMac() ? 'To select multiple activities, hold down the COMMAND key' : 'To select multiple activities, hold down the CTRL key';

            //Watch all the dates and covert them to proper format
            scope.$watch('weartest.registrationStart' ,function () {
                if (typeof scope.weartest.registrationStart === 'string') {
                    scope.weartest.registrationStart = new Date(scope.weartest.registrationStart);
                }
            });

            scope.$watch('weartest.registrationDeadline' ,function () {
                if (typeof scope.weartest.registrationDeadline === 'string') {
                    scope.weartest.registrationDeadline = new Date(scope.weartest.registrationDeadline);
                }
            });

            scope.$watch('weartest.draftDate' ,function () {
                if (typeof scope.weartest.draftDate === 'string') {
                    scope.weartest.draftDate = new Date(scope.weartest.draftDate);
                }
            });

            scope.$watch('weartest.wearTestStartDate' ,function () {
                if (typeof scope.weartest.wearTestStartDate === 'string') {
                    scope.weartest.wearTestStartDate = new Date(scope.weartest.wearTestStartDate);
                }
            });

            scope.$watch('weartest.wearTestEndDate' ,function () {
                if (typeof scope.weartest.wearTestEndDate === 'string') {
                    scope.weartest.wearTestEndDate = new Date(scope.weartest.wearTestEndDate);
                }
            });

            scope.$watch('weartest.brandLogoLink', function () {
                if (typeof scope.weartest.brandLogoLink === 'string' && scope.weartest.brandLogoLink.length > 0) {
                    scope.updateWeartest('brandLogoLink');
                }
            });

            scope.$watch('weartest.featureImageLink', function () {
                if (typeof scope.weartest.featureImageLink === 'string' && scope.weartest.featureImageLink.length > 0) {
                    scope.updateWeartest('featureImageLink');

                    scope.imagesetForWeartest.coverPhoto = scope.weartest.featureImageLink;

                    //Update our local buffer with the new cover photo
                    imageHandler.setCoverPhoto(scope.imagesetForWeartest._id, scope.imagesetForWeartest.coverPhoto);

                    scope.updateImagesetForWeartest(true);
                } else if (typeof scope.weartest.featureImageLink === 'string' && scope.weartest.featureImageLink.length === 0) {
                    //Feature image could have been deleted - update the cover photo too
                    if (typeof scope.imagesetForWeartest.coverPhoto === 'string' && scope.imagesetForWeartest.coverPhoto.length > 0) {
                        scope.imagesetForWeartest.coverPhoto = scope.weartest.featureImageLink;

                        //Update our local buffer with the new cover photo
                        imageHandler.setCoverPhoto(scope.imagesetForWeartest._id, scope.imagesetForWeartest.coverPhoto);

                        scope.updateImagesetForWeartest(true);
                    }
                }
            });

            scope.$watch('imagesetForWeartest.dirty', function () {
                if (scope.imagesetForWeartest.dirty) {
                    scope.imagesetForWeartest.dirty = false;

                    scope.updateImagesetForWeartest();
                }
            });

            //Keep an eye over the user Image Set details (specific for rules upload only)
            scope.$watch('imagesetForUser.dirty', function () {
                if (angular.isUndefined(scope.imagesetForUser)) {
                    return;
                } else if (scope.imagesetForUser.dirty === true) {
                    scope.imagesetForUser.dirty = false;

                    scope.updateImagesetForUser();
                }
            });

            //we have to watch the actual productWearAndTearDates object and convert it to our productWearAndTearDates which is needed for
            //the date picker
            scope.$watch('weartest.performanceZonesDates' ,function () {
                var i;

                //exit if object undefined
                if (!scope.weartest.performanceZonesDates) {
                    return;
                }

                //reset the object for datepicker - it gets rewritten with actual data from the API in the loop
                scope.performanceZonesDates = [];

                for (i = 0; i < scope.weartest.performanceZonesDates.length; i++) {
                    if (typeof scope.weartest.performanceZonesDates[i] === 'string') {
                        scope.weartest.performanceZonesDates[i] = new Date(scope.weartest.performanceZonesDates[i]);
                    }

                    scope.performanceZonesDates.push({"date": scope.weartest.performanceZonesDates[i]});
                }
            });

            //we have to watch the actual productWearAndTearDates object and convert it to our productWearAndTearDates which is needed for
            //the date picker
            scope.$watch('weartest.productWearAndTearDates' ,function () {
                var i;

                //exit if object undefined
                if (!scope.weartest.productWearAndTearDates) {
                    return;
                }

                //reset the object for datepicker - it gets rewritten with actuall data from the API in the loop
                scope.productWearAndTearDates = [];

                for (i = 0; i < scope.weartest.productWearAndTearDates.length; i++) {
                    if(typeof scope.weartest.productWearAndTearDates[i] === 'string') {
                        scope.weartest.productWearAndTearDates[i] = new Date(scope.weartest.productWearAndTearDates[i]);
                    }

                    scope.productWearAndTearDates.push({"date": scope.weartest.productWearAndTearDates[i]});
                }
            });

            //Show the filtered survey results only when the user has done typing
            scope.$watch(function () {
                return scope.control.surveyFilter.length;
            }, function () {
                if (surveyFilterWatch) {
                    $timeout.cancel(surveyFilterWatch);

                    surveyFilterWatch = undefined;
                }

                if (scope.control.surveyFilter.length > 0) {
                    surveyFilterWatch = $timeout(function () {
                        scope.showSurveyListFilteredResults = true;
                    }, 700);
                } else {
                    scope.showSurveyListFilteredResults = false;
                }
            });

            scope.$watch('weartest.productSurveys' ,function () {
                var i;

                if (scope.weartest.productSurveys) {
                    for (i = 0; i < scope.weartest.productSurveys.length; i++) {
                        if (typeof scope.weartest.productSurveys[i].triggerDate === 'string')
                            scope.weartest.productSurveys[i].triggerDate = new Date(scope.weartest.productSurveys[i].triggerDate);
                    }
                }
            });
        }
    };
}
]);
