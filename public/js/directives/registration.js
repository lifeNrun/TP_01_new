/*********************************************************************
	This file contains all the directives used during registration.

	Module: registrationApp
**********************************************************************/

'use strict';

registrationApp.directive('profileDisplay', function () {
    return {
        templateUrl: '/partials/registration/profile-display-edit.html',
        restrict: 'E',
        scope: {
            completed: '=',
            updateInfo: '='
        },
        controller: 'ProfileCtrl'
    };
});

registrationApp.directive('genderSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-w1-gender-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('userTypeSelection', function () {
    return {
        templateUrl: '/partials/registration/user-type.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('armPrefSelection', function () {
    return {
        templateUrl: '/partials/registration/arm-preference.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('legPrefSelection', function () {
    return {
        templateUrl: '/partials/registration/leg-preference.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('neckSizeSelection', function () {
    return {
        templateUrl: '/partials/registration/neck-size.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('chestSizeSelection', function () {
    return {
        templateUrl: '/partials/registration/chest-size.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('bicepSizeSelection', function () {
    return {
        templateUrl: '/partials/registration/bicep-size.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('thighSizeSelection', function () {
    return {
        templateUrl: '/partials/registration/thigh-size.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('professionSelection', ['$http', function ($http) {
    return {
        templateUrl: '/partials/registration/profession.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }

            //Provide the possible choices for the professions
            $http.get('/js/static-data.json')
                .success(function (result) {
                    scope.choices = result.professions;
                    //Loading is now complete
                    scope.loadingList = false;
                });
        },
        controller: function ($scope) {
            //Loading the possbile professions
            $scope.loadingList = true;
        }
    };
}]);

registrationApp.directive('favoriteMemorySelection', function () {
    return {
        templateUrl: '/partials/registration/favorite-memory.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='
        },
        link: function (scope, iElement, iAttr) {
            //Initialize the answer to the question
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }
        }
    };
});

registrationApp.directive('heightSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-w2-height-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='
        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = scope.question.options.defaultValue;
            }
        }
    };
});

registrationApp.directive('weightSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-w3-weight-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = scope.question.options.defaultValue;
            }
        }
    };
});

registrationApp.directive('addressSelection', function () {
    return {
        templateUrl: '/partials/registration/address.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};

                scope.question.answer.ship = {};
                scope.question.answer.ship.address1 = '';
                scope.question.answer.ship.address2 = '';
                scope.question.answer.ship.city = '';
                scope.question.answer.ship.zipCode = null;
                scope.question.answer.ship.state = '';
                scope.question.answer.ship.country = '';
            }

            //Possible states
            scope.states = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

            //Possible countries
            //scope.countries = ["United States", "United Kingdom", "Australia"];
            scope.countries = ["United States", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Ascension Island", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bophuthatswana", "Bosnia-Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean", "British Virgin Islands", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde Island", "Cayman Islands", "Central Africa", "Chad", "Channel Islands", "Chile", "China, Peoples Republic", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros Islands", "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Easter Island", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Faeroe Islands", "Falkland Islands", "Fiji", "Finland", "France", "French Guyana", "French Polynesia", "Gabon", "Gambia", "Georgia Republic", "Germany", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe (French)", "Guatemala", "Guernsey Island", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Heard and McDonald Isls", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Ireland", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jersey Island", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Martinique (French)", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldavia", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia (French)", "New Zealand", "Nicaragua", "Niger", "Niue", "Norfolk Island", "Northern Ireland", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn Island", "Poland", "Polynesia (French)", "Portugal", "Qatar", "Reunion Island", "Romania", "Russia", "Rwanda", "S.Georgia Sandwich Isls", "San Marino", "Sao Tome, Principe", "Saudi Arabia", "Scotland", "Senegal", "Serbia", "Seychelles", "Shetland", "Sierra Leone", "Singapore", "Slovak Republic", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St. Helena", "St. Kitts Nevis Anguilla", "St. Lucia", "St. Martins", "St. Pierre Miquelon", "St. Vincent Grenadines", "Sudan", "Suriname", "Svalbard Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Tahiti", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Isls", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City State", "Venezuela", "Vietnam", "Virgin Islands (Brit)", "Wales", "Wallis Futuna Islands", "Western Sahara", "Western Samoa", "Yemen", "Yugoslavia", "Zaire", "Zambia", "Zimbabwe"];
        }
    };
});

