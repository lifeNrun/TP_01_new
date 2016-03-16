/**************************************************************
    This file contains the controller for the administrator
    tools dashboard item for the administrator

    Module: dashboardApp
***************************************************************/

dashboardApp.controller('AdminToolsItemCtrl', ['$scope', '$http', '$location', '$routeParams', '$timeout', 'loginState', 'downloadAsCSV', function ($scope, $http, $location, $routeParams, $timeout, loginState, downloadAsCSV) {
    'use strict';

    var tableName = $routeParams.mode,
        documentId = $routeParams.itemId,
        tableAttributes;

    $scope.selectedTableName = tableName;

    $scope.recordDisplayLimit = 20;

    /*
        Keeps track of which tab is active.
        By default, "C.R.U.D. Tools" tab will be active
        1 - C.R.U.D. Tools
        2 - Manage ImageSets
        3 - Admin Info
    */
    $scope.activeTab = 1;

    $scope.exportLink = "";

    $scope.readyToExport = false;
    
    // This variable is always true to Hide the fake button used to simulate a click even for Export Testers
    $scope.alwaysHide = true;

    //Default display of Image Sets - list of existing Image Sets
    $scope.imageSetDisplayMode = "list";
    $scope.editMode = false;

    $scope.user = null;

    //Keeps track of the table that is selected / displayed
    $scope.selectedTable = null;

    //Records in the table
    $scope.tableRecords = [];

    //Hide the table until records are populated
    $scope.hideTable = true;

    //Keep track of the entry being edited
    $scope.itemInEditMode = {};
    $scope.editMode = false;

    $scope.sortColumnsBy = '';
    $scope.sortColumnsOrder = 'asc';

    //Attributes of an Image Set to be visible
    $scope.imagesetHeader = [
        {
            name: 'cover photo'
        },
        {
            name: 'name / count'
        },
        {
            name: 'description'
        },
        {
            name: 'status / type'
        },
        {
            name: 'tags'
        }
    ];

    //Configuration to drive the behaviour of Image Set Dispaly
    $scope.imagesetConfig = {
        deletion: true,
        viewing: true
    };

    //ImageSet related functionality
    $scope.displayEntryId = null;

    $scope.searchFilter = {
        input: ''
    };

    //Creates an object for document projections - returns it as a string
    var getCollectionProjections = function (collection) {
        var result = {};

        projections[collection].forEach(function (attribute) {
            result[attribute] = 1;
        });

        return JSON.stringify(result);
    };

    //Get the attributes of the table
    var fetchTableAttributes = function () {
        $http.get('js/table-control.json')
            .success(function (data) {
                tableAttributes = data;

                $scope.selectedTable = tableAttributes[$scope.selectedTableName];
            });
    };

    //Checks if the tab is active
    $scope.isTabActive = function (tab) {
        return $scope.activeTab === tab;
    };

    //Sets the tab as the active tab
    $scope.setActiveTab = function (tab) {
        $scope.activeTab = tab;

        if ($scope.activeTab === 4) {
            $scope.loadImageSets();
        }
    };

    //Show success message
    $scope.showSuccessMessage = function (message) {
        $scope.successMessage = message;
        $scope.displaySuccessMessage = true;
        $timeout(function () {
            $scope.displaySuccessMessage = false;
        }, 2000);
    };

    //Show error message
    $scope.showErrorMessage = function (message) {
        $scope.errorMessage = message;
        $scope.displayErrorMessage = true;
        $timeout(function () {
            $scope.displayErrorMessage = false;
        }, 2000);
    };

    //Create a new entry in the table - entry created only in buffer.
    //User is required to save the changes
    $scope.addNewEntry = function () {
        var newItem = {};

        for (var i = 0; i < $scope.selectedTable.DetailColumns.length; i++) {
            newItem[$scope.selectedTable.DetailColumns[i].name] = "";
        }

        //Identify this item as being edited
        $scope.itemInEditMode = newItem;
        $scope.editMode = true;
    };

    $scope.deleteEntry = function (entryToDelete) {
        $http.delete('/tableControlApi' + $scope.selectedTable.Endpoint + '/' + entryToDelete._id)
            .success(function () {
                if ($scope.selectedTableName == "wearTests") {
                    if (entryToDelete.imageSetId) {
                        $http.delete('/tableControlApi/imagesets/' + entryToDelete.imageSetId)
                            .success(function () {
                                $scope.showSuccessMessage("Entry deleted successfully. Refreshing...");
                                $timeout(function () {
                                    $scope.loadTable();
                                }, 2000);
                            });
                    }
                }
                else {
                    $scope.showSuccessMessage("Entry deleted successfully. Refreshing...");
                    $timeout(function () {
                        $scope.loadTable();
                    }, 2000);
                }
            });
    };

    //Edit an entry
    $scope.editEntry = function (entryToEdit) {
        if ($scope.selectedTableName === 'users') {
            $location.path('/dashboard/AdminTools/users/' + entryToEdit._id + '/edit')
        } else {
            $scope.itemInEditMode = entryToEdit;
            $scope.editMode = true;
        }
    };

    //Save changes to the entry
    $scope.saveChanges = function (entryToSave) {
        var id;

        if (!entryToSave._id) {
            entryToSave.createUsername = $scope.user.username;
            entryToSave.createUserId = $scope.user.id;

            $http.post('/tableControlApi' + $scope.selectedTable.Endpoint, entryToSave)
                .success(function (data) {

                    //No longer in edit mode
                    $scope.cancelChanges();

                    $scope.showSuccessMessage("Entry created successfully. Refreshing...");
                    $timeout(function () {
                        $scope.loadTable();
                    }, 2000);
                });
        } else {

            id = entryToSave._id;
            entryToSave.id = id;
            delete entryToSave._id;
            entryToSave.modifiedUsername = $scope.user.username;
            entryToSave.modifiedUserId = $scope.user.id;

            $http.put('/tableControlApi' + $scope.selectedTable.Endpoint + '/' + id, entryToSave)
                .success(function (data) {

                    //No longer in edit mode
                    $scope.cancelChanges();

                    $scope.showSuccessMessage("Entry saved successfully. Refreshing...");
                    $timeout(function () {
                        $scope.loadTable();
                    }, 2000);
                });
        }
    };

    $scope.cancelChanges = function () {
        //Simply switch off the edit mode
        $scope.editMode = false;

        //Reset the data being edited
        $scope.itemInEditMode = {};
    };

    $scope.loadTable = function () {
        //Update the view to indicate that table is being loaded
        $scope.loadingTable = true;

        $http.get('/tableControlApi/' + $scope.selectedTableName)
            .success(function (records) {
                $scope.tableRecords = records.data;

                //Check if we have the user information
                var breakLoop = false;
                while(!breakLoop) {
                    if ($scope.user !== null) {
                        breakLoop = true;
                    }
                }

                //Loading complete
                $scope.loadingTable = false;

                $scope.hideTable = false;

            });
    };

    $scope.currentlyActiveTable = function (isThisTableActive) {
        return $scope.selectedTableName === isThisTableActive;
    };

    $scope.sortEntries = function(fieldName) {
        if(fieldName === $scope.sortColumnsBy)
        {
            $scope.sortColumnsOrder = ($scope.sortColumnsOrder==='asc')?'desc':'asc';
        }
        else
        {
            $scope.sortColumnsOrder = 'asc';
            $scope.sortColumnsBy = fieldName;
        }
    };

    //Change mode
    $scope.displayImageSet = function (imagesetId) {
        $scope.displayEntryId = imagesetId;
        $scope.imageSetDisplayMode = "single";
    };

    $scope.loadImageSets = function () {
        $http.get('/tableControlApi/ImageSets')
            .success(function (record) {
                $scope.existingImageSets = record.data;
            });
    };

    //Back To All Imageset
    $scope.backToImageSet = function () {
        $scope.imageSetDisplayMode = "list";
    };

    //Returns total users of a particular user type
    $scope.getTotalUsers = function (utype) {
        var count = 0;

        //If currently active table is not 'Users', don't bother
        if ($scope.currentlyActiveTable('users')) {
            for (var i = $scope.tableRecords.length - 1; i >= 0; i--) {
                if ($scope.tableRecords[i].utype === utype) {
                    ++count;
                }
            }
        }

        return count;
    };

    $scope.prepareDataForExport = function (filterElement) {
        var columnHeaders = ['First Name', 'Last Name', 'User Name', 'Gender', 'Address 1', 'Address 2', 'City', 'State', 'Postal Code', 'Country', 'Email', 'Mobile Number', 'Shoe Size', 'Shirt Size', 'Jacket Size', 'Glove Size', 'Inseam Length', 'Waist Measurement', 'Brand Association'],
            columnKeys = ['fname', 'lname', 'username', 'gender', 'address1', 'address2', 'city', 'state', 'zipCode', 'country', 'email', 'mobilePhone', 'shoeSize', 'shirtSize', 'jacketSize', 'gloveSize', 'inseamLength', 'waistMeasurement', 'brandAssociation'],
            testers = [],
            address,
            csvString,
            searchFilter;

        $scope.readyToExport = false;

        searchFilter = document.getElementById(filterElement).value;

        //Filter out testers
        for (var i = 0; i < $scope.tableRecords.length; i++) {
            if ($scope.tableRecords[i].utype === 'Tester') {
                if ($scope.tableRecords[i].address && $scope.tableRecords[i].address.length > 0) {
                    if ($scope.tableRecords[i].address[0].type === 'ship') {
                        address = $scope.tableRecords[i].address[0];
                    } else if ($scope.tableRecords[i].address[1].type === 'ship') {
                        address = $scope.tableRecords[i].address[1];
                    }
                }
                testers.push(angular.extend(JSON.parse(JSON.stringify($scope.tableRecords[i])), address));
            }
        }

        csvString = downloadAsCSV(columnHeaders, columnKeys, testers, searchFilter);

        $scope.exportLink = csvString;

        $scope.readyToExport = true;
    }

    $scope.increaseRecordDisplayCount = function () {
        if ($scope.recordDisplayLimit > $scope.tableRecords.length) {
            return;
        } else {
            $scope.recordDisplayLimit += 10;
        }
    };

    $scope.closeRulesManageModal = function () {
        $scope.showRuleManageModal = false;
    };
 
    $scope.manageRules = function () {
        $scope.loadingTable = true;
 
        $scope.noRuleImageSetIdFound = false;
 
        //Get the ImageSetID containing all rules
        $http.get('/rule/imagesetId')
            .success(function (response) {
                if (!response.id) {
                    $scope.loadingTable = false;
 
                    //No ImageSet ID found
                    $scope.noRuleImageSetIdFound = true;
 
                    $timeout(function () {
                        $scope.noRuleImageSetIdFound = false;
                    }, 4000);
 
                    return;
                }
 
                //Get the ImageSet Details
                $http.get('/query/imagesets?query={"_id":"' + response.id + '"}')
                    .success(function (imagesetRecord) {
                        $scope.loadingTable = false;
 
                        $scope.ruleImageSet = imagesetRecord[0];
 
                        $scope.showRuleManageModal = true;
                    });
            });
    };
 
    $scope.customFilter = function (document) {
        var relevantTableAttrs = {
                answers: ['freeFormText'],
                users: ['fname', 'lname', 'username', 'email', 'brandAssociation', 'tags'],
                wearTests: ['brand', 'description', 'name'],
                surveys: ['name', 'description'],
                imagesets: ['name', 'description'],
                blogContents: ['title'],
                messages: ['title', 'body'],
                surveys_submitted: ['surveyName']
            },
            words = $scope.searchFilter.input.toLowerCase().split(' '),
            attrs = relevantTableAttrs[$scope.selectedTableName],
            value;

        if ($scope.searchFilter.input.length === 0 || !attrs) {
            //Possible when the search is empty
            return true;
        }

        for (var i = 0; i < words.length; i++) {
            for (var j = 0; j < attrs.length; j++) {
                if (attrs[j] === 'brandAssociation' || attrs[j] === 'tags') {
                	  value = document[attrs[j]].toString();
                } else {
                    value = document[attrs[j]];
                }

                if (value) {
                    value = value.toLowerCase();

                    if (value.indexOf(words[i]) !== -1) {
                        return true;
                    }
                }
            }
        }

        return false;
    };

    //Keep an eye over the user Image Set details (specific for rules upload only)
    $scope.$watch('ruleImageSet.dirty', function () {
        if (angular.isUndefined($scope.ruleImageSet)) {
            return;
        } else if ($scope.ruleImageSet.dirty === true) {
            $scope.ruleImageSet.dirty = false;
 
            //Update the Image Set
            var _imageset = {};
            angular.copy($scope.ruleImageSet, _imageset);
 
            _imageset.id = _imageset._id;
            delete _imageset._id;
 
            $http.put('/tableControlApi/imagesets/' + _imageset.id, _imageset)
                .success(function (result) {
                    //Update the Image Set
                    $scope.ruleImageSet = result.data;
                });
        }
    });
 
    //Get information on the logged in user
    loginState.getLoginState(function (data) {
        $scope.user = data.userInfo;
    });

    //Every time the selected table changes, we need to fetch the information
    //from the API - that is we need to fetch the data for that table
    $scope.$watch('selectedTable', function () {

        //Check that we have a table to query
        if ($scope.selectedTable === null || $scope.selectedTable === "" || !$scope.selectedTable) {
            return;
        }

        $scope.loadTable();
    });

    if (!documentId) {
        if (tableName) {
            fetchTableAttributes();
        }
    } else {
        $scope.editMode = true;
    }
}]);
