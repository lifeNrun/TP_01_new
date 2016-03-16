/*************************************************************
    Directive to display of Image Set(s) in a table
    Module: imagesetApp
*************************************************************/

imagesetApp.directive('tabularDisplay', ['$http', '$timeout', function ($http, $timeout) {
    'use strict';

    return {
        restrict: 'EC',
        scope: {
            headerFields: '=',
            allowDeletion: '=',
            entriesPerPage: '=',
            allowViewing: '=',
            tableEntries: '=',
            viewEntry: '='
        },
        templateUrl: '/partials/restricted/common/imageSets/display.html',
        link: function (scope, iElement, iAttr) {

            //Controls the confirmation of deletion
            scope.showConfirmModal = false;

            //Modal behaviour
            scope.modalOptions = {
                backdropFade: true,
                dialogFade: true
            };

            //Keeps track of the entry marked for deletion
            scope.deletionId = null;

            //Identifies when the data is being loaded
            scope.loadingData = true;

            //Identifies the situation when there are no entries to display
            scope.noEntriesToDisplay = false;

            //Controls the action of deleting an entry
            scope.deletionInProgress = false;

            //Confirmation on deletion
            scope.deletionSuccess = false;
            scope.deletionError = false;

            scope.imagesetDisplayLimit = 25;

            //ktb- attempt to add an order by clause
            //scope.myOrder = 'createdDate';

            //Keep an eye over the data to display
            scope.$watch('tableEntries', function () {
                var length,
                    startIndex,
                    endIndex;

                if (angular.isUndefined(scope.tableEntries) || scope.tableEntries === null) {
                    //Yet to receive any data
                    scope.loadingData = true;
                } else if (angular.isArray(scope.tableEntries) && scope.tableEntries.length === 0) {
                    //No entries to display
                    scope.loadingData = false;
                    scope.noEntriesToDisplay = true;
                } else {
                    scope.noEntriesToDisplay = false;

                    scope.loadingData = false;
                }
            }, true);

            //Confirm with the user if the user wishes to delete
            scope.openConfirmDeletionModal = function (entryIdToBeDeleted) {
                scope.showConfirmModal = true;

                scope.deletionId = entryIdToBeDeleted;
            };

            //Closes the confirmatio of deletion modal
            scope.closeConfirmDeletionModal = function () {
                scope.showConfirmModal = false;
            };

            //Delete the entry
            scope.deleteEntry = function () {
                //Proceed only if deletion is allowed
                if (!angular.isUndefined(scope.allowDeletion) && scope.allowDeletion === true) {
                    scope.deletionInProgress = true;
                    $http.delete('/tableControlApi/imagesets/' + scope.deletionId)
                        .success(function (response) {
                            for (var i = 0; i < scope.tableEntries.length; i++) {
                                if (scope.tableEntries[i]._id == scope.deletionId) {
                                    scope.tableEntries.splice(i,1);
                                }
                            }

                            scope.deletionSuccess = true;
                            scope.deletionFailure = false;

                            //Close the confirmation modal after 3 seconds
                            $timeout(function () {
                                scope.closeConfirmDeletionModal();
                                scope.deletionSuccess = false;
                            }, 3000);
                            scope.deletionInProgress = false;
                        })
                        .error(function (err) {
                            scope.deletionSuccess = false;
                            scope.deletionFailure = true;
                            scope.deletionInProgress = false;
                        });
                }
            };

            //Display the entry
            //This is not the responsibility of this directive and thus this directive
            //hands over the ID of the entry to be displayed to the consumer
            scope.displayEntry = function (entryId) {
                //Allow entries to be displayed only if configuration permits
                if (!angular.isUndefined(scope.allowViewing) && scope.allowViewing === true) {
                    scope.viewEntry(entryId);
                }
            };

            //Returns the total column span
            scope.getTotalColumnLength = function () {

                var spanLength = scope.headerFields.length;

                if (scope.allowViewing && scope.allowDeletion) {
                    spanLength = spanLength + 2;
                } else if (scope.allowViewing || scope.allowDeletion) {
                    spanLength = spanLength + 1;
                }

                return spanLength;
            };

             //Returns the scaled version of the image
            scope.getScaledImage = function (fullSizeImageUrl, width, height) {

               if(fullSizeImageUrl)
               {
                //Prepare the regular expression for the host URL
                var hostUrlRe = /\/[^\/]+\/[^\/]+$/;

                //Get the host URL
                var hostUrl = fullSizeImageUrl.split(hostUrlRe)[0];

                //Get the remaining part of the URL
                var tempString = fullSizeImageUrl.split(hostUrl + '/')[1];

                var imageIdUrlRe = /\//;

                //Get the public ID of the image along with the extension
                var imageIdUrl = tempString.split(imageIdUrlRe)[1];

                //Finally return the URL
                return hostUrl + '/' + width +',' + height+',c_fit' +  '/' + imageIdUrl;
              }
               return "";
            };

            scope.increaseDisplayLimit = function () {
                if (scope.loadingData) {
                    return;
                } else if (scope.tableEntries.length < scope.imagesetDisplayLimit) {
                    return;
                } else {
                    scope.imagesetDisplayLimit += 20
                }
            };
        }
    };
}]);