registrationApp.directive('winterActivitySelection', ['$http', 'OS', function ($http, OS) {
    return {
        templateUrl: '/partials/registration/winter-activity.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.values = [];
            }

            //Tooltip for multiple selection
            scope.multiSelectTooltip = OS.isMac() ? 'To select multiple activities, hold down the COMMAND key' : 'To select multiple activities, hold down the CTRL key';

            scope.activities = {};

            $http.get('/js/static-data.json')
                .success(function (result) {
                    var keyFields = result.activities;

                    //Prepare the Winter Activities Selection
                    for (var i = 0; i < keyFields.length; i++) {
                        scope.activities[keyFields[i]] = false;
                    }
                });

            //Is the option selected
            scope.isSelected = function (element) {
                return scope.question.answer.values.indexOf(element) !== -1;
            };

            //Updated the selected options
            scope.selectionsChanged = function () {
                for (var key in scope.activities) {
                    scope.activities[key] = scope.isSelected(key);
                }
            };

            //Run it once to set the values initially
            scope.selectionsChanged();
        }
    };
}]);

registrationApp.directive('summerActivitySelection', ['$http', 'OS', function ($http, OS) {
    return {
        templateUrl: '/partials/registration/summer-activity.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.values = [];
            }

            //Tooltip for multiple selection
            scope.multiSelectTooltip = OS.isMac() ? 'To select multiple activities, hold down the COMMAND key' : 'To select multiple activities, hold down the CTRL key';

            scope.activities = {};

            $http.get('/js/static-data.json')
                .success(function (result) {
                    var keyFields = result.activities;

                    //Prepare the Winter Activities Selection
                    for (var i = 0; i < keyFields.length; i++) {
                        scope.activities[keyFields[i]] = false;
                    }
                });

            //Is the option selected
            scope.isSelected = function (element) {
                return scope.question.answer.values.indexOf(element) !== -1;
            };

            //Updated the selected options
            scope.selectionsChanged = function () {
                for (var key in scope.activities) {
                    scope.activities[key] = scope.isSelected(key);
                }
            };

            //Run it once to set the values initially
            scope.selectionsChanged();
        }
    };
}]);

registrationApp.directive('shoeSizeSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-w4-shoe-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '=',
           genderValue: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = 10;
            }
        }
    };
});

registrationApp.directive('notificationSelection', function () {
    return {
        templateUrl: '/partials/registration/notifications.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.values = [];
            }

            scope.values = ["General Updates", "Design Projects", "Product Tests", "Educational Information"];

            var updateSelected = function (action, element) {
                if (action === "add" & scope.question.answer.values.indexOf(element) === -1) {
                    scope.question.answer.values.push(element);
                } else if (action === "remove" && scope.question.answer.values.indexOf(element) !== -1) {
                    scope.question.answer.values.splice(scope.question.answer.values.indexOf(element), 1);
                }
            };

            scope.updateSelection = function ($event, element) {
                var checkbox = $event.target;
                var action = checkbox.checked ? "add" : "remove";
                updateSelected(action, element);
            };

            scope.selectAll = function ($event) {
                var checkbox = $event.target;
                var action = checkbox.checked ? "add" : "remove";
                for (var i = 0; i < scope.values.length; i++) {
                    updateSelected(action, scope.values[i]);
                }
            };

            scope.selectNone = function () {
                for (var i = 0; i < scope.values.length; i++) {
                    updateSelected("remove", scope.values[i]);
                }
            };

            scope.isNoneSelected = function () {
                return scope.question.answer.values.length === 0;
            };

            scope.isSelected = function (element) {
                return scope.question.answer.values.indexOf(element) !== -1;
            };

            scope.isSelectedAll = function () {
                return scope.values.length === scope.question.answer.values.length;
            };

            //Ensure that the selection of the "None" option is correctly set
            scope.$watch('noneSelection', function () {
                scope.noneSelection = scope.isNoneSelected();
            });
        }
    };
});

registrationApp.directive('runningShoeSizeSelection', function () {
    return {
        templateUrl: '/partials/registration/running-shoe-size.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '=',
           genderValue: '='


        },
        link: function (scope, iElement, iAttr) {

            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = 10;
            }
        }
    };
});

registrationApp.directive('shoeWidthSelection', function () {
    return {
        templateUrl: '/partials/registration/shoe-width.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        controller: ['$scope', function (scope) {
            scope.availableSizes = [
                'AA',
                'A',
                'B',
                'C',
                'D',
                'E',
                'EE',
                'EEE',
                'EEEE'
            ];

        }],
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = 3.25;
            }
        }
    };
});

registrationApp.directive('shirtSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-w5-shirt-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "xs";
            }
        }
    };
});

registrationApp.directive('sleeveLengthSelection', function () {
    return {
        templateUrl: '/partials/registration/sleeve-length.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = 34;
            }
        }
    };
});

