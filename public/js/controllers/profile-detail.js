/***************************************************************
    This contains the controller for to diplay the Bio / Profile
    of any user
***************************************************************/

registrationApp.controller('ProfileCtrl', ['$scope', '$http', '$filter', 'loginState', 'profileDetailCompletion', function ($scope, $http, $filter, loginState, profileDetailCompletion) {
    'use strict';

    //Set when the profile is being loaded into buffer
    $scope.loadingProfileDetails = true;

    //Controls the directive to be loaded based on the profile detail to edit
    //Initially, nothing to edit
    $scope.detailToEdit = "";

    //Options for the behaviour of the modal allowing the user to edit his profile
    $scope.editModalOptions = {
        backdropFade: true,
        dialogFade: true,
        dialogClass: 'customModal modal'
    };

    //Contains the questions that were asked during registration for the
    //current user
    $scope.questions = [];

    //The detail being edited - this contains the question for that detail
    $scope.editDetail = {};

    //Contains the attributes of a user
    var attributes = ["dateOfBirth", "fname", "lname", "email", "mobilePhone", "gender", "favoriteQuote", "height", "weight", "shoeSize", "runningShoeSize", "shoeWidthStr", "gloveSize", "armPreference", "legPreference", "sleeveLength", "inseamLength", "waistMeasurement", "neckMeasurement", "chestMeasurement", "bicepMeasurement", "thighMeasurement", "winter", "summer", "profession", "favoriteMemory", "recieveNotifType", "city", "state", "zipCode", "country", "address", "shirtSize", "jacketSize", "shoulderMeasurement", "underBustMeasurement", "seatMeasurement"];

    //Filters out the questions of type "Section" from others since the model
    //is not correct
    $scope.addQuestions = function (questionsList) {
        for (var i = 0; i < questionsList.length; i++) {
            if (questionsList[i].type === "Section") {
                continue;
            } else {
                $scope.questions.push(questionsList[i]);
            }
        }
    };

    //Get the user details
    loginState.getLoginState(function (data) {
        //Store the user information
        $scope.user = data.userInfo;

        if ($scope.user.gender) {
            var capitalized = $scope.user.gender.charAt(0).toUpperCase() + $scope.user.gender.substring(1);
            $scope.gender = capitalized;
        }

        //Once we have the user details, fetch the question types for this user
        //at the time of registration
        $http.get('/profile/questions')
            .success(function (data) {
                if (data.length === 0) {
                    //No survey data returned
                    console.log("Error while fetching the survey. User type may not be valid");
                    $scope.errorMessage = "Error while fetching the survey. Read the console logs";
                    $scope.showError = true;
                } else {
                    $scope.addQuestions(data.questions);
                }

                //We are done loading
                $scope.loadingProfileDetails = false;
            })
            .error(function (err) {
                console.log("Error while fetching the survey.");
                console.log(err);
                $scope.errorMessage = "Error while fetching the survey. Read the console logs";
                $scope.showError = true;

                $scope.loadingProfileDetails = false;
            });
    });

    //Load the question corresponding the detail to edit
    $scope.edit = function (detail) {
        $scope.editDetail = {};

        if (detail !== '') {

            //Populate the question of that detail type for editing
            for (var i = 0; i < $scope.questions.length; i++) {
                //Check if the question id matches the detail provided
                if ($scope.questions[i].id === detail) {
                    //Load the question for this directive
                    $scope.editDetail = $scope.questions[i];

                    //No need to look any further
                    break;
                }
            }
        }
    };

    //Cancels the editing process
    $scope.cancelEdit = function() {
        //Call edit() with empty detail item
        $scope.edit('');
    };

    $scope.update = function () {

        //Certain attributes need special handling
        if ($scope.editDetail.id === "dateOfBirth") {
            //Date of birth needs to be converted to ISO format
            $scope.editDetail.answer.value = new Date($scope.editDetail.answer.value).toISOString();
        } else if ($scope.editDetail.id === "pants") {
            //In case of pants, both the inseam length and waist size need
            //to be updated
            delete $scope.editDetail.answer.value;

            $scope.user.inseamLength = $scope.editDetail.answer.inseamLength;
            $scope.user.waistMeasurement = $scope.editDetail.answer.waistMeasurement;
        } else if ($scope.editDetail.id === "personal") {
            //In case of personal info, we have the first name, the last name
            //and the email ID
            delete $scope.editDetail.answer.value;

            $scope.user.fname = $scope.editDetail.answer.fname;
            $scope.user.lname = $scope.editDetail.answer.lname;
            $scope.user.email = $scope.editDetail.answer.email;
        } else if ($scope.editDetail.id === "address") {
            //In case of address, we have the street, city, zip code, state
            //and country
            delete $scope.editDetail.answer.value;

            var mailAddress = {
                    type: "mail"
                };
            $scope.editDetail.answer.values = [];
            mailAddress.address1 = $scope.editDetail.answer.mail.address1;
            mailAddress.address2 = $scope.editDetail.answer.mail.address2;
            mailAddress.city = $scope.editDetail.answer.mail.city;
            mailAddress.zipCode = $scope.editDetail.answer.mail.zipCode;
            mailAddress.state = $scope.editDetail.answer.mail.state;
            mailAddress.country = $scope.editDetail.answer.mail.country;
            $scope.editDetail.answer.values.push(mailAddress);

            //Shipping Address
            var shipAddress = {
                type: "ship"
            };
            shipAddress.address1 = $scope.editDetail.answer.ship.address1;
            shipAddress.address2 = $scope.editDetail.answer.ship.address2;
            shipAddress.city = $scope.editDetail.answer.ship.city;
            shipAddress.zipCode = $scope.editDetail.answer.ship.zipCode;
            shipAddress.state = $scope.editDetail.answer.ship.state;
            shipAddress.country = $scope.editDetail.answer.ship.country;
            $scope.editDetail.answer.values.push(shipAddress);
        } else if ($scope.editDetail.id === "gender") {
            if ($scope.editDetail.answer.value) {
                    var capitalized = $scope.editDetail.answer.value.charAt(0).toUpperCase() + $scope.editDetail.answer.value.substring(1);
                    $scope.gender = capitalized;
              }
        }

        //Retrieve the user attribute that needs to be updated and
        //update it in the user profile
        if (!angular.isUndefined($scope.editDetail.answer.values)) {
            $scope.user[$scope.editDetail.id] = $scope.editDetail.answer.values;
        } else if (!angular.isUndefined($scope.editDetail.answer.value)) {
            $scope.user[$scope.editDetail.id] = $scope.editDetail.answer.value;
        }

        //PUT (update) data to API
        $http.put('/api/updateUser', $scope.user)
            .success(function(data) {
                //On success, notify the parent to update its record of the user info
                if (!angular.isUndefined($scope.updateInfo)) {
                    $scope.updateInfo();
                }
            })
            .error(function(err) {
                console.log(err);
                $scope.errorMessage = "An error occurred";
                $scope.showError = true;
            });

        //Close the edit modal
        $scope.cancelEdit();
    };

    //Convert the provided height in inches to height in feet and inches
    $scope.getFormattedHeight = function (heightInInches) {
        //Contains the formatted height
        var height = "";

        //Get the feet
        height = Math.floor(parseInt(heightInInches, 10) / 12).toString();
        height = height + "' ";

        //Get the inches
        height = height + (parseInt(heightInInches, 10) % 12).toString();
        height = height + '"';

        return height;
    };

    //Keep an eye on the profile detail being edited
    $scope.$watch('editDetail', function () {

        //Check for incorrect values
        if (angular.isUndefined($scope.editDetail) || $scope.editDetail === null || angular.isUndefined($scope.editDetail.id)) {
            //Remove any profile details being edited
            $scope.detailToEdit = '';
            return;
        }

        //Prepare the answer stored in the user profile details
        $scope.editDetail.answer = {};

        //Populate the values for the answer
        if ($scope.editDetail.id !== "winter" && $scope.editDetail.id !== "summer" && $scope.editDetail.id !== "recieveNotifType") {
            $scope.editDetail.answer.value = $scope.user[$scope.editDetail.id];
        } else {
            //Answer for questions of these types are in the multiple
            $scope.editDetail.answer.values = $scope.user[$scope.editDetail.id];

            if (angular.isUndefined($scope.editDetail.answer.values)) {
                $scope.editDetail.answer.values = [];
            }
        }

        //For certain fields, special handling is needed
        if ($scope.editDetail.id === "dateOfBirth") {
            //Date of birth is stored in the ISO format
            //Convert to regular format
            $scope.editDetail.answer.value = $filter('date')($scope.editDetail.answer.value, 'MM/dd/yyyy');
        } else if ($scope.editDetail.id === "pants") {
            //Pants work with inseam value and waist size value
            delete $scope.editDetail.answer.value;

            $scope.editDetail.answer.inseamLength = $scope.user.inseamLength;
            $scope.editDetail.answer.waistMeasurement = $scope.user.waistMeasurement;
        } else if ($scope.editDetail.id === "personal") {
            //Personal info contains the first name, last name and email
            delete $scope.editDetail.answer.value;

            $scope.editDetail.answer.fname = $scope.user.fname;
            $scope.editDetail.answer.lname = $scope.user.lname;
            $scope.editDetail.answer.email = $scope.user.email;
        } else if ($scope.editDetail.id === "address") {
            //Address contains the street, city, zipcode, state and country
            delete $scope.editDetail.answer.value;
            $scope.editDetail.answer = {
                mail: {},
                ship: {}
            };

            for (var i = 0; i < $scope.user.address.length; i++) {
                $scope.editDetail.answer[$scope.user.address[i].type]["address1"] = $scope.user.address[i].address1;
                $scope.editDetail.answer[$scope.user.address[i].type]["address2"] = $scope.user.address[i].address2;
                $scope.editDetail.answer[$scope.user.address[i].type]["city"] = $scope.user.address[i].city;
                $scope.editDetail.answer[$scope.user.address[i].type]["zipCode"] = $scope.user.address[i].zipCode;
                $scope.editDetail.answer[$scope.user.address[i].type]["state"] = $scope.user.address[i].state;
                $scope.editDetail.answer[$scope.user.address[i].type]["country"] = $scope.user.address[i].country;
            }
        }

        //Set the directive switching model
        $scope.detailToEdit = $scope.editDetail.id;
    });

    //Keep an eye over the height feet and inch values - whenever it changes,
    //change the value of the answer - remember that the height is always
    //stored in inches
    $scope.$watch('editDetail.answer.heightValue + editDetail.answer.heightInchValue', function () {

        if (angular.isUndefined($scope.editDetail) || angular.isUndefined($scope.editDetail.answer) || angular.isUndefined($scope.editDetail.answer.heightValue) || angular.isUndefined($scope.editDetail.answer.heightInchValue)) {
            return;
        }

        $scope.editDetail.answer.value = ($scope.editDetail.answer.heightValue * 12) + $scope.editDetail.answer.heightInchValue;
    });

    //Each time the user information gets updated, update the % of completion
    $scope.$watch('user', function () {
        var total = 0;
        if ($scope.user === undefined || $scope.user === null) {
            return;
        }

        $scope.completed = profileDetailCompletion.getPercentageOfCompletion($scope.user);
    }, true);

    //Convert an array to a string
    $scope.getStringFormatForArray = function (arrayToConvert) {
        if (angular.isArray(arrayToConvert)) {
            return arrayToConvert.join(", ");
        } else {
            return arrayToConvert;
        }
    };

    //Returns the address of that particular type
    $scope.getAddress = function (addressType) {
        var address = {};

        if (angular.isUndefined($scope.user) || angular.isUndefined($scope.user.address)) {
            return;
        }

        for (var i = 0; i < $scope.user.address.length; i++) {
            if (addressType === $scope.user.address[i].type) {
                address = $scope.user.address[i];
            }
        }

        if (angular.isUndefined(address.type)) {
            return "";
        } else {
            return address;
        }
    };

}]);

