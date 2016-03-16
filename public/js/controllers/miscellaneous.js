'use strict';

/*Controller for views/index.html*/
app.controller('IndexCtrl', ['$scope', '$http', '$location', 'loginState', '$route', 'notificationWindow', 'imageHandler', '$localstorage',
    function ($scope, $http, $location, loginState, $route, notificationWindow, imageHandler, $localstorage) {

        //Hide the status message window
        $scope.hideWindow = function () {
            notificationWindow.hide();
        };

    $scope.strictModalOptions = {
        backdropFade: true,
        dialogFade: true,
        keyboard: false,
        backdropClick: false
    };

    $scope.openBrowserSupportModal = function () {
        $scope.showBrowserSupportModal = true;
    };

    $scope.closeBrowserSupportModal = function () {
        $scope.showBrowserSupportModal = false;
    };
    
    $scope.browserSupported = true;

    // Check that the user's browser is supported by the application (Chrome, IE 9+, Firefox and Safari)
    // userAgent for IE will return Mozilla for version 11+ and return MSIE for version 10 and below.
    var checkBrowser = function() {
    	  var uAgnt = navigator.userAgent,
    	  version = '';

    	  if ((uAgnt.indexOf("OPR/"))!=-1 || (uAgnt.indexOf("Opera"))!=-1) {
            $scope.browserSupported = false;
            $scope.openBrowserSupportModal();
        }
        else if ((uAgnt.indexOf("MSIE"))!=-1 || (uAgnt.indexOf("Mozilla"))!=-1 || (uAgnt.indexOf("Chrome"))!=-1 || (uAgnt.indexOf("Safari"))!=-1 || (uAgnt.indexOf("Firefox"))!=-1) {
        	  if ((uAgnt.indexOf("MSIE"))!=-1) {
        	  	  version = uAgnt.substring(uAgnt.indexOf("MSIE")+5, uAgnt.indexOf("MSIE")+7);
        	  	  if (parseInt(version) < 9) {
                    $scope.browserSupported = false;
                    $scope.openBrowserSupportModal();
                }
        	  }
            null;
        }
        else {
            $scope.browserSupported = false;
            $scope.openBrowserSupportModal();
        }
    };
    
    //Get the login state of the user
    $scope.getLoginState = function () {
        loginState.getLoginState(function (data) {

                if (data.status === "active") {

                    //Server returned the login state as active - user is
                    //logged in
                    $scope.userIsLoggedIn = true;

                    //Store the logged in user's information
                    $scope.loggedInUserInfo = data.userInfo;
                    //set the report styling
                    $scope.reportStyle = "/css/report"+$scope.loggedInUserInfo.company+".css";
                } else {

                    //Any other status - user is not logged in
                    $scope.userIsLoggedIn = false;
                    $scope.loggedInUserInfo = {};
                }
            });
        };


        $scope.getLoginState();

    checkBrowser();

        //Each time the path changes, get the login state of the user
        $scope.$on('$routeChangeStart', function () {
            var path;

            $scope.getLoginState();

            //Also, get the current path - the home page has a different styling
            path = $location.path();

            if (path === '/' || path === '/register' || path === '/register/Tester' || path === '/info/Design' || path === '/info/Tester' || path === '/info/Brand' || path === '/answerSurvey') {
                $scope.currentStyle = "/css/mainLanding.css";
                $scope.registrationStyle = "/css/profile-detail.css";
            } else {
                $scope.currentStyle = "/css/restricted.css";
                if (path === '/dashboard/Profile') {
                    $scope.registrationStyle = "/css/profile-detail.css";
                } else {
                    $scope.registrationStyle = "/css/dummy.css";
                }
            }
        });

        $scope.opts = {
            backdropFade: true,
            dialogFade: true
        };

        //Log out the user
        $scope.logout = function () {
            $http.post('/logout')
                .success(function (data) {
                    //Clear the token from local storage
                     $localstorage.remove('token');
                     
                    //Cleanup
                    imageHandler.reset();
                    //Since we are already in the path '/', setting the path to '/'' will have
                    //no effect on the page. Thus, we need to refresh
                    $route.reload();
                });
        };

        //sorts the images so that the cover photo is first
        $scope.adjustLandingCarouselImages = function (imageSet) {
            var tempImage,
                i;

            if (imageSet.coverPhoto.length > 0) {
                if (imageSet.images.length > 0) {
                    for (i = 0; i < imageSet.images.length; i++) {
                        if (imageSet.images[i].url === imageSet.coverPhoto) {
                            tempImage = imageSet.images[i];

                            imageSet.images.splice(i, 1);
                            imageSet.images.unshift(tempImage)

                            break;
                        }
                    }
                } else {
                    imageSet.images = [];

                    tempImage = {};
                    tempImage.url = imageSet.coverPhoto;
                    tempImage.description = imageSet.description;
                    tempImage.name = imageSet.name;

                    imageSet.images.push(tempImage);
                }
            }

            return imageSet;
        };
    }
]);

/*Controller for views/partials/home-page.html*/
app.controller('HomePageCtrl', ['$scope', function ($scope) {
    //Nothing as of now
}]);