registrationApp.directive('jacketSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-w6-jacket-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "xs";
            }
        }
    };
});

registrationApp.directive('pantSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-w7-pants-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "";
            }

            scope.setPantSize = function (size) {
                scope.question.answer.value = size;

                //Proceed to next question
                scope.$parent.$parent.nextQuestion();
            };
        }
    };
});

registrationApp.directive('shoulderSelection', function () {
    return {
        templateUrl: '/partials/registration/shoulder-measurement.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = 24;
            }
        }
    };
});

registrationApp.directive('bustSelection', function () {
    return {
        templateUrl: '/partials/registration/bust-measurement.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = 34;
            }
        }
    };
});

registrationApp.directive('seatSelection', function () {
    return {
        templateUrl: '/partials/registration/seat-measurement.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = 36;
            }
        }
    };
});

registrationApp.directive('gloveSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-w8-gloves-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        controller: ['$scope', function(scope) {
            scope.availableSizes = [
                [
                    'XXS',
                    'XS',
                    'S',
                    'M'
                ],
                [
                    'L',
                    'XL',
                    'XXL',
                    'XXXL'
                ]
            ];
        }],
        link: function (scope, element, attr, template) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = "M";
            }
        }
    };
});

registrationApp.directive('dobSelection', function () {
    return {
        templateUrl: '/partials/registration/ref-a2-dob-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='
        },
        controller: ['$scope', function ($scope) {
            var calledOnce = false;
            //Check if user is under 13
            $scope.isUnder13 = function () {
                if (document.cookie.indexOf('under13') > -1 && !calledOnce) {
                    calledOnce = true;
                    $scope.nextQuestion();
                }
                return document.cookie.indexOf('under13') > -1;
            };
        }],
        link: function (scope, iElement, iAttr) {

            if (!scope.question.answer) {
                scope.question.answer = {};
            }
            if (!scope.question.answer.value) {
                scope.question.answer.value = null;
            }
            if (scope.question.answer.value !== undefined) {
                scope.question.answer.dob = new Date(scope.question.answer.value);
            }

        }
    };
});

registrationApp.directive('usernamePasswordSelection', function () {
    return {
        templateUrl: '/partials/registration/username-password.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.username = '';
                scope.question.answer.password = '';
                scope.question.answer.confirmPassword = '';
            }
        }
    };
});

registrationApp.directive('usernameSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-a5-username-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = '';
            }
        }
    };
});

registrationApp.directive('passwordSelection', function () {
    return {
        templateUrl: '/partials/registration/reg-a6-password-v1.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, element, attr, template) {
            if(!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = '';
                scope.question.answer.valueConfirm = '';
                scope.question.answer.authConfirmed = null;
            }
        }
    };
});

registrationApp.directive('personalSelection', function () {
    return {
        templateUrl: '/partials/registration/personal-info.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.fname = '';
                scope.question.answer.lname = '';
                scope.question.answer.email = '';
                scope.question.answer.confirmEmail = '';
            }
        }
    };
});

registrationApp.directive('favoriteQuoteSelection', function () {
    return {
        templateUrl: '/partials/registration/favorite-quote.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = '';
            }
        }
    };
});

registrationApp.directive('aboutMeSelection', function () {
    return {
        templateUrl: '/partials/registration/about-me.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.value = '';
            }
        }
    };
});

registrationApp.directive('mobileNumberSelection', function () {
    return {
        templateUrl: '/partials/registration/mobile-number.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            var firstOccurrence,
                secondOccurrence;

            if (angular.isUndefined(scope.question.answer) || angular.isUndefined(scope.question.answer.value)) {
                scope.question.answer = {};
                scope.question.answer.value = '';
            }
        }
    };
});

registrationApp.directive('profileChangePassword', function () {
    return {
        templateUrl: '/partials/registration/profile-change-password.html',
        restrict: 'E',
        scope: {
            updateInfo: '='
        },
        controller: 'ChangePasswordCtrl'
    };
});

registrationApp.directive('brandAssociationSelection', function () {
    return {
        templateUrl: '/partials/registration/brand-association.html',
        restrict: 'E',
        scope: {
           question: '=',
           nextQuestion: '&',
           previousQuestion: '&',
           isFirstQuestion: '&',
           getQuestionCount: '&',
           validationError: '=',
           validationErrorMessage: '=',
           showUpdateButton: '=',
           currentQuestionNumber: '='

        },
        link: function (scope, iElement, iAttr) {
            if (!scope.question.answer) {
                scope.question.answer = {};
                scope.question.answer.values = [];
            }
        }
    };
});
