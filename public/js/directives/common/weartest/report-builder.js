dashboardApp.directive('weartestReportBuilder', [
function () {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/report-builder.html',
        controller: 'WeartestReportBuilderCtrl'
    };
}]);

//Directive to show the images with data points in a read only mode
dashboardApp.directive('datapointsViewer', ['$timeout', function ($timeout) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            image: '@',
            index: '@'
        },
        link: {
            post: function postLink (scope, iElement, iAttr) {
                var containerWidth = 326,
                    containerHeight = 260;

                scope.getScaledImage = function (fullSizeImageUrl, width, height, cropMode) {
                    //Check if URL is provided
                    if (fullSizeImageUrl === undefined) {
                        return;
                    }

                    //Prepare the regular expression for the host URL
                    var hostUrlRe = /\/[^\/]+\/[^\/]+$/;

                    //Get the host URL
                    var hostUrl = fullSizeImageUrl.split(hostUrlRe)[0];

                    //Get the remaining part of the URL
                    var tempString = fullSizeImageUrl.split(hostUrl + '/')[1];

                    var imageIdUrlRe = /\//;

                    //Get the public ID of the image along with the extension
                    var imageIdUrl = tempString.split(imageIdUrlRe)[1];

                    if (!cropMode) {
                        cropMode = 'c_fit';
                    }

                    //Finally return the URL
                    return hostUrl + '/' + width +',' + height + ',' + cropMode + '/' + imageIdUrl;
                };

                scope.initCanvas = function () {
                    scope.imageObj = new Image();
                    scope.backgroundLayer = new Kinetic.Layer();

                    scope.imageObj.onload = function () {
                        var sneaker = new Kinetic.Image({
                            x: 0,
                            y: 0,
                            image: scope.imageObj
                        });

                        if (angular.isUndefined(scope.backgroundLayer.children[0])) {
                            scope.backgroundLayer.add(sneaker);
                            scope.stage.add(scope.backgroundLayer);
                            scope.backgroundLayer.moveToBottom();
                        } else {
                            scope.backgroundLayer.removeChildren();
                            scope.backgroundLayer.add(sneaker);
                            scope.backgroundLayer.draw();
                        }
                    };
                };

                scope.redrawCircle = function () {
                    // check user object is not present then all values are intialized
                    if (angular.isUndefined(scope.user)) {

                        scope.selectedImage = {};

                        scope.circleId = 1;

                        scope.tags = [];

                        //define stage
                        scope.stage = new Kinetic.Stage({
                            container: iElement[0],
                            width: containerWidth,
                            height: containerHeight
                        });

                        // set user object and add layer
                        scope.user = {};
                        scope.user.layer = new Kinetic.Layer();
                        scope.stage.add(scope.user.layer);
                        // call initCanvas
                        scope.initCanvas();
                    }
                };

                scope.addCircle = function (stage, x, y, color) {
                    var circle = new Kinetic.Circle({
                        x: x,
                        y: y,
                        radius: 8,
                        fill: color,
                        stroke: 'black',
                        strokeWidth: 2,
                        draggable: false,
                        scale: 1,
                        startScale: 1,
                        shadowColor: 'black',
                        shadowBlur: 10,
                        shadowOffset: [5, 5],
                        shadowOpacity: 0.6,
                        id: scope.circleId
                    });

                    scope.circleId++;
                    return circle;
                };

                //set specific Image for datapoints
                scope.setImageToGallery = function (image) {
                    scope.circleId = 1;

                    // remove all Children
                    scope.user.layer.removeChildren();
                    scope.user.layer.draw();
                    scope.selectedImage = image;
                    scope.tags = [];

                    scope.selectedImage.newUrl = scope.getScaledImage(image.url, 'w_' + containerWidth, 'h_' + containerHeight, 'c_fit');

                    // add datapoints to image
                    for (var k = 0; k < image.dataPoints.length; k++) {
                        scope.tags.push(image.dataPoints[k]);
                        var tag = scope.tags[k];
                        var scaleX = angular.isUndefined(tag.scaleX) ? 200 : tag.scaleX;
                        var scaleY = angular.isUndefined(tag.scaleY) ? 200 : tag.scaleY;
                        var x = (tag.x / scaleX) * containerWidth;
                        var y = (tag.y / scaleY) * containerHeight;
                        var circle = scope.addCircle(scope.stage, x, y, tag.color);
                        tag.shape = circle;
                        scope.user.layer.add(circle);
                    }

                    scope.imageObj.src = scope.selectedImage.newUrl;
                    scope.user.layer.draw();
                };

                scope.$watch('image', function () {
                    if (typeof scope.image === "string") {
                        scope.imageToDisplay = JSON.parse(scope.image);

                        scope.setImageToGallery(scope.imageToDisplay);
                    }
                });

                scope.redrawCircle();
            }
        }
    };
}]);

