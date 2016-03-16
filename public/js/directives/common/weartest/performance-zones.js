dashboardApp.directive('weartestPerformanceZones', ['$filter', 'notificationWindow',
function ($filter, notificationWindow) {
    'use strict';

    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/partials/restricted/common/weartest/performance-zones.html',
        controller: 'WeartestPerformanceZoneCtrl',
        link: function (scope, element, attrs) {

            //The width and height of the container
            var containerWidth = 534,
                containerHeight = 452,
                tooltipPointerHeight = 10,
                tooltipPointerWidth = 10;

            //Image or data points have changed. Redo the image canvas
            var redoCanvas = function () {
                scope.redrawCircle();

                //Update the data points of the existing primary image
                var dataPoints = scope.primaryImage.dataPoints.slice(0);

                var primaryImageCopy = {};

                primaryImageCopy = JSON.parse(JSON.stringify(scope.primaryImage));

                primaryImageCopy.dataPoints = [];

                for (var i = 0; i < dataPoints.length; i++) {
                    if (scope.customFilter(dataPoints[i])) {
                        primaryImageCopy.dataPoints.push(dataPoints[i]);
                    }
                }

                scope.setImageToGallery(primaryImageCopy);
            };

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
                        if (tooltipWidthRightFit <= containerWidth) {
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
                if (tooltipHeightBottomFit <= containerHeight) {
                    //Yes it does. Now check for the width
                    //The tooltip pointer will be at the center of the tooltip width.
                    //So, first check if the left half fits within the container
                    tooltipWidthLeftFit = pointXPosition - (tooltipWidth / 2);
                    //Check if the left section of the tooltips fit within the container
                    if (tooltipWidthLeftFit >= 0) {
                        //Yes it does. Now check for the right half
                        tooltipWidthRightFit = pointXPosition + (tooltipWidth / 2);
                        //Check if the right section of the tooltip fits within the container
                        if (tooltipWidthRightFit <= containerWidth) {
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
                        if (tooltipHeightBottomFit <= containerHeight) {
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
                if (tooltipWidthLeftFit <= containerWidth) {
                    //Yes it does - Now check for the height
                    //The tooltip pointer will be at the center of the tooltip height.
                    //So first check if the top half fits within the container
                    tooltipHeightTopFit = pointYPosition - (tooltipHeight / 2);
                    //Check if the top section of the tooltip fits within the container
                    if (tooltipHeightTopFit >= 0) {
                        //Yes it does - now check for the bottom half
                        tooltipHeightBottomFit = pointYPosition + (tooltipHeight / 2);
                        //Check if the bottom section of the tooltip fits within the container
                        if (tooltipHeightBottomFit <= containerHeight) {
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
                var tagUser = scope.getUserNameForId(selTag.userId);
                var tagDate = $filter('date')(selTag.createdDate, 'MM/dd/yy');
                var comment = angular.isUndefined(selTag.comment) ? "" : selTag.comment;

                scope.tooltipText.setText(tagUser + " - " + tagDate + "\n" + comment);

                var scaleX = angular.isUndefined(selTag.scaleX) ? 200 : selTag.scaleX;
                var scaleY = angular.isUndefined(selTag.scaleY) ? 200 : selTag.scaleY;
                var x = (selTag.x / scaleX) * containerWidth;
                var y = (selTag.y / scaleY) * containerHeight;

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

            //Performance Zone specific code.
            //We cannot use the existing code since this Performance Zone is for read only purposes
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
                if (angular.isUndefined(scope.user) && scope.productImages.length > 0) {

                    scope.selectedImage = {};

                    scope.circleId = 1;

                    scope.tags = [];

                    //define stage
                    scope.stage = new Kinetic.Stage({
                        container: 'container',
                        width: containerWidth,
                        height: containerHeight
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

                scope.circleId++;
                return circle;
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

            //set specific Image for datapoints
            scope.setImageToGallery = function (image) {
                scope.circleId = 1;

                // remove all Children
                scope.user.layer.removeChildren();
                scope.user.layer.draw();
                scope.selectedImage = image;
                scope.tags = [];

                scope.selectedImage.newUrl = $filter('getScaledImage')(image.url, containerWidth, containerHeight, 'c_fit');

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

            //Watch the change to the filters and / or main image
            scope.$watch(function () {
                return scope.filter.user + scope.filter.color + scope.primaryImage._id;
            }, function () {
                if (angular.isUndefined(scope.primaryImage._id)) {
                    return;
                }

                notificationWindow.show('Updating screen image...', false);

                scope.sortBy.limit = 5;

                redoCanvas();
            });

            //Since we use ng-if, ensure that the canvas is drawn only when the DOM is rendered (ng-if=true)
            scope.$watch(function () {
                return '' + scope.productImages.length + scope.userDetails._id;
            }, function () {
                if ((scope.productImages.length > 0) && scope.userDetails._id) {
                    redoCanvas();
                }
            });
        }
    };
}
]);