registrationApp.controller('ChangePasswordCtrl', ['$scope', '$http', 'loginState', '$q',
    function ($scope, $http, loginState, $q) {
        'use strict';

        //Controls the directive to be loaded based on the profile detail to edit
        //Initially, nothing to edit
        $scope.detailToEdit = false;

        //Options for the behaviour of the modal allowing the user to edit his profile
        $scope.editModalOptions = {
            backdropFade: true,
            dialogFade: true,
            dialogClass: 'customModal modal'
        };

        //The detail being edited - this contains the question for that detail
        $scope.editDetail = {};

        //Get the user details
        loginState.getLoginState(function (data) {
            //Store the user information
            $scope.user = data.userInfo;
            // Get The Change Password Question
            $scope.getChangePasswordQuestion();

        });

        //getChangePasswordQuestion
        $scope.getChangePasswordQuestion = function () {
            //Once we have the user details, fetch the question types for this user
            //at the time of registration
            $http.get('/profile/questions')
                .success(function (data) {
                    if (data.questions.length === 0) {
                        //No survey data returned
                        $scope.errorMessage = "Error while fetching the survey. Read the console logs";
                        $scope.showError = true;
                    } else {
                        for (var i = 0; i < data.questions.length; i++) {
                            if (data.questions[i].type !== "Section" && data.questions[i].id === "changePassword") {
                                //Load the question for this directive
                                $scope.editDetail = data.questions[i];
                                //No need to look any further
                                break;
                            }
                        }
                    }

                    //We are done loading
                    $scope.loadingProfileDetails = false;
                })
                .error(function (err) {
                    console.log("Error while fetching the survey.");
                    console.log(err);
                    $scope.errorMessage = "Error while fetching the survey. Read the console logs";
                    $scope.showError = true;
                });
        };

        //Validates the answers to the questions
        $scope.validatePassword = function (callback) {
            var defer = $q.defer(),
                body,
                lowercaseRegExp = /[a-z]+/,
                numberRegExp = /[0-9]+/;

            //Call the passed callback on resolve
            defer.promise.then(callback);

            //Optimism - no errors initially.
            $scope.validationError = false;

            if (isInputInvalid($scope.editDetail.answer.oldPassword)) {

                $scope.validationError = true;
                $scope.validationErrorMessage = "Current password is required";
                defer.resolve(false);
            } else if (isInputInvalid($scope.editDetail.answer.password)) {
                //Password is required
                $scope.validationError = true;
                $scope.validationErrorMessage = "New Password is required";
                defer.resolve(false);
                return;
            } else if (isInputInvalid($scope.editDetail.answer.confirmPassword)) {
                //Confirm Password missing
                $scope.validationError = true;
                $scope.validationErrorMessage = "Confirm the new password";
                defer.resolve(false);
                return;
            } else if ($scope.editDetail.answer.password.length < 8) {
                //Password too small
                $scope.validationError = true;
                $scope.validationErrorMessage = "New password must be at least 8 characters";
                defer.resolve(false);
                return;
            } else if (!(lowercaseRegExp.test($scope.editDetail.answer.password) && numberRegExp.test($scope.editDetail.answer.password))) {
                   //Password is not strong enough
                  $scope.validationError = true;
                  $scope.validationErrorMessage = "New password must contain at least one lowercase letter and at least one number.";
                   defer.resolve(false);
            } else if ($scope.editDetail.answer.password !== $scope.editDetail.answer.confirmPassword) {
                //Password do not match
                $scope.validationError = true;
                $scope.validationErrorMessage = "New Passwords do not match";
                defer.resolve(false);
                return;
            } else {
                body = {
                    currentPassword: $scope.editDetail.answer.oldPassword,
                    newPassword: $scope.editDetail.answer.password
                };

                //Check if the user has provided correct old password
                $http.put('/api/updatePassword', body)
                    .success(function (result) {
                        if (result._id === $scope.user._id) {
                            //All validations passed
                            defer.resolve(true);
                        } else {
                            $scope.validationError = true;
                            $scope.validationErrorMessage = "Current password should be correct";
                            defer.resolve(false);
                        }
                    })
                    .error(function (err) {
                        console.log(err);

                        $scope.validationError = true;
                        $scope.validationErrorMessage = "An error occurred while updating password. Try again.";
                        defer.resolve(false);
                    });
            }
        };

        //Checks for invalid input
        var isInputInvalid = function (inputValue) {
            //This will check if the input is undefined or is empty
            if (inputValue === "") {
                return true;
            } else if (angular.isUndefined(inputValue)) {
                return true;
            } else {
                return false;
            }
        };

        //Show the editing process
        $scope.showdetailToEdit = function () {
            $scope.editDetail.answer={};
            $scope.editDetail.answer.oldPassword = '';
            $scope.editDetail.answer.password = '';
            $scope.editDetail.answer.confirmPassword='';
            $scope.validationError=false;
            $scope.detailToEdit = true;
        };

        //Cancels the editing process
        $scope.cancelEdit = function () {
            //Call edit() with empty detail item
            $scope.detailToEdit = false;
        };

        $scope.update = function () {

            //Check the answers
            $scope.validatePassword(function (status) {
                if (!status) {
                    return;
                }

                //PUT (update) data to API
                $http.put('/api/updateUser', $scope.user)
                    .success(function (data) {
                        //On success, notify the parent to update its record of the user info
                        if (!angular.isUndefined($scope.updateInfo)) {
                            $scope.updateInfo();
                        }
                    })
                    .error(function (err) {
                        console.log(err);
                        $scope.errorMessage = "An error occurred";
                        $scope.showError = true;
                    });

                //Close the edit modal
                $scope.cancelEdit();
            });
        };
    }
]);