/*Controller for views/partials/login-page.html*/
app.controller('LoginPageCtrl', ['$scope', '$http', '$location', '$window', 'loginState', '$localstorage', function ($scope, $http, $location, $window, loginState, $localstorage) {

    //Check if the user is already logged in
    loginState.getLoginState(function (data) {
       if (data.status === "active") {

           //User is already logged in - return the user to the dashboard
           $location.path('/dashboard');
       }
    });

    //Contains the user login information for users of type brand and tester
    $scope.localUserInfo = {
        username: "",
        password: ""
    };

    //Contains the user login information for users of type designer
    $scope.externalUserInfo = {
        "UserName": "",
        "Password": ""
    };

    //Hide the failed authentication error messages placeholder
    $scope.showErrorMessageForLocal = false;
    $scope.showErrorMessageForExternal = false;

    //The error message itself
    $scope.localErrorMessage = "";
    $scope.externalErrorMessage = "";

    //Identifies if the user is being authenticated
    $scope.authenticatingLocally = false;
    $scope.authenticatingExternally = false;

    $scope.loginRequired = $location.search()['loginRequired'];

    //User log in for users of type brand and tester
    $scope.localLogin = function () {

        //Hide any error message
        $scope.showErrorMessageForLocal = false;

        //Yes, we are in the process of authenticating the user
        $scope.authenticatingLocally = true;
            
           

        //Pass the user information to the server and verify if it is authentic
        $http.post('/login/local', $scope.localUserInfo)
            .success(function (data) {
               
                //Check if the authentication was a success or a failure
                //Successful POST here does not indicate success of authentication
                if (data.status === "authentication success") {
                    
                    //If the user was redirected here, redirect to the page he/she was trying to access
                    if (docCookies.hasItem('redirectTo')) {
                        var redirectTo = docCookies.getItem('redirectTo');
                        docCookies.removeItem('redirectTo');

                        $location.search('loginRequired', null);
                        //$location.search('access_token', data.token);
                        $location.path(redirectTo);

                    } else {
                        //Proceed to load the dashboard for the use
                        
                        $location.search('loginRequired', null);
                        //$location.search('access_token', data.token);
                        $location.path('/dashboard');

                    }

                } else if (data.status === "authentication error") {
                    //Inform user of the error
                    $scope.localErrorMessage = data.error;
                    $scope.showErrorMessageForLocal = true;
                }

                $scope.authenticatingLocally = false;
            })
            .error(function (error) {
                $scope.localErrorMessage = "Error while attempting to authenticate. Please try again.";
                $scope.showErrorMessageForLocal = true;
                console.dir(error);

                $scope.authenticatingLocally = false;
            });
    };

    //User log in for user of type designer
    $scope.externalLogin = function () {

        //Hide any error message
        $scope.showErrorMessageForExternal = false;

        //Yes, we are in the process of authenticating the user
        $scope.authenticatingExternally = true;

        //Pass the user information to the server and verify if it is authentic
        $http.post('/login/external', $scope.externalUserInfo)
            .success(function (data) {
                if (data.status === "failed") {
                    //Inform user of the error
                    $scope.externalErrorMessage = data.error;
                    $scope.showErrorMessageForExternal = true;
                    $scope.authenticatingExternally = false;
                } else if (data.status === "authentication success") {
                    //Redirect
                    $window.location = data.redirectUrl;
                }
            })
            .error(function (error, status, headers) {
                $scope.externalErrorMessage = "Error while attempting to authenticate. Please try again";
                $scope.showErrorMessageForExternal = true;
                console.dir(error);

                $scope.authenticatingExternally = false;
            });
    };
}]);

