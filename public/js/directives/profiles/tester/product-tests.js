/*********************************************************
    This contains the directives for the Product Tests
    dashboard item of a user of type Tester.
    module: dashboardApp
**********************************************************/

dashboardApp.directive('weartestInfo', [function () {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            wearTestDetails: '=',
            display: '='
        },
        templateUrl: '/partials/restricted/profiles/tester/product-tests-info.html',
        controller: function ($scope) {
            //Close the Info modal
            $scope.closeInfoModal = function ($window) {
                $scope.wearTestDetails = {};
                $scope.display = false;
            };

            //Modal options
            $scope.dialogOptions = {
                backdropFade: true,
                dialogFade: true
            };

            $scope.printDiv = function (divName) {
                var printContents = document.getElementById(divName).innerHTML;
                var originalContents = document.body.innerHTML;

                if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                    var popupWin = window.open('', '_blank', 'width=600,height=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                    popupWin.window.focus();
                    popupWin.document.write('<!DOCTYPE html><html><head>' +
                     '<link rel="stylesheet" type="text/css" href="style.css" />' +
                      '</head><body onload="window.print()"><div class="reward-body">' + printContents + '</div></html>');
                      popupWin.onbeforeunload = function (event) {
                          popupWin.close();
                         return '.\n';
                      };
                      popupWin.onabort = function (event) {
                          popupWin.document.close();
                          popupWin.close();
                      }
                   } else {
                       var popupWin = window.open('', '_blank', 'width=800,height=600');
                       popupWin.document.open();
                       popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</html>');
                       popupWin.document.close();
                   }
                    popupWin.document.close();

                    return true;
            }
        }
    };
}]);

dashboardApp.directive('currentTests', ['$http', function ($http) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            weartests: '=',
            loadingData: '=',
            userDetails: '=',
            updateData: '&'
        },
        templateUrl: '/partials/restricted/profiles/tester/product-tests-current.html',
        link: function (scope, iElement, iAttr) {
            scope.errors = {};
            scope.errors.errorFlag = false;

            scope.$watch('weartests', function () {
                var i;

                if (!angular.isUndefined(scope.weartests) && scope.weartests.length > 0) {
                    //Get all the Wear Tests IDs
                    for (i = 0; i < scope.weartests.length; i++) {
                        scope.wearTestIds.push(scope.weartests[i]._id);
                        //Now, get all the Survey IDs
                        for (var j = 0; j < scope.weartests[i].productSurveys.length; j++) {
                            scope.surveyIds.push(scope.weartests[i].productSurveys[j].survey_id);
                        }
                    }

                    //Get the Submitted Surveys for the Wear Tests
                    scope.getProductSurveys(false);

                    //Get the corresponding activity logs
                    scope.getUserActivityLogsForWearTest();

                    //Get the images in the Image Set corresponding to the Wear Tests
                    scope.getImagesInImageSetOfWearTest();

                    //Calculate the percentage of completion
                    scope.completed = [];
                    for (i = 0; i < scope.weartests.length; i++) {
                        scope.completed.push(0);
                    }
                    scope.setCompletionPercentage();
                }
            });

            //Watch the changes to a specific Image Set of a Wear Test
            scope.$watch('imageSetDetails.dirty', function () {
                //Proceed only if the Image Set has changed
                if (scope.imageSetDetails.dirty === true) {
                    //Reset it
                    scope.imageSetDetails.dirty = false;
                } else {
                    //Nothing to do
                    return;
                }

                var _imageset = {};

                angular.copy(scope.imageSetDetails, _imageset);

                //Fixing internal server error on the api side
                _imageset.id = _imageset._id;
                delete _imageset._id;

                $http.put('/tableControlApi/imagesets/' + _imageset.id, _imageset)
                    .success(function (result) {
                        //Update the Image Set
                        //scope.imageSetDetails = JSON.parse(result.data);
                        scope.imageSetDetails = result.data;

                        //Remember that we need to update the original Wear Test
                        //once the modal closes
                        scope.updateImageSetInfoPostModalClose = true;
                    });
            });

            //Keep a watch over the update needed post activity log creation
            scope.$watch('updateWearTestInfoPostActivityLogCreation', function () {
                if (scope.updateWearTestInfoPostActivityLogCreation === true) {
                    //Update the Activity log information
                    scope.getUserActivityLogsForWearTest(true);
                }
                scope.updateWearTestInfoPostActivityLogCreation =false;
            });
        },
        controller: 'CurrentProductTestsCtrl'
    };
}]);

dashboardApp.directive('pendingTests', [function () {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            weartests: '=',
            loadingData: '=',
            userId: '=',
            confirmUserParticipation: '='
        },
        templateUrl: '/partials/restricted/profiles/tester/product-tests-pending.html',
        controller: 'PendingProductTestsCtrl'
    };
}]);

dashboardApp.directive('newTests', ['$timeout', function ($timeout) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            weartests: '=',
            loadingData: '=',
            requestUserParticipation: '=',
            participationConfirmed: '='
        },
        templateUrl: '/partials/restricted/profiles/tester/product-tests-new.html',
        link: function (scope, iElement, iAttr) {

            //Watch the confirmation of participation
            scope.$watch('participationConfirmed', function() {
                if (scope.participationConfirmed === true) {
                    //Display the confirmation to the user
                    scope.displayParticipationConfirmationModal();

                    //Reset confirmation
                    scope.participationConfirmed = false;
                    scope.requestInProgress = false;
                }
            });
        },
        controller: 'NewProductTestsCtrl'
    };
}]);

dashboardApp.directive('pastTests', [function () {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            weartests: '=',
            loadingData: '='
        },
        templateUrl: '/partials/restricted/profiles/tester/product-tests-past.html',
        controller: 'PastProductTestsCtrl'
    };
}]);