dashboardApp.directive('reportUiTinymce', ['uiTinymceConfig', function (uiTinymceConfig) {
    uiTinymceConfig = uiTinymceConfig || {};
    var generatedIds = 0;
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModel) {
            var expression, options, tinyInstance, commentSize = 100,
                updateView = function () {
                    ngModel.$setViewValue(elm.val());
                };

            ngModel.$render = function() {
                if (!tinyInstance) {
                    tinyInstance = tinymce.get(attrs.id);
                }
                if (tinyInstance) {
                    tinyInstance.setContent(ngModel.$viewValue || '');
                }
            };
            // generate an ID if not present
            if (!attrs.id) {
                attrs.$set('id', 'reportUiTinymce' + generatedIds++);
            }

            if (attrs.reportUiTinymce) {
                expression = scope.$eval(attrs.reportUiTinymce);
            } else {
                expression = {};
            }
            //Returns the age from the date
            var getAge = function (value) {
                var birthDate = new Date(value),
                    today = new Date(),
                    age = today.getFullYear() - birthDate.getFullYear(),
                    month = today.getMonth() - birthDate.getMonth();

                if (value === null) {
                    return 0;
                }

                if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
                    age =  age - 1;
                }

                return age;
            };

            function getTesterInfo(userid, state, dob){
                var testerInfo = {
                    state: '',
                    dob: '',
                    username: ''
                };

                for(var j = 0; j < expression.testerprofile.length; j++) {
                    var tester = expression.testerprofile[j];
                    if(tester._id === userid) {
                        for (var i = 0; i < tester.address.length; i++) {
                            if (tester.address[i].hasOwnProperty('state')) {
                                testerInfo.state = tester.address[i].state;
                                break
                            }
                        }
                        testerInfo.dob = tester.dateOfBirth;
                        testerInfo.username = tester.username;
                    }
                    if(testerInfo.state !== ''){
                        break;
                    }
                }
                return testerInfo;
            }

            function unique(origArr) {
                var newArr = [],
                    origLen = origArr.length,
                    found, x, y;

                for (x = 0; x < origLen; x++) {
                    found = undefined;
                    for (y = 0; y < newArr.length; y++) {
                        if (origArr[x].text === newArr[y].text) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        newArr.push(origArr[x]);
                    }
                }
                return newArr;
            }


            options = {
                // Update model when calling setContent (such as from the source editor popup)
                setup: function (ed) {

                    //For Testers profile menu
                    tinymce.PluginManager.add('testerProfilePlugin', function(ed) {
                        var mainMenu = {
                            type: 'menubutton',
                            text: 'Testers',
                            icon: false
                        };
                        mainMenu.menu = [];

                        tinymce.each(expression.testerprofile, function (myListItemName) {
                            var menuItems = [],
                                mi = {
                                    text: myListItemName.username
                                },
                                tags = {
                                    text: 'Tags'
                                },
                                surveys = {
                                    text: 'Submitted Survey'
                                },
                                comments = {
                                    text: 'Comments'
                                },
                                quote = {
                                    text: 'Quote+'
                                };


                            mi.menu = [];
                            tags.menu = [];
                            comments.menu = [];
                            quote.menu = [];
                            menuItems.push(quote);

                            menuItems.push({
                                text: 'Username',
                                onclick: function () {
                                    ed.insertContent(myListItemName.username);
                                }
                            });
                            menuItems.push({
                                text: 'Age',
                                onclick: function () {
                                    ed.insertContent(getAge(myListItemName.dateOfBirth).toString());
                                }
                            });
                            menuItems.push({
                                text: 'Weight',
                                onclick: function () {
                                    ed.insertContent(myListItemName.weight.toString() + ' lbs');
                                }
                            });
                            menuItems.push({
                                text: 'Height',
                                onclick: function () {
                                    ed.insertContent(Math.floor(myListItemName.height/12) +"' "+ myListItemName.height%12 +'"');
                                }
                            });
                            menuItems.push({
                                text: 'Profession',
                                onclick: function () {
                                    ed.insertContent(myListItemName.profession);
                                }
                            });
                            menuItems.push({
                                text: 'Shoe Size',
                                onclick: function () {
                                    ed.insertContent(myListItemName.shoeSize.toString());
                                }
                            });


                            //tester tags
                            tinymce.each(expression.tagRecords, function (tagRecord) {
                                if(tagRecord.testerUserId === myListItemName._id) {
                                    tinymce.each(tagRecord.tags, function (tagsName) {
                                        tags.menu.push({
                                            text: tagsName,
                                            onclick: function () {
                                                ed.insertContent(tagsName);
                                            }
                                        });
                                    });
                                }
                            });

                            // tester comments
                            tinymce.each(expression.surveysSubmitted, function (survey) {
                                if(survey.createUsername === myListItemName.username){
                                    tinymce.each(survey.answers, function (answer) {
                                        var comment = '';
                                        if(answer.type === 'Free form text'){
                                            comment = answer.value;
                                        } else {
                                            comment = answer.comment;
                                        }
                                        if(!angular.isUndefined(comment) && comment.trim().length > 0) {
                                            var parComment = comment.trim();
                                            if(parComment.length > commentSize) {
                                                parComment = parComment.substring(0, commentSize);
                                            }
                                            comments.menu.push({
                                                text: parComment,
                                                onclick: function () {
                                                    ed.insertContent(comment);
                                                }
                                            });
                                            quote.menu.push({
                                                text: parComment,
                                                menu: [
                                                    {
                                                        text: 'Black (neutral)',
                                                        textStyle: 'color:#000000;',
                                                        onclick: function() {

                                                            var tester = getTesterInfo(survey.createUserId);

                                                            ed.insertContent('<span style="color: #000000;">"' + comment + '" ' +
                                                            '</span>' + survey.createUsername + ', ' + getAge(tester.dob).toString() +
                                                            ', ' + tester.state);
                                                            ed.focus();

                                                        }},
                                                    {
                                                        text: 'Red (negative)',
                                                        textStyle: 'color:#FF0000;',
                                                        onclick: function() {

                                                            var tester = getTesterInfo(survey.createUserId);

                                                            ed.insertContent('<span style="color: #FF0000;">"' + comment + '" ' +
                                                            '</span>' + survey.createUsername + ', ' + getAge(tester.dob).toString() +
                                                            ', ' + tester.state);

                                                        }},
                                                    {
                                                        text: 'Green (positive)',
                                                        textStyle: 'color:#008000;',
                                                        onclick: function() {

                                                            var tester = getTesterInfo(survey.createUserId);

                                                            ed.insertContent('<span style="color: #008000;">"' + comment+'" ' +
                                                            '</span>' + survey.createUsername + ', ' + getAge(tester.dob).toString() +
                                                            ', ' + tester.state);

                                                        }}]
                                            });
                                        }
                                    });
                                }

                            });

                            //Activity logs comments
                            tinymce.each(expression.activityLogs, function (activityLog) {
                                if(activityLog.userId === myListItemName._id){
                                    var comment = activityLog.notes;
                                    if(!angular.isUndefined(comment) && comment.trim().length > 0) {
                                        var parComment = comment.trim();
                                        if(parComment.length > commentSize) {
                                            parComment = parComment.substring(0, commentSize);
                                        }
                                        comments.menu.push({
                                            text: parComment,
                                            onclick: function () {
                                                ed.insertContent(comment);
                                            }
                                        });
                                    }
                                }

                            });

                            quote.menu = unique(quote.menu);
                            comments.menu = unique(comments.menu);

                            menuItems.push(tags);
                            menuItems.push(comments);
                            mi.menu = menuItems;
                            mainMenu.menu.push(mi);
                        });
                        ed.addButton('TesterProfile', mainMenu);
                    });

                    //For Surveys menu
                    tinymce.PluginManager.add('surveysPlugin', function(ed) {
                        var mainMenu = {
                            type: 'menubutton',
                            text: 'Surveys',
                            icon: false
                        };
                        mainMenu.menu = [];

                        // tester comments
                        tinymce.each(expression.surveysSubmitted, function (survey) {
                            var menuItems = [],
                                mi = {},
                                mi1 = {}
                                qComments = {};

                            var surveyExist = false;

                            //Checking survey already exist or not
                            for(var i = 0; i < mainMenu.menu.length; i++){
                                if(mainMenu.menu[i].text === survey.surveyName) {
                                    surveyExist = true;
                                    mi.menu = mainMenu.menu[i].menu;
                                    mi.text = survey.surveyName;
                                    m1 = mainMenu.menu[i];
                                }
                            }
                            if(!surveyExist) {
                                mi.text = survey.surveyName;
                                mi.menu = [];
                            }

                            //For questions and comments
                            tinymce.each(survey.answers, function (answer) {
                                var comment = '',
                                    qName = answer.questionName,
                                question = {};

                                if (qName.trim().length > commentSize) {
                                    qName = answer.questionName.substring(0, commentSize);
                                }
                                mi.menu = checkQuestionExist(mi.menu, qName);

                                   question.menu = [];
                                   if (answer.type === 'Free form text') {
                                       comment = answer.value;
                                   } else {
                                       comment = answer.comment;
                                   }

                                    if(!angular.isUndefined(comment) && comment.trim().length > 0) {
                                        mi.menu = checkQCommentExist( mi.menu, qName, comment, survey);
                                    }

                            });

                            if(!surveyExist) {
                                mainMenu.menu.push(mi);
                            }
                        });

                        //Activity logs comments
                        var avMi = {
                            text: "Activity Logs"
                        }
                        avMi.menu = [];

                        tinymce.each(expression.activityLogs, function (activityLog) {
                                var comment = activityLog.notes;
                                if(!angular.isUndefined(comment) && comment.trim().length > 0) {
                                    var parComment = comment.trim();
                                    if(parComment.length > commentSize) {
                                        parComment = parComment.substring(0, commentSize);
                                    }
                                    avMi.menu.push({
                                        text: parComment,

                                        menu: [{
                                                text: 'Black (neutral)',
                                                textStyle: 'color:#000000;',
                                                onclick: function () {

                                                    var tester = getTesterInfo(activityLog.userId);

                                                    ed.insertContent('<span style="color: #000000;">"' + comment + '" ' + '</span>' +
                                                    tester.username + ', ' + getAge(tester.dob).toString() + ', ' + tester.state);

                                                }
                                            },
                                            {
                                                text: 'Red (negative)',
                                                textStyle: 'color:#FF0000;',
                                                onclick: function () {

                                                    var tester = getTesterInfo(activityLog.userId);

                                                    ed.insertContent('<span style="color: #FF0000;">"' + comment + '" ' + '</span>' +
                                                    tester.username + ', ' + getAge(tester.dob).toString() + ', ' + tester.state);

                                                }
                                            },
                                            {
                                                text: 'Green (positive)',
                                                textStyle: 'color:#008000;',
                                                onclick: function () {

                                                    var tester = getTesterInfo(activityLog.userId);

                                                    ed.insertContent('<span style="color: #008000;">"' + comment + '" ' + '</span>' +
                                                    tester.username + ', ' + getAge(tester.dob).toString() + ', ' + tester.state);

                                                }
                                            }]
                                    });
                                }
                        });
                        mainMenu.menu.push(avMi);

                        ed.addButton('Surveys', mainMenu);
                    });

                    // insert question comments
                    function insertQComments(comment, survey) {
                        var question = {};
                        question.menu = [];

                        var parComment = comment.trim();
                        if (parComment.length > commentSize) {
                            parComment = parComment.substring(0, commentSize);
                        }

                        question.menu.push({
                            text: parComment,
                            menu: [{
                                    text: 'Black (neutral)',
                                    textStyle: 'color:#000000;',
                                    onclick: function () {

                                        var tester = getTesterInfo(survey.createUserId);

                                        ed.insertContent('<span style="color: #000000;">"' + comment + '" ' + '</span>' +
                                        survey.createUsername + ', ' + getAge(tester.dob).toString() + ', ' + tester.state);

                                    }
                                }, {
                                    text: 'Red (negative)',
                                    textStyle: 'color:#FF0000;',
                                    onclick: function () {

                                        var tester = getTesterInfo(survey.createUserId);

                                        ed.insertContent('<span style="color: #FF0000;">"' + comment + '" ' + '</span>' +
                                        survey.createUsername + ', ' + getAge(tester.dob).toString() + ', ' + tester.state);

                                    }
                                },
                                    {
                                    text: 'Green (positive)',
                                    textStyle: 'color:#008000;',
                                    onclick: function () {

                                        var tester = getTesterInfo(survey.createUserId);

                                        ed.insertContent('<span style="color: #008000;">"' + comment + '" ' + '</span>' +
                                        survey.createUsername + ', ' + getAge(tester.dob).toString() + ', ' + tester.state);

                                    }
                                }]
                        });
                        return question.menu[0];

                    };

                    // Check question comments already exist or not
                    function checkQCommentExist(arr, qName, value, survey) {
                        for (var i = 0; i < arr.length; i++) {
                            var question = arr[i].menu;
                            if (arr[i].text === qName) {
                                for (var j = 0; j < question.length; j++) {
                                    if (question[j].text === value) {
                                        return arr;
                                    }
                                }
                                arr[i].menu.push(insertQComments(value, survey));
                            }
                        }

                        return arr;
                    }

                    // Check question already exist or not
                    function checkQuestionExist(arr, value) {
                        for (var i = 0; i < arr.length; i++) {
                             if (arr[i].text === value) {
                                    return arr;
                                }
                            }
                        arr.push({  menu: [],
                                    text: value}
                        );
                        return arr;
                    }

                    var args;
                    ed.on('init', function(args) {
                        ngModel.$render();
                    });
                    // Update model on button click
                    ed.on('ExecCommand', function (e) {
                        ed.save();
                        updateView();
                    });
                    // Update model on keypress
                    ed.on('KeyUp', function (e) {
                        ed.save();
                        updateView();
                    });
                    // Update model on change, i.e. copy/pasted text, plugins altering content
                    ed.on('SetContent', function (e) {
                        ed.save();
                    });
                    //Save changes to model when the textarea loses focus
                    ed.on('blur', function () {
                        if (!angular.isUndefined(attrs.onBlur)) {
                            scope.$apply(attrs.onBlur);
                        }
                    });

                    if (expression.setup) {
                        scope.$eval(expression.setup);
                        delete expression.setup;
                    }
                },
                mode: 'exact',
                elements: attrs.id
            };
            // extend options with initial uiTinymceConfig and options from directive attribute value
            angular.extend(options, uiTinymceConfig, expression);
            setTimeout(function () {
                tinymce.init(options);
            });
        }
    };
}]);