/*Controller for views/partials/registration-page.html*/
app.controller('RegistrationPageCtrl', ['$scope', '$routeParams', '$http', '$q', '$filter', '$location', '$window', 'registerUserType', function ($scope, $routeParams, $http, $q, $filter, $location, $window, registerUserType) {

    //Will contain the user details
    $scope.user = {};

    //Get the user type of the user attempting to register
    var userType = $routeParams.userType;
    if (!angular.isUndefined(userType)) {
        //If user type is provided, then store that information
        registerUserType.setType(userType);

        //Change the path to regular registration
        $location.path('/register');
    } else {
        //See if the user type has been stored
        userType = registerUserType.getType();

        if (userType !== "") {
            //Store the user type in the scope
            $scope.user.utype = userType;

            //Reset the user type stored
            registerUserType.setType("");
        } else {
            //Default to Product Tester
            $scope.user.utype = "Tester";
        }
    }

    //The question sequence
    $scope.questionSequence = ["utype", "dateOfBirth", "personal", "loginInfo", "brandAssociation", "recieveNotifType", "address", "gender", "height", "weight", "shoeSize", "shirtSize", "jacketSize", "pants", "profession", "summer", "winter"];

    //Show the error message container
    $scope.showError = false;

    //The error message to be displayed
    $scope.errorMessage = "";

    //Will contain the survey
    $scope.survey = [];

    //Identifies the loading state of the survey
    $scope.loadingSurvey = true;

    //The current question loaded
    $scope.currentQuestion = {};

    //Show the final screen - the screen to be shown after the user has registered
    $scope.showFinalScreen = false;

    //Options for the validation error modal
    $scope.validationErrorOptions = {
        backdropFade: true,
        dialogFade: true
    };

    //Keeps track of the validation errors and message
    $scope.validationError = false;
    $scope.validationErrorMessage = "";

    //Is a registration in progress?
    $scope.registrationInProgress = false;

    var nextStepInProgress = false;

    var originalBrandExclusivityIndex = $scope.questionSequence.indexOf('brandAssociation');

    var handleTesterExclusivity = function () {
        var brandExclusivityModalIndex = $scope.questionSequence.indexOf('brandAssociation');

        if ($scope.user.utype !== 'Tester') {
            if (brandExclusivityModalIndex !== -1) {
                $scope.questionSequence.splice(brandExclusivityModalIndex, 1);
            }
        } else {
            if (brandExclusivityModalIndex === -1) {
                $scope.questionSequence.splice(originalBrandExclusivityIndex, 0, 'brandAssociation');
            }
        }
    };

    //Filters out the questions of type "Section" from others since the model 
    //is not correct
    $scope.addQuestions = function (questionsList) {
        for (var i = 0; i < questionsList.length; i++) {
            if (questionsList[i].type === "Section") {
                continue;
            } else {
                $scope.survey.push(questionsList[i]);
            }
        }
    };

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

            $scope.loadingSurvey = false;

            //Load the first question
            $scope.currentQuestionNumber = 0;
        })
        .error(function (err) {
            console.log("Error while fetching the survey.");
            console.log(err);
            $scope.errorMessage = "Error while fetching the survey. Read the console logs";
            $scope.showError = true;

            $scope.loadingSurvey = false;
        });

    //Keep an eye on the current question number and load a new question when it changes
    $scope.$watch('currentQuestionNumber', function () {
        if ($scope.currentQuestionNumber === "") {
            nextStepInProgress = false;

            return;
        } else if (typeof $scope.currentQuestionNumber === typeof 3) {
            //Get the details of that question number
            for (var i = 0; i < $scope.survey.length; i++) {
                //Check if the question id matches the detail provided
                if ($scope.questionSequence[$scope.currentQuestionNumber] === $scope.survey[i].id) {
                    //Load the question for this directive
                    $scope.currentQuestion = $scope.survey[i];

                    if (!angular.isUndefined($scope.user[$scope.currentQuestion.id])) {

                        switch ($scope.currentQuestion.id) {
                            case "dateOfBirth":
                                if (!angular.isUndefined($scope.user.dateOfBirth)) {
                                    $scope.currentQuestion.answer.value = $filter('date')($scope.user.dateOfBirth, 'MM/dd/yyyy');
                                }
                                if ($scope.isUnder13()) {
                                    $scope.validateAnswers(function () { });
                                }
                                break;

                            case "recieveNotifType":
                                if (!angular.isUndefined($scope.user.recieveNotifType)) {
                                    $scope.currentQuestion.answer.values = $scope.user.recieveNotifType;
                                }
                                break;

                            case "winter":
                            case "summer":
                                if (!angular.isUndefined($scope.user[$scope.currentQuestion.id])) {
                                    $scope.currentQuestion.answer.values = $scope.user[$scope.currentQuestion.id];
                                }
                                break;

                            case "gender":
                            case "height":
                            case "weight":
                            case "shoeSize":
                            case "shirtSize":
                            case "utype":
                            case "jacketSize":
                                if (!angular.isUndefined($scope.user[$scope.currentQuestion.id])) {
                                    if (angular.isUndefined($scope.currentQuestion.answer)) {
                                        //Possible when the user type is stored
                                        $scope.currentQuestion.answer = {};
                                    }
                                    $scope.currentQuestion.answer.value = $scope.user[$scope.currentQuestion.id];
                                }
                                break;
                            case "brandAssociation":
                                if (angular.isDefined($scope.user.brandAssociation)) {
                                    $scope.currentQuestion.answer.values = $scope.user.brandAssociation;
                                }
                        }
                    } else if ($scope.currentQuestion.id === "personal") {
                        //Personal information is composed of "First Name", "Last Name" and "E-Mail"
                        if (!angular.isUndefined($scope.user.fname)) {
                            $scope.currentQuestion.answer.fname = $scope.user.fname;
                        }

                        if (!angular.isUndefined($scope.user.lname)) {
                            $scope.currentQuestion.answer.lname = $scope.user.lname;
                        }

                        if (!angular.isUndefined($scope.user.email)) {
                            $scope.currentQuestion.answer.email = $scope.user.email;
                        }
                    } else if ($scope.currentQuestion.id === "address") {
                        //Address consists of mailing and shipping address
                        if (!angular.isUndefined($scope.user.address)) {
                            for (var i = 0; i < $scope.user.address.length; i++) {
                                for (var key in $scope.user.address[i]) {
                                    if ($scope.user.address[i].hasPoperty(key)) {
                                        if (key !== "type") {
                                            $scope.currentQuestion.answer[$scope.user.address[i].type][key] = $scope.user.address[i][key];
                                        }
                                    }
                                }
                            }
                        }
                    } else if ($scope.currentQuestion.id === "pants") {
                        //Pants is composed of inseam length and waist
                        //measurement
                        if (!angular.isUndefined($scope.user.inseamLength)) {
                            $scope.currentQuestion.answer.inseamLength = $scope.user.inseamLength;
                        }

                        if (!angular.isUndefined($scope.user.waistMeasurement)) {
                            $scope.currentQuestion.answer.waistMeasurement = $scope.user.waistMeasurement;
                        }
                    } else if ($scope.currentQuestion.id === "loginInfo") {
                        if (!angular.isUndefined($scope.user.username)) {
                            $scope.currentQuestion.answer.username = $scope.user.username;
                        }

                        if (!angular.isUndefined($scope.user.password)) {
                            $scope.currentQuestion.answer.password = $scope.user.password;
                            $scope.currentQuestion.answer.confirmPassword = $scope.user.password;
                        }
                    }

                    //No need to look any further
                    break;
                }
            }
        } else {
            nextStepInProgress = false;
            return;
        }

        nextStepInProgress = false;
    });

    //Close the validation error dialog
    $scope.errorAcknowledged = function () {
        $scope.validationError = false;
    };

    //Returns the age from the date
    var getAge = function (value) {
        if (value === null) return 0;

        var birthDate = new Date(value);
        var today = new Date();

        var age = today.getFullYear() - birthDate.getFullYear();

        var month = today.getMonth() - birthDate.getMonth();

        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age = age - 1;
        }

        return age;
    };

    //Checks if the email address is valid or not
    var validEmailAddress = function (emailId) {
        var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
        return pattern.test(emailId);
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

    //Validates the answers to the questions
    $scope.validateAnswers = function (callback) {
        var age,
            spaceRegExp = /\s/,
            lowercaseRegExp = /[a-z]+/,
            uppercaseRegExp = /[A-Z]+/,
            numberRegExp = /[0-9]+/;

        var defer = $q.defer();

        //Call the passed callback on resolve
        defer.promise.then(callback);

        //Optimism - no errors initially.
        $scope.validationError = false;

        //Common Error mesage - data not filled
        $scope.validationErrorMessage = "No value provided or value provided is invalid. Check the value(s) entered.";

        switch ($scope.currentQuestion.id) {
            case "dateOfBirth":
                if (isInputInvalid($scope.currentQuestion.answer.value) || $scope.currentQuestion.answer.value === null) {
                    //No date of birth provided
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Date of birth is required";
                    defer.resolve(false);
                    return;
                } else if (getAge($scope.currentQuestion.answer.value) < 13 || $scope.isUnder13()) {
                    //Too young to register
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Sorry, we do not allow children under the age of 13 to register";
                    //Set cookie
                    var d = new Date();
                    d.setTime(d.getTime() + 2 * 24 * 60 * 60 * 1000);
                    document.cookie = 'under13=true;path=/;expires=' + d.toGMTString() + ';';

                    defer.resolve(false);
                    return;
                } else {
                    try {
                        $scope.currentQuestion.answer.value = new Date($scope.currentQuestion.answer.value).toISOString();
                        //All validations passed
                        defer.resolve(true);

                    } catch (err) {
                        $scope.validationError = true;
                        $scope.validationErrorMessage = "Date of birth is required in mm/dd/yyyy format";
                        defer.resolve(false);
                    }
                    return;
                }
                break;

            case "personal":
                if (isInputInvalid($scope.currentQuestion.answer.fname)) {
                    //First name not entered
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "First name is required";
                    defer.resolve(false);
                    return;
                } else if (isInputInvalid($scope.currentQuestion.answer.lname)) {
                    //Last name not entered
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Last name is required";
                    defer.resolve(false);
                    return;
                } else if (isInputInvalid($scope.currentQuestion.answer.email)) {
                    //Email address is needed
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Please enter a valid email address";
                    defer.resolve(false);
                    return;
                } else if (isInputInvalid($scope.currentQuestion.answer.confirmEmail)) {
                    //Confirming email id is needed
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Confirm the email ID";
                    defer.resolve(false);
                    return;
                } else if (!validEmailAddress($scope.currentQuestion.answer.email)) {
                    //Not a valid email address
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Email address entered is invalid";
                    defer.resolve(false);
                    return;
                } else if ($scope.currentQuestion.answer.email !== $scope.currentQuestion.answer.confirmEmail) {
                    //Email addresses do not match
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Email addresses do not match";
                    defer.resolve(false);
                    return;
                } else {
                    //Check if the email has been registered before
                    $http.get('/public/checkEmail?email=' + encodeURIComponent($scope.currentQuestion.answer.email))
                        .success(function (data) {
                            //Check if we have a record with the same email
                            if (!angular.isUndefined(data)) {
                                if (data.length > 0) {
                                    //Yes, the email has already been registered
                                    $scope.validationError = true;
                                    $scope.validationErrorMessage = "Email address already exists";
                                    defer.resolve(false);
                                    return;
                                } else {
                                    //All validations passed
                                    defer.resolve(true);
                                    return;
                                }
                            } else {
                                //Could not verify uniqueness of email ID
                                $scope.validationError = true;
                                $scope.validationErrorMessage = "Cannot verify uniqueness of email. Cannot proceed. Try Again";
                                defer.resolve(false);
                                return;
                            }
                        });
                }
                break;

            case "loginInfo":
                if (isInputInvalid($scope.currentQuestion.answer.username)) {
                    //Username is required
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Username is required";
                    defer.resolve(false);
                    return;
                } else if (spaceRegExp.test($scope.currentQuestion.answer.username)) {
                    //Username should be alphanumeric
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Username cannot contain any spaces";
                    defer.resolve(false);
                    return;
                } else if (isInputInvalid($scope.currentQuestion.answer.password)) {
                    //Password is required
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Password is required";
                    defer.resolve(false);
                    return;
                } else if (isInputInvalid($scope.currentQuestion.answer.confirmPassword)) {
                    //Confirm Password missing
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Confirm the password";
                    defer.resolve(false);
                    return;
                } else if ($scope.currentQuestion.answer.password.length < 8) {
                    //Password too small
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Password must be at least 8 characters";
                    defer.resolve(false);
                    return;
                } else if ($scope.currentQuestion.answer.password !== $scope.currentQuestion.answer.confirmPassword) {
                    //Password do not match
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Passwords do not match";
                    defer.resolve(false);
                    return;
                } else if (!(lowercaseRegExp.test($scope.currentQuestion.answer.password) && uppercaseRegExp.test($scope.currentQuestion.answer.password) && numberRegExp.test($scope.currentQuestion.answer.password))) {
                    //Password is not strong enough
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Password must contain at least one uppercase letter, at least one lowercase letter and at least one number";
                    defer.resolve(false);
                } else {
                    //Check if the username has been registered before
                    $http.get('/public/checkUsername?username=' + encodeURIComponent($scope.currentQuestion.answer.username))
                        .success(function (data) {
                            //Check if we have a record with the same username
                            if (!angular.isUndefined(data)) {
                                if (data.length > 0) {
                                    //Yes, the username has already been registered
                                    $scope.validationError = true;
                                    $scope.validationErrorMessage = "Username already exists";
                                    defer.resolve(false);
                                    return;
                                } else {
                                    //All validations passed
                                    defer.resolve(true);
                                    return;
                                }
                            } else {
                                //Could not verify uniqueness of email ID
                                $scope.validationError = true;
                                $scope.validationErrorMessage = "Cannot verify uniqueness of username. Cannot proceed. Try Again";
                                defer.resolve(false);
                                return;
                            }
                        });
                }
                break;

            case "address":
                if (isInputInvalid($scope.currentQuestion.answer.ship.address1) || isInputInvalid($scope.currentQuestion.answer.ship.city) || isInputInvalid($scope.currentQuestion.answer.ship.zipCode) || isInputInvalid($scope.currentQuestion.answer.ship.state) || isInputInvalid($scope.currentQuestion.answer.ship.country)) {
                    //Shipping address is not complete
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Shipping address is required";
                    defer.resolve(false);
                    return;
                } else {
                    //All validations passed
                    defer.resolve(true);
                    return;
                }
                break;

            case "gender":
                if ($scope.currentQuestion.answer.value === "") {
                    //Gender not selected
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Please select a gender";
                    defer.resolve(false);
                    return;
                } else {
                    //All validations passed
                    defer.resolve(true);
                    return;
                }
                break;

            case "utype":
                if ($scope.currentQuestion.answer.value === "") {
                    //User type not selected
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Please select a user type";
                    defer.resolve(false);
                    return;
                } else {
                    //All validations passed
                    defer.resolve(true);
                    return;
                }
                break;

            case "winter":
            case "summer":
                if ($scope.currentQuestion.answer.values.length === 0) {
                    //At least one entry needs to be selected
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Please select at least one sport / activity";
                    defer.resolve(false);
                    return;
                } else if ($scope.currentQuestion.answer.values.length > 3) {
                    //Up to 3 entries allowed
                    $scope.validationError = true;
                    $scope.validationErrorMessage = "Select up to 3 sports / activities";
                    defer.resolve(false);
                    return;
                } else {
                    //All validations passed
                    defer.resolve(true);
                    return;
                }

            default:
                //For screens that do not need any validation
                defer.resolve(true);
                break;
        }
    };

    //Formats the answer based on the question type
    $scope.formatAnswer = function () {
        switch ($scope.currentQuestion.id) {
            case "dateOfBirth":
                $scope.user.dateOfBirth = new Date($scope.currentQuestion.answer.value).toISOString();
                break;

            case "personal":
                $scope.user.fname = $scope.currentQuestion.answer.fname;
                $scope.user.lname = $scope.currentQuestion.answer.lname;
                $scope.user.email = $scope.currentQuestion.answer.email;
                break;

            case "recieveNotifType":
                $scope.user.recieveNotifType = $scope.currentQuestion.answer.values;
                break;

            case "address":
                //Shipping Address
                var shipAddress = {
                    type: "ship"
                };
                $scope.user.address = [];

                shipAddress.address1 = $scope.currentQuestion.answer.ship.address1;
                shipAddress.address2 = $scope.currentQuestion.answer.ship.address2;
                shipAddress.city = $scope.currentQuestion.answer.ship.city;
                shipAddress.zipCode = $scope.currentQuestion.answer.ship.zipCode;
                shipAddress.state = $scope.currentQuestion.answer.ship.state;
                shipAddress.country = $scope.currentQuestion.answer.ship.country;
                $scope.user.address.push(shipAddress);
                break;

            case "height":
                $scope.user.height = ($scope.currentQuestion.answer.heightValue * 12) + $scope.currentQuestion.answer.heightInchValue;
                break;

            case "pants":
                $scope.user.inseamLength = $scope.currentQuestion.answer.inseamLength;
                $scope.user.waistMeasurement = $scope.currentQuestion.answer.waistMeasurement;
                break;

            case "loginInfo":
                $scope.user.username = $scope.currentQuestion.answer.username;
                $scope.user.password = $scope.currentQuestion.answer.password;

            case "profession":
                $scope.user[$scope.currentQuestion.id] = $scope.currentQuestion.answer.value;
                break;

            case "winter":
            case "summer":
            case "brandAssociation":
                $scope.user[$scope.currentQuestion.id] = $scope.currentQuestion.answer.values;
                break;

            case "gender":
            case "weight":
            case "shoeSize":
            case "shirtSize":
            case "jacketSize":
            case "utype":
                $scope.user[$scope.currentQuestion.id] = $scope.currentQuestion.answer.value;
                //Check question type is gender
                if ($scope.currentQuestion.id === "gender") {
                    // capital first letter and remaining same
                    var capitalized = $scope.currentQuestion.answer.value.charAt(0).toUpperCase() + $scope.currentQuestion.answer.value.substring(1);
                    $scope.gender = capitalized;
                }

                break;
        }
    };

    $scope.cssAnimation = { enter: 'animateRight-enter', leave: 'animateRight-leave' };

    //Move to the next question
    $scope.nextQuestion = function () {
        if (nextStepInProgress) {
            //A new step is being loaded. Do not change the step again
            return;
        }

        //A step is being loaded
        nextStepInProgress = true;

        //Check the answers
        $scope.validateAnswers(function (status) {
            if (!status) {
                nextStepInProgress = false;
                return;
            }

            //First, format the answer to the current question
            $scope.formatAnswer();

            //Only users of type Tester can provide the brand code
            handleTesterExclusivity();

            //Check the user type. Redirect in certain cases
            if ($scope.currentQuestion.id === "utype") {
                if ($scope.user.utype === "Designer" || $scope.user.utype === "BrandDesigner") {
                    $window.location = "https://design.mesh01.com/register";
                    return;
                }
            }

            //The current question is the last question
            if ($scope.isLastQuestion() === true) {
                //In such a case, we need to register the user with the server
                $scope.registerUser();
            } else {
                $scope.currentQuestionNumber = $scope.currentQuestionNumber + 1;
                $scope.cssAnimation = { enter: 'animateRight-enter', leave: 'animateRight-leave' };
            }
        });
    };

    //Move the previous question
    $scope.previousQuestion = function () {
        //Check if the current question is the first question
        if ($scope.isFirstQuestion() === true) {
            //Nothing to do
            return;
        } else {
            $scope.currentQuestionNumber = $scope.currentQuestionNumber - 1;
            $scope.cssAnimation = { enter: 'animateRightReverse-enter', leave: 'animateRightReverse-leave' };
        }
    };

    //Is the current question the last question?
    $scope.isLastQuestion = function () {
        //Check the user type - Brand user types have fewer questions
        if (angular.isDefined($scope.user.utype) && $scope.user.utype !== "") {
            if ($scope.user.utype === "Brand") {
                return $scope.currentQuestionNumber >= 5;
            }
        }
        return $scope.currentQuestionNumber >= $scope.questionSequence.length - 1;
    };

    //Returns the total number of questions
    $scope.getQuestionCount = function () {
        //If the user is of type Brand, lesser number of questions
        if (angular.isDefined($scope.user.utype) && $scope.user.utype !== "") {
            if ($scope.user.utype === "Brand") {
                return 6;
            }
        }
        return $scope.questionSequence.length;
    };

    //Is this the first question?
    $scope.isFirstQuestion = function () {
        return $scope.currentQuestionNumber === 0;
    };

    //Register the user with the server
    $scope.registerUser = function () {
        //If a registration is already in progress, turn back
        if ($scope.registrationInProgress) {
            return;
        }

        //Yes, a registration is now in progress
        $scope.registrationInProgress = true;

        //Proceed to pass the data to the server
        $http.post('/api/registerUser', $scope.user)
            .success(function (data) {
                if (!angular.isUndefined(data._id)) {
                    $scope.showFinalScreen = true;
                } else {
                    console.log(data);
                    $scope.errorMessage = "Error occurred while registering. Check the logs";
                    $scope.showError = true;
                }
                //Registration no longer in progress
                $scope.registrationInProgress = false;
            })
            .error(function (err) {
                console.log(err);
                $scope.errorMessage = "Error occurred while registering. Check the logs";
                $scope.showError = true;
                //Registration no longer in progress
                $scope.registrationInProgress = false;
            });
    };

    //Check if user is under 13
    $scope.isUnder13 = function () {
        return document.cookie.indexOf('under13') > -1;
    };

    //To prevent the under age users from registering, verify that the user did not attempt to
    //register earlier
    if ($scope.isUnder13()) {
        $scope.userIsUnderAge = true;
    }
}]);

