imagesetApp.directive('imagesetDataPoints', ['$http', '$timeout', '$filter', 'loginState',
    function ($http, $timeout, $filter, loginState) {
        'use strict';
        return {
            restrict: 'E',
            templateUrl: '/partials/restricted/common/imageSets/image-data-point.html',
            scope: {
                imageset: '=',
                typeSpecific: '@',
                userDetails: '@',
                updateImagesetInfo: '='
            },
            link: function (scope, iElement, iAttrs) {
                scope.$watch('imageset', function () {
                    var i,
                        j,
                        userInfo,
                        dataPoints,
                        images,
                        imageWidth = 426,
                        imageHeight = 360,
                        tooltipPointerHeight = 10,
                        tooltipPointerWidth = 10;

                    //Identifies the direction of the pointer
                    //Since the tooltip is to be shown relative to the pointer, but within the
                    //boundaries of the container, we have this algorithm to detect the best positioning of the
                    //tooltiip
                    var getTooltipDirection = function (pointXPosition, pointYPosition, tooltipWidth, tooltipHeight) {
                        var newHeight,
                            newWidth,
                            tooltipHeightTopFit,
                            tooltipHeightBottomFit,
                            tooltipWidthLeftFit,
                            tooltipWidthRightFit;
                        
                        //First check if the tooltip can be positioned above the data point
                        //For this, assume that the tooltip is positioned above the data point and verify that
                        //the entire tooltip will be visible

                        //Add the height of the tooltip pointer to the height of the tooltip to accomodate the pointer
                        newHeight = tooltipHeight + tooltipPointerHeight;
                        //Take the y position of the data point and subtract the height of the tooltip from it
                        tooltipHeightTopFit = pointYPosition - newHeight;
                        //Check if the height of the tooltip fits within the container
                        if (tooltipHeightTopFit >= 0) {
                            //Yes, it does. Now check for the width
                            //The tooltip pointer will be at the center of the tooltip width.
                            //So, first check if the left half fits within the container
                            tooltipWidthLeftFit = pointXPosition - (tooltipWidth / 2);
                            //Check if the left section of the tooltip fits within the container
                            if (tooltipWidthLeftFit >= 0) {
                                //Yes it does. Now check for the right half
                                tooltipWidthRightFit = pointXPosition + (tooltipWidth / 2);
                                //Check if the right section of the tooltip fits within the container
                                if (tooltipWidthRightFit <= imageWidth) {
                                    //Yes it does. All criteria to have the tooltip above the data point met.
                                    //Show the tooltip above the data point
                                    return 'down';
                                }
                            }
                        }

                        //Now, check if the tooltip can be positioned below the data point
                        //For this assume that the tooltip is positioned below the data point and verify that the entire tooltip will be visible

                        //Add the height of the tooltip pointer to the height of the tooltip to accomodate the pointer
                        newHeight = tooltipHeight + tooltipPointerHeight;
                        //Take the y position of the data point and add the height of the tooltip to it
                        tooltipHeightBottomFit = pointYPosition + newHeight;
                        //Check if the height of the tooltip fits within the container
                        if (tooltipHeightBottomFit <= imageHeight) {
                            //Yes it does. Now check for the width
                            //The tooltip pointer will be at the center of the tooltip width.
                            //So, first check if the left half fits within the container
                            tooltipWidthLeftFit = pointXPosition - (tooltipWidth / 2);
                            //Check if the left section of the tooltips fit within the container
                            if (tooltipWidthLeftFit >= 0) {
                                //Yes it does. Now check for the right half
                                tooltipWidthRightFit = pointXPosition + (tooltipWidth / 2);
                                //Check if the right section of the tooltip fits within the container
                                if (tooltipWidthRightFit <= imageWidth) {
                                    //Yes it does. All criteria to have the tooltip above the data point met.
                                    //Show the tooltip above the data point
                                    return 'up';
                                }
                            }
                        }

                        //Now check if the tooltip can be positioned to the left of the data point
                        //For this assume that the tooltip is positioned to the left of the data point and verify that the entire tooltip will be visible

                        //Add the width of the tooltip to the height of the tooltip pointer to accomodate the pointer
                        newWidth = tooltipWidth + tooltipPointerHeight;
                        //Take the x position of the data point and subtract the width of the tooltip from it
                        tooltipWidthLeftFit = pointXPosition - newWidth;
                        //Check if the width of the tooltip fits within the container
                        if (tooltipWidthLeftFit >= 0) {
                            //Yes it does - Now check for the height
                            //The tooltip pointer will be at the center of the tooltip height.
                            //So first check if the top half fits within the container
                            tooltipHeightTopFit = pointYPosition - (tooltipHeight / 2);
                            //Check if the top section of the tooltip fits within the container
                            if (tooltipHeightTopFit >= 0) {
                                //Yes it does - now check for the bottom half
                                tooltipHeightBottomFit = pointYPosition + (tooltipHeight / 2);
                                //Check if the bottom section of the tooltip fits within the container
                                if (tooltipHeightBottomFit <= imageHeight) {
                                    //Yes it does. All criteria to have the tooltip to the left of the data point met.
                                    //Show the tooltip to the left of the data point
                                    return 'right';
                                }
                            }
                        }

                        //Now check if the tooltip can be positioned to the right of the data point
                        //For this assume that the tooltip is positioned to the right of the data point and verify that the entire tooltip will be visible

                        //Add the width of the tooltip to the height of the tooltip pointer to accomodate the pointer
                        newWidth = tooltipWidth + tooltipPointerHeight;
                        //Take the x position of the data point and add the width of the tooltip to it
                        tooltipWidthLeftFit = pointXPosition + newWidth;
                        //Check if the width of the tooltip fits within the container
                        if (tooltipWidthLeftFit <= imageWidth) {
                            //Yes it does - Now check for the height
                            //The tooltip pointer will be at the center of the tooltip height.
                            //So first check if the top half fits within the container
                            tooltipHeightTopFit = pointYPosition - (tooltipHeight / 2);
                            //Check if the top section of the tooltip fits within the container
                            if (tooltipHeightTopFit >= 0) {
                                //Yes it does - now check for the bottom half
                                tooltipHeightBottomFit = pointYPosition + (tooltipHeight / 2);
                                //Check if the bottom section of the tooltip fits within the container
                                if (tooltipHeightBottomFit <= imageHeight) {
                                    //Yes it does. All criteria to have the tooltip to the right of the data point met.
                                    //Show the tooltip to the right of the data point
                                    return 'left';
                                }
                            }
                        }

                        //Looks like no criteria met. No tooltip pointer
                        return 'none';
                    };

                    //For unknown reasons, the tool tip direction is not correct the first time when rendered
                    //Only when the tooltip is shown for the second time, the direction is rendered correctly.
                    //Thus this simple workaround that calls the rendering twice to get the desired effect
                    var correctTooltipDirection = function (stage, circle, displayMode) {
                        var mousePos = stage.getMousePosition();

                        var thisScope = angular.element("#photoViewer").scope();
                        var selTag = scope.getTagOfMarker(circle, thisScope.tags);
                        var tagDate;

                        if (angular.isUndefined(selTag.createdDate)) {
                            //Possible when the tag is newly created
                            //In such a case, set the current date to the created date
                            var currentDate = new Date();
                            var day = currentDate.getDate();
                            var month = currentDate.getMonth() + 1;
                            var year = currentDate.getFullYear();
                            tagDate = month + "/" + day + "/" + year;
                        } else {
                            tagDate = $filter('date')(selTag.createdDate, 'MM/dd/yy');
                        }

                        var comment = angular.isUndefined(selTag.comment) ? "" : selTag.comment;

                        scope.tooltipText.setText(tagDate + "\n" + comment);

                        var scaleX = angular.isUndefined(selTag.scaleX) ? 200 : selTag.scaleX;
                        var scaleY = angular.isUndefined(selTag.scaleY) ? 200 : selTag.scaleY;
                        var x = (selTag.x / scaleX) * imageWidth;
                        var y = (selTag.y / scaleY) * imageHeight;

                        scope.tooltip.setPosition(x, y);

                        var pointerDirection = getTooltipDirection(x, y, scope.tooltipText.getWidth(), scope.tooltipText.getHeight());

                        scope.tooltipTag.setPointerDirection(pointerDirection);

                        if (displayMode) {
                            scope.tooltip.show();
                            scope.tooltipLayer.moveToTop();
                            scope.tooltipLayer.draw();
                        } else {
                            scope.tooltip.show();
                            scope.tooltipLayer.moveToTop();
                            scope.tooltipLayer.draw();
                            scope.tooltip.hide();
                            scope.tooltip.draw();
                            correctTooltipDirection(stage, circle, true);
                        }
                    };

                    if (angular.isUndefined(scope.imageset)) {
                        return;
                    }

                    //Filter the images based on the type, if provided
                    scope.record = {};

                    scope.record = JSON.parse(JSON.stringify(scope.imageset));
                        
                    if (!angular.isUndefined(scope.typeSpecific)) {
                        //Filter the images based on the type
                        images = scope.record.images.slice(0);
                        scope.record.images = [];

                        for (i = 0; i < images.length; i++) {
                            if (images[i].type === scope.typeSpecific) {
                                scope.record.images.push(images[i]);
                            }
                        }
                    }

                    //Now filter the data points based on the user
                    if (typeof scope.userDetails === 'string') {
                        userInfo = JSON.parse(scope.userDetails);
                    } else {
                        userInfo = scope.userDetails;
                    }

                    for (i = 0; i < scope.record.images.length; i++) {
                        dataPoints = scope.record.images[i].dataPoints.slice(0);
                        scope.record.images[i].dataPoints = [];

                        for (j = 0; j < dataPoints.length; j++) {
                            if (dataPoints[j].userId === userInfo._id) {
                                scope.record.images[i].dataPoints.push(dataPoints[j]);
                            }
                        }
                    }

                    //Returns the scaled version of the image
                    scope.getScaledImage = function (fullSizeImageUrl, width, height, cropMode) {

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
                            cropMode = 'c_scale';
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

                        scope.backgroundLayer.on('mousedown', function (evt) {
                            var circle = scope.addCircle(scope.stage, scope.stage.getMousePosition().x, scope.stage.getMousePosition().y, 'Red');

                            angular.element("#photoViewer").scope().$apply(function (scope) {
                                //create tag and add it
                                var tag = {
                                    x: scope.stage.getMousePosition(evt).x,
                                    y: scope.stage.getMousePosition(evt).y,
                                    color: 'Red',
                                    shape: circle,
                                    isNew: true,
                                    user: scope.userDetails.username,
                                    isUpdate: false,
                                    isSelected: true,
                                    tags: [],
                                    scaleX: imageWidth,
                                    scaleY: imageHeight
                                };

                                scope.tags.push(tag);
                                if (scope.selectedTag) {
                                    scope.selectedTag.shape.attrs.stroke = 'black';
                                    scope.selectedTag.isSelected = false;
                                }

                                //set this as the selected tag
                                tag.shape.attrs.stroke = 'white';
                                scope.selectedTag = tag;
                                scope.user.layer.add(circle);
                                scope.user.layer.draw();
                            });
                        });
                    };

                    scope.addCircle = function (stage, x, y, color) {

                        var circle = new Kinetic.Circle({
                            x: x,
                            y: y,
                            radius: 8,
                            fill: color,
                            stroke: 'black',
                            strokeWidth: 2,
                            draggable: true,
                            scale: 1,
                            startScale: 1,
                            shadowColor: 'black',
                            shadowBlur: 10,
                            shadowOffset: [5, 5],
                            shadowOpacity: 0.6,
                            id: scope.circleId
                        });

                        //change cursor to the hand on marker hover...
                        circle.on('mouseover', function () {
                            document.body.style.cursor = 'pointer';
                            correctTooltipDirection(stage, circle, false);
                        });

                        //...and switch back on
                        circle.on('mouseout', function () {
                            document.body.style.cursor = 'default';
                            scope.tooltip.hide();
                            scope.tooltipLayer.draw();
                        });
                        //select marker and open edit mode
                        circle.on('mousedown', function () {
                            circle.attrs.stroke = 'white';
                            var thisScope = angular.element("#photoViewer").scope();
                            if (!thisScope.$$phase) {
                                //$digest or $apply
                                thisScope.$apply(function (scope) {
                                    if (scope.selectedTag) {
                                        if (scope.selectedTag.shape != circle) {
                                            scope.selectedTag.shape.attrs.stroke = 'black';
                                            scope.selectedTag.isSelected = false;
                                        }
                                    }
                                    //look for the tag associated with this marker an set it as selected
                                    scope.selectedTag = scope.getTagOfMarker(circle, scope.tags);
                                    scope.selectedTag.isSelected = true;
                                });
                            }
                        });

                        //fancy drag animation
                        circle.on('dragstart', function () {
                            circle.setAttrs({
                                shadowOffset: {
                                    x: 15,
                                    y: 15
                                },
                                scale: {
                                    x: circle.attrs.startScale * 1.2,
                                    y: circle.attrs.startScale * 1.2
                                }
                            });

                            //When the user is dragging the point, do not show the details of the point
                            scope.selectedTag.isSelected = false;
                        });

                        //stop dragging, update model
                        circle.on('dragend', function () {
                            //update circle coords on tag
                            var thisScope = angular.element("#photoViewer").scope();
                            if (!thisScope.$$phase) {
                                thisScope.$apply(function (scope) {
                                    scope.selectedTag.x = stage.getMousePosition().x;
                                    scope.selectedTag.y = stage.getMousePosition().y;
                                    scope.selectedTag.isUpdate = true;
                                    //Add scalex and scaleY for scaling
                                    scope.selectedTag.scaleX = imageWidth;
                                    scope.selectedTag.scaleY = imageHeight;

                                    //Update the tag position
                                    scope.putImageset(scope.selectedTag, null, false);
                                });
                            }
                        });
                        scope.circleId++;
                        return circle;
                    };

                    scope.redrawCircle = function () {
                        // check user object is not present then all values are intillized
                        if (angular.isUndefined(scope.user)) {

                            scope.selectedImage = {};

                            scope.circleId = 1;

                            scope.tags = [];

                            //define stage
                            scope.stage = new Kinetic.Stage({
                                container: 'container',
                                width: imageWidth,
                                height: imageHeight
                            });

                            //Will hold the tooltip
                            scope.tooltipLayer = new Kinetic.Layer();

                            //The actual tooltip displayed - for now it's position is unknown. Will be filled up dynamically
                            scope.tooltip = new Kinetic.Label({
                                visible: false,
                                opacity: 1,
                                draggable: false
                            });

                            //Background of the tooltip
                            scope.tooltipTag = new Kinetic.Tag({
                                fill: 'black',
                                shadowColor: 'black',
                                pointerWidth: tooltipPointerWidth,
                                pointerHeight: tooltipPointerHeight,
                                lineJoin: 'round',
                                shadowBlur: 10,
                                shadowOffset: 10,
                                shadowOpacity: 0.5
                            });

                            scope.tooltip.add(scope.tooltipTag);

                            //Text of the tooltip - this will be empty and be filled up dynamically
                            scope.tooltipText = new Kinetic.Text({
                                text: '',
                                fontFamily: 'Calibri',
                                fontSize: 18,
                                padding: 5,
                                fill: 'white',
                                width: 200
                            });

                            scope.tooltip.add(scope.tooltipText);

                            //Add the tooltip to the layer
                            scope.tooltipLayer.add(scope.tooltip);

                            //Add the layer to the stage
                            scope.stage.add(scope.tooltipLayer);

                            // set user object and add layer
                            if (typeof scope.userDetails === 'string') {
                                scope.user = JSON.parse(scope.userDetails);
                            } else {
                                scope.user = scope.userDetails;
                            }

                            scope.user.layer = new Kinetic.Layer();
                            scope.stage.add(scope.user.layer);
                            // call initCanvas
                            scope.initCanvas();
                        }
                    };

                    // set parameter of circle
                    scope.redrawCircle();

                    //set specific Image for datapoints
                    scope.setImageToGallery = function (image) {
                        scope.circleId = 1;

                        // remove all Children
                        scope.user.layer.removeChildren();
                        scope.user.layer.draw();
                        scope.selectedImage = image;
                        scope.tags = [];

                        scope.selectedImage.newUrl = scope.getScaledImage(image.url, 'w_' + imageWidth, 'h_' + imageHeight, 'c_fit');

                        // add datapoints to image
                        for (var k = 0; k < image.dataPoints.length; k++) {
                            scope.tags.push(image.dataPoints[k]);
                            var tag = scope.tags[k];
                            var scaleX = angular.isUndefined(tag.scaleX) ? 200 : tag.scaleX;
                            var scaleY = angular.isUndefined(tag.scaleY) ? 200 : tag.scaleY;
                            var x = (tag.x / scaleX) * imageWidth;
                            var y = (tag.y / scaleY) * imageHeight;
                            var circle = scope.addCircle(scope.stage, x, y, tag.color);
                            tag.shape = circle;
                            scope.user.layer.add(circle);
                        }

                        scope.imageObj.src = scope.selectedImage.newUrl;
                        scope.user.layer.draw();
                    };

                    //updates the color of the marker
                    scope.changeColor = function (tag) {
                        tag.shape.setFill(tag.color);
                        scope.user.layer.draw();
                        scope.selectedTag.isUpdate = true;
                    };

                    //looks for the tag associated to a marker
                    scope.getTagOfMarker = function (circle, tags) {
                        var len = tags.length;
                        for (var i = 0; i < len; ++i) {
                            if (i in tags) {
                                var s = tags[i];
                                if (s.shape.attrs.id == circle.attrs.id) {
                                    return s;
                                }
                            }
                        }
                    };

                    //put / update the imageset
                    scope.putImageset = function (tag, index, isDelete) {

                        //Update data points to image of Image Set
                        var _imageset = scope.imageset;

                        for (var i = 0; i < _imageset.images.length; i++) {
                            if (_imageset.images[i]._id == scope.selectedImage._id) {
                                if (typeof scope.userDetails === 'string') {
                                    tag.user = JSON.parse(scope.userDetails).username;
                                    tag.userId = JSON.parse(scope.userDetails)._id;
                                } else {
                                    tag.user = scope.userDetails.username;
                                    tag.userId = scope.userDetails._id;
                                }

                                // Add Datapoints
                                if (tag.isNew) {
                                    _imageset.images[i].dataPoints.push(tag);
                                }
                                for (var j = 0; j < _imageset.images[i].dataPoints.length; j++) {
                                    if (_imageset.images[i].dataPoints[j]._id == tag._id) {
                                        if (isDelete) {
                                            scope.tags.splice(index, 1);
                                            var index1 = _imageset.images[i].dataPoints.indexOf(_imageset.images[i].dataPoints[j]);
                                            _imageset.images[i].dataPoints.splice(index1, 1);
                                            //removed ok from database, now remove in client
                                            //remove from canvas
                                            tag.shape.remove();
                                            scope.user.layer.draw();
                                        } else {
                                            _imageset.images[i].dataPoints[j] = tag;
                                        }
                                        break;
                                    }
                                }
                                break;
                            }
                        }

                        //Fixing internal server error on the api side
                        _imageset.id = _imageset._id;
                        delete _imageset._id;

                        // Put imagset to mongodb
                        $http.put('/tableControlApi/imagesets/' + _imageset.id, _imageset)
                            .success(function (result) {
                                scope.imageset = result.data;
                                if (tag.isNew) {
                                    for (var i = 0; i < scope.imageset.images.length; i++) {
                                        if (scope.imageset.images[i]._id == scope.selectedImage._id) {
                                            tag._id = scope.imageset.images[i].dataPoints[scope.imageset.images[i].dataPoints.length - 1]._id;
                                            break;
                                        }
                                    }
                                }
                                tag.isSelected = false;
                                tag.isNew = false;
                                tag.isUpdate = false;
                                tag.shape.attrs.stroke = 'black';
                                scope.user.layer.draw();
                                scope.selectedTag = null;

                                //Let the parent know that it has to update its record of the image set
                                scope.updateImagesetInfo = true;
                            });
                    };

                    //Set the first image in the imageset as the primary image
                    if (scope.record.images.length > 0 && angular.isUndefined(scope.selectedImage._id)) {
                        scope.setImageToGallery(scope.record.images[0]);
                    }
                });
                
                scope.$watch('userDetails', function () {
                    if (typeof scope.userDetails === 'string') {
                        scope.userDetails = JSON.parse(scope.userDetails);
                    }
                });
            }
        };
    }
]);