/*Controller for views/partials/pre-hawk-landing-page.html*/
app.controller('MainLandingCtrl', ['$scope', '$http', '$location', '$route', 'loginState', 'registerUserType', 'imageHandler', '$localstorage',
    function ($scope, $http, $location, $route, loginState, registerUserType, imageHandler, $localstorage) {
        //Get the login state of the user
        $scope.getLoginState = function () {
            loginState.getLoginState(function (data) {
                if (data.status === "active") {

                    //Server returned the login state as active - user is
                    //logged in
                    $scope.userIsLoggedIn = true;

                    //Store the logged in user's information
                    $scope.loggedInUserInfo = data.userInfo;
                } else {

                    //Any other status - user is not logged in
                    $scope.userIsLoggedIn = false;
                    $scope.loggedInUserInfo = {};
                }
            });
        };

        //Log out the user
        $scope.logout = function () {
            $http.post('/logout')
                .success(function (data) {
                    
                    //Clear the token from local storage
                     $localstorage.remove('token');
                     
                    //Cleanup
                    imageHandler.reset();
                    //Since we are already in the path '/', setting the path to '/'' will have
                    //no effect on the page. Thus, we need to refresh
                    $route.reload();
                });
        };

        $scope.getLoginState();

        //gets the images that are used in Carousel in the main-landing.html
        $scope.getLandingCarouselImages = function () {
            $http.get('/public/HomeLandingCarousel')
                .success(function (data) {
                    //save the image set in the scope variable
                    $scope.carouselLandingImages = $scope.adjustLandingCarouselImages(data[0]);
                });
        };

        //gets the images that are used in Carousel in the bottom right corner (Brands We have worked with)
        $scope.getHomePageBrandsImages = function () {
            $http.get('/public/HomePageBrands')
                .success(function (data) {
                    //save the image set in the scope variable
                    $scope.homePageBrandsImages = data[0];
                });
        };

        $scope.getLandingCarouselImages();
        $scope.getHomePageBrandsImages();

        //Returns the image based on the status of the wear test
        $scope.getImageForWearTests = function (wearTestImage, sizeW, sizeH, transformMode) {
            var imageLink = "";
            if (transformMode === undefined) { var transformMode = 'c_scale'; }

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

        //Navigate to the registration page with the user type already selected
        $scope.registerNewUser = function (newUserType) {
            registerUserType.setType(newUserType);

            $location.path('/register');
        };
    }]);

/* Controller for forgot-password page */
app.controller('ForgotPasswordCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.identity = {
        user: ""
    };

    //Set when the password is being reset
    $scope.resetInProgress = false;

    $scope.resetSuccess = false;
    $scope.resetFailed = false;
    $scope.resetError = false;

    $scope.resetPassword = function () {
        if ($scope.identity === "") {
            return;
        }

        $scope.resetInProgress = true;

        $http.post('/resetPassword', $scope.identity)
            .success(function (result) {
                if (angular.isDefined(result.success)) {
                    $scope.resetSuccess = true;
                } else {
                    $scope.resetFailed = true;

                    $timeout(function () {
                        $scope.resetFailed = false;
                    }, 5000);
                }

                $scope.resetInProgress = false;
            })
            .error(function (err) {
                $scope.resetError = true;

                $timeout(function () {
                    $scope.resetError = false;
                }, 5000);

                $scope.resetInProgress = false;
            });
    };
}]);

/*Controller to redirect user to pensole page*/
app.controller('PensoleCtrl', ['$window', '$location', function ($window, $location) {
    var path = $location.path();

    switch (path) {
        case '/pensole':
            //Redirect on load
            $window.location = 'http://community.mesh01.com/pensole/';
            break;

        case '/PENSOLE/FOOTLOCKER':
            //Redirect on load
            $window.location = 'http://community.mesh01.com/pensolefootlocker/';
            break;

        case '/pensole/footlocker':
            //Redirect on load
            $window.location = 'http://community.mesh01.com/pensolefootlocker/';
            break;

        case '/pensole-adidas':
            $window.location = 'http://community.mesh01.com/pensole-adidas/';
            break;
    }
}]);

/*Controller for answering surveys - by unregistered users*/
app.controller('DirectAnswerSurveyCtrl', ['$scope', '$location', '$http', 'notificationWindow', 'Surveys',
    function ($scope, $location, $http, notificationWindow, Surveys) {
        var searchParams = $location.search(),
            weartestId = searchParams.for,
            surveyId = searchParams.which,
            surveySubmitInProgress = false,
            projection,
            query,
            path;

        if (!weartestId || !surveyId) {
            $scope.invalidLink = true;
            return;
        } else {
            $scope.invalidLink = false;
        }

        $scope.logo = false;
        if (!angular.isUndefined(searchParams.logo)) {
            $scope.logo = true;
        }

        $scope.surveyExpired = false;
        $scope.loading = true;
        $scope.alreadySubmitted = false;
        $scope.surveySubmittedSuccessfully = false;
        $scope.showSurvey = false;

        $scope.weartest = {};
        $scope.survey = {};
        $scope.unregUser = {};

        $scope.surveyAnswers = [];

        $scope.userDetails = {};

        $scope.collectUserDetailsModalOption = {
            backdropFade: true,
            dialogFade: true,
            keyboard: false,
            backdropClick: false
        };

        $scope.showCollectUserDetailsModal = true;

        var _prepareSurveyAnswers = function () {
            var questions = $scope.survey.questions,
                answer,
                i;

            $scope.surveyAnswers = [];

            for (i = 0; i < questions.length; i++) {
                answer = {};

                answer.surveyId = $scope.survey._id;

                answer.questionId = questions[i]._id;

                answer.userId = $scope.unregUser._id;

                answer.questionName = questions[i].question;

                answer.comment = '';

                answer.type = questions[i].type;

                if (questions[i].supportingImage) {
                    answer.supportingImage = questions[i].supportingImage;
                }

                switch (answer.type) {
                    case 'Numeric':
                        answer.value = 0;
                        break;

                    case 'Rating':
                        answer.value = questions[i].options.defaultValue;
                        break;

                    case 'Single Selection':
                    case 'Free form text':
                        answer.value = '';
                        break;

                    case 'Multiple Selection':
                        answer.value = [];
                        break;
                }

                answer.options = JSON.parse(JSON.stringify(questions[i].options));

                $scope.surveyAnswers.push(answer);
            }
        };

        var _getSurveyDetails = function () {
            var path = '/api/mesh01/surveys/' + surveyId;

            $http.get(path)
                .success(function (result) {
                    if (result._id !== surveyId) {
                        $scope.loading = false;
                        $scope.invalidLink = true;
                        notificationWindow.show('An error occurred while getting survey details', false);
                    } else {
                        $scope.survey = result;

                        _prepareSurveyAnswers();

                        $scope.loading = false;
                        $scope.showSurvey = true;

                        notificationWindow.show('All details fetched successfully. You can proceed to answer the survey', false);
                    }
                })
                .error(function (err) {
                    console.log(err);
                    $scope.loading = false;
                    notificationWindow.show('An error occurred while getting survey details', false);
                });
        };

        var _getWeartestDetails = function () {
            var projection = {
                '_id': 1,
                wearTestEndDate: 1,
                brandLogoLink: 1
            },
                path = '/api/mesh01/weartest/' + weartestId + '?projection=' + JSON.stringify(projection);

            $http.get(path)
                .success(function (result) {
                    if (result._id !== weartestId) {
                        $scope.loading = false;
                        $scope.invalidLink = true;
                        notificationWindow.show('An error occurred while getting product details', false);
                    } else {
                        $scope.weartest = result;

                        if (new Date(result.wearTestEndDate) < new Date()) {
                            $scope.surveyExpired = true;
                            $scope.loading = false;
                            notificationWindow.show('Link seems to have expired', false);

                            return;
                        }

                        notificationWindow.show('Product details retrieved successfully. Getting survey details...', true);
                        _getSurveyDetails();
                    }
                })
                .error(function (err) {
                    console.log(err);
                    $scope.loading = false;
                    notificationWindow.show('An error occurred while getting product details', false);
                });
        };

        var _getPastUserSubmission = function () {
            //First check if the unregistered user has already submitted earlier or not
            var projection = {
                '_id': 1
            },
                query = {
                    'surveyId': surveyId,
                    'weartestId': weartestId,
                    'unregisteredUserId': $scope.unregUser._id
                },
                path = '/api/mesh01/surveys_submitted?query=' + JSON.stringify(query) + '&projection=' + JSON.stringify(projection);

            $http.get(path)
                .success(function (result) {
                    if (angular.isArray(result)) {
                        if (result.length > 0) {
                            $scope.loading = false;
                            $scope.alreadySubmitted = true;
                        } else {
                            notificationWindow.show('Completed processing. Getting details of product test...', true);
                            _getWeartestDetails();
                        }
                    } else {
                        $scope.loading = false;
                        $scope.invalidLink = true;
                        notificationWindow.show('An error occurred during processing', false);
                    }
                })
                .error(function (err) {
                    console.log(err);
                    $scope.loading = false;
                    notificationWindow.show('An error occurred during processing', false);
                });
        };

        var _registerUser = function () {
            var path = '/api/mesh01/unregisteredUsers';

            $http.post(path, $scope.userDetails)
                .success(function (result) {
                    if (!angular.isObject(result) || result.fname !== $scope.userDetails.fname || result.lname !== $scope.userDetails.lname) {
                        $scope.loading = false;
                        notificationWindow.show('An error occurred during processing', false);
                    } else {
                        $scope.unregUser = result;
                        //We don't check for past submissions here because the user did not submit any surveys earlier
                        notificationWindow.show('Completed processing. Getting details of product test...', true);
                        _getWeartestDetails();
                    }
                })
                .error(function (err) {
                    console.log(err);
                    $scope.loading = false;
                    notificationWindow.show('An error occurred during processing', false);
                });
        };

        var _getUserDetails = function () {
            var path = '/api/mesh01/unregisteredUsers',
                query = {
                    email: $scope.userDetails.email
                };

            path += '?query=' + JSON.stringify(query);

            $http.get(path)
                .success(function (result) {
                    if (!angular.isArray(result)) {
                        $scope.loading = false;
                        return notificationWindow.show('An error occurred while getting details', false);
                    } else {
                        if (result.length > 0) {
                            $scope.unregUser = result[0];

                            _getPastUserSubmission();
                        } else {
                            _registerUser();
                        }
                    }
                })
                .error(function (err) {
                    console.log(err);
                    $scope.loading = false;
                    notificationWindow.show('An error occurred while getting details', false);
                });
        };

        $scope.getQuestionNumber = function (originalIndex) {
            return Surveys.getQuestionNumber(originalIndex + 1, $scope.surveyAnswers);
        };

        //Add multiple values to the answer
        $scope.addMultipleAnswer = function ($event, answer, value) {
            if (!answer.valueArray) {
                answer.valueArray = [];
            }

            var checkbox = $event.target,
                index = answer.valueArray.indexOf(value);

            //Should we add the selection or remove the selection?
            if (checkbox.checked === true) {
                //Add the option, if not already added
                if (index === -1) {
                    answer.valueArray.push(value);
                }
            } else {
                //Remove the value, if exists
                if (index !== -1) {
                    answer.valueArray.splice(index, 1);
                }
            }
        };

        //Submits the answers of the survey
        $scope.submitSurvey = function () {
            if (surveySubmitInProgress) {
                return;
            } else {
                surveySubmitInProgress = true;
            }

            //Reset any error messages
            $scope.questionNumberWithError = -1;

            $scope.errorMessage = '';

            //First - validate the answers provided.
            for (var i = 0; i < $scope.surveyAnswers.length; i++) {
                //Check if answering the question is mandatory
                if ($scope.surveyAnswers[i].options.isRequired === true) {
                    //Yes, it is. Has the user entered it?
                    if ($scope.surveyAnswers[i].type !== 'Multiple Selection' && $scope.surveyAnswers[i].value.length === 0) {
                        //No value provided. Inform the user
                        $scope.errorMessage = "Please answer the above question";
                        $scope.questionNumberWithError = i;
                        surveySubmitInProgress = false;

                        //Don't proceed
                        return;
                    } else if ($scope.surveyAnswers[i].type === 'Multiple Selection' && (!$scope.surveyAnswers[i].valueArray || $scope.surveyAnswers[i].valueArray.length === 0)) {
                        //No value provided. Inform the user
                        $scope.errorMessage = "Please answer the above question";
                        $scope.questionNumberWithError = i;
                        surveySubmitInProgress = false;

                        //Don't proceed
                        return;
                    }
                } else if ($scope.surveyAnswers[i].isNumeric === true || $scope.surveyAnswers[i].type === 'Numeric') {
                    //The answer to the question should be a numeric value - is it?
                    if ($scope.surveyAnswers[i].value.toString().match(/^-?[0-9]+$/) === null) {
                        //No value provided. Inform the user
                        $scope.errorMessage = "Only numeric values are allowed as answers for the above question";
                        $scope.questionNumberWithError = i;
                        surveySubmitInProgress = false;

                        //Don't proceed
                        return;
                    }
                }
            }

            //All validations passed. Submit the answer
            var surveySubmission = {};

            surveySubmission.unregisteredUserId = $scope.unregUser._id;
            surveySubmission.surveyId = $scope.survey._id;
            surveySubmission.answers = [];
            surveySubmission.weartestId = $scope.weartest._id;
            surveySubmission.surveyName = $scope.survey.name;
            surveySubmission.surveyType = $scope.survey.type;

            for (var i = 0; i < $scope.surveyAnswers.length; i++) {
                if ($scope.surveyAnswers[i].type === 'Title / Header') {
                    //Do not record answer for this question type
                    continue;
                }

                surveySubmission.answers.push($scope.surveyAnswers[i]);
            }

            notificationWindow.show('Submitting survey', true);

            $http.post('/api/mesh01/surveys_submitted', surveySubmission)
                .success(function (result) {
                    if (result._id) {
                        $scope.surveySubmittedSuccessfully = true;
                        $scope.showSurvey = false;
                        notificationWindow.show('Survey successfully submitted. Thank you for your participation', false);
                    } else {
                        notificationWindow.show('Error. Could not submit survey at this time', false);
                    }

                    surveySubmitInProgress = false;
                })
                .error(function (err) {
                    console.log(err);
                    surveySubmitInProgress = false;
                    notificationWindow.show('Error. Could not submit survey at this time', false);
                });
        };

        $scope.closeCollectUserDetailsModal = function () {
            $scope.showCollectUserDetailsModal = false;
        };

        $scope.submitUserDetail = function () {
            if (!$scope.userDetails.fname || $scope.userDetails.fname.length === 0) {
                return notificationWindow.show('Enter your first name');
            } else if (!$scope.userDetails.lname || $scope.userDetails.lname.length === 0) {
                return notificationWindow.show('Enter your last name');
            } else if (!$scope.userDetails.email || $scope.userDetails.email.length === 0) {
                return notificationWindow.show('Enter your email address');
            }

            $scope.closeCollectUserDetailsModal();

            notificationWindow.show('Processing...', true);
            //Check if the user has submitted earlier
            _getUserDetails();
        };
    }
]);
