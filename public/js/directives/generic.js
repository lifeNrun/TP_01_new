/**************************************************************
    This file contains the directives that are generic.
    These will be used across modules and will be attached
    to the main module. All directives which can be reused
    are located in this file.

    Module: wearTestWebApp
***************************************************************/

'use strict';

//jQuery UI Slider
app.directive('slider', function() {
    return {
        restrict: 'E',
        transclude: false,
        replace: true,
        scope: {
            value: '=',
            min:'=',
            max:'=',
            orientation:'=',
            size:'=',
            step: '='
        },
        controller: function ($scope, $element) {

            $scope.$watch('value', function(newVal, oldVal) {
                //if(newVal === oldVal) return;
                angular.element($element).slider({
                    value :parseInt($scope.value, 10)
                });
            });

            $scope.$watch('min', function(newVal, oldVal) {
                //if(newVal === oldVal) return;
                angular.element($element).slider({
                    min: parseInt($scope.min, 10)
                });
            });

            $scope.$watch('max', function(newVal, oldVal) {
                angular.element($element).slider({
                    max: parseInt($scope.max, 10)
                });
            });
        },
        link: function ($scope, $element, attr) {
            $element.slider({
                range: false,
                min: parseInt($scope.min, 10),
                max: parseInt($scope.max, 10),
                value: parseInt($scope.value, 10),
                orientation: $scope.orientation,
                step: parseInt($scope.step, 10),
                slide: function(event, ui) {
                    $scope.value = ui.value;
                    $scope.$apply();
                },
                change: function(event, ui) {
                    if (event.originalEvent) {
                        $scope.value = ui.value;
                        $scope.$apply();
                    }
                }
            });
            if ($scope.size && $scope.orientation === 'vertical') {
                $element.css('height',$scope.size);
            } else if ($scope.size && $scope.orientation !== 'vertical') {
                $element.css('width',$scope.size);
            }
        },
        template: '<div class="slider"></div>'
    };
});

//slider range
app.directive('sliderRange', function() {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            valueMin: '=',
            valueMax: '=',
            min:'=',
            max:'=',
            orientation:'=',
            step: '='
        },
        controller: function ($scope, $element) {
            
            $scope.$watch('valueMin', function(newVal, oldVal) {
                if((angular.isDefined($scope.slider) && angular.isDefined($scope.valueMin)) && angular.isDefined($scope.valueMax)){
                    $scope.slider.slider('setValue', [$scope.valueMin,$scope.valueMax]);
                }
            });
            $scope.$watch('valueMax', function(newVal, oldVal) {
                if((angular.isDefined($scope.slider) && angular.isDefined($scope.valueMin)) && angular.isDefined($scope.valueMax)){
                    $scope.slider.slider('setValue', [$scope.valueMin,$scope.valueMax]);
                }
            });
        },
        link: function ($scope, $element, attr) {
            var sliderDiv = angular.element(angular.element($element.children()[0]).children()[0]);
            $scope.slider = sliderDiv;
            var sliderVar = sliderDiv.slider({
                range: true,
                min: parseInt($scope.min, 10),
                max: parseInt($scope.max, 10),
                value: [50,60],
                orientation: $scope.orientation,
                step: $scope.step,
                tooltip: 'hide'
            });
            sliderVar.on('slideStop', function(ev) {
                $scope.valueMin = sliderVar.val()[0];
                $scope.valueMax = sliderVar.val()[1];
                $scope.$apply();
            });
        },
        template: '<div class="slider2">'+
                        '<div></div>'+
                    '</div>'
    };
});

//Generic slider based on Bootstrap Slider 
app.directive('genericSlider', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            value: '=',
            defaultValue: '=',
            min: '=',
            max: '=',
        },
        link: function (scope, iElement, iAttrs) {

            function adjustValue () {
                //Set the slider value
                //If value is provided, make use of it
                if (scope.value !== '' && !angular.isUndefined(scope.value)) {
                    angular.element(iElement).slider('setValue', parseInt(scope.value, 10));
                } else {
                    angular.element(iElement).slider('setValue', scope.defaultValue);
                }
            }
            
            if (!scope.defaultValue) {
                scope.defaultValue = 0;
            }

            scope.$watch('min', function () {
                bootstrapSlider = angular.element(iElement).setMinMax(parseInt(scope.min),parseInt(scope.max));
                adjustValue();
            });

            scope.$watch('max', function () {
                bootstrapSlider = angular.element(iElement).setMinMax(parseInt(scope.min),parseInt(scope.max));
                adjustValue();
            });

            scope.$watch('value', function () {
                bootstrapSlider = angular.element(iElement).slider('setValue', parseInt(scope.value));
            });

            scope.$watch('defaultValue', function () {
                adjustValue();
            });

            //Initialize the slider
            var bootstrapSlider = angular.element(iElement).slider({"min" : scope.min, "max" : scope.max}, scope.defaultValue, false);

            adjustValue();

            bootstrapSlider.on('slide', function(ev) {

                //We introduce a time out here since the event seems to be
                //raised even before the value is updated - we are thus left
                //with the old / previous value instead of the new value
                //The timeout is sufficent enough to get the new value
                $timeout(function () {
                    var val = angular.element(iElement).val();
                    scope.value = val;

                }, 500);
            });
        }
    };
}]);

//Bootstrap Slider
app.directive('bootstrapSlider', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            value: '='
        },
        link: function (scope, iElement, iAttrs) {
            //Initialize the slider
            var bootstrapSlider = angular.element(iElement).slider();

            //Get the type of the slider on which this directive is applied
            var type = angular.element(iElement).data('slider-field');
            var calculatedValue;

            switch (type) {
                case "intensityValue":
                    //Set the initial value. When the user returns to this 
                    //slider, the slider will contain the previously set 
                    //value since we read the scope
                    calculatedValue = parseInt(scope.$parent.logData.intensity, 10);
                    break;

                case "temperatureValue":
                    //The value stored in the scope is a calculated value
                    //We need to get the original value from it. Hence this arithmetic
                    calculatedValue = parseInt(scope.$parent.logData.temperature, 10);
                    calculatedValue = ((calculatedValue + 10) / -1) + 100;
                    break;

                case "heightValue":
                    //Calculate the value stored in the answer. If none found
                    //then set the default value
                    var answer = scope.$parent.question.answer;
                    if (!angular.isUndefined(answer) && !angular.isUndefined(answer["heightValue"])) {
                        calculatedValue = parseInt(answer.heightValue, 10);
                    } else if (!angular.isUndefined(answer) && !angular.isUndefined(answer.value)) {

                        //Value is stored in inches
                        //Get feet value
                        calculatedValue = Math.floor(parseInt(answer.value, 10) / 12);
                        scope.$parent.question.answer.heightValue = calculatedValue;

                        //Get inches value after removing feet value
                        //Assumes default value is always inches and is not
                        //floating point
                        scope.$parent.question.answer.heightInchValue = (parseInt(answer.value, 10) % 12);
                    } else {
                        //Initialize the answer object to store the height and
                        //inch values
                        scope.$parent.question.answer = {};

                        //Get feet value
                        calculatedValue = Math.floor(parseInt(scope.$parent.question.options.defaultValue, 10) / 12);
                        scope.$parent.question.answer.heightValue = calculatedValue;

                        //Get inches value after removing feet value
                        //Assumes default value is always inches and is not
                        //floating point
                        scope.$parent.question.answer.heightInchValue = (parseInt(scope.$parent.question.options.defaultValue, 10) % 12);
                    }

                    //Since the vertical slider has the minimum value at 
                    //the top, we need to calculate accordingly
                    calculatedValue = calculatedValue + (scope.$parent.question.answer.heightInchValue * 0.08);

                    for (var i = 3; i < calculatedValue; i = i + 0.08) {
                        if ((calculatedValue - i) === 0) {
                            break;
                        } else if ((calculatedValue - i) < 0.08) {
                            calculatedValue = i;
                            break;
                        } else {
                            continue;
                        }
                    }

                    calculatedValue = 5.48 - (calculatedValue - 5.48);
                    break;

                case "weightValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        calculatedValue = parseInt(scope.$parent.question.answer.value, 10);
                    } else {
                        calculatedValue = parseInt(scope.$parent.question.options.defaultValue, 10);
                    }
                    break;

                case "sleeveValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        calculatedValue = parseInt(scope.$parent.question.answer.value, 10);
                    } else {
                        calculatedValue = parseInt(scope.$parent.question.question.defaultValue, 10);
                    }

                    //Correction factor
                    calculatedValue = 34 - (calculatedValue - 34);
                    break;

                case "shoesValue":
                case "runningShoesValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        calculatedValue = scope.$parent.question.answer.value;
                    } else {
                        if (angular.isUndefined(scope.$parent.question.options.defaultValue)) {
                            calculatedValue = 10;
                        } else {
                            calculatedValue = scope.$parent.question.options.defaultValue;
                        }
                    }
                    break;

                case "shoeWidthValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        calculatedValue = parseInt(scope.$parent.question.answer.value, 10);
                    } else {
                        if (angular.isUndefined(scope.$parent.question.options.defaultValue)) {
                            calculatedValue = 3.25;
                        } else {
                            calculatedValue = parseInt(scope.$parent.question.options.defaultValue, 10);
                        }
                    }
                    break;

                case "shirtValue":
                case "jacketValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        calculatedValue = scope.$parent.question.answer.value;
                    } else {
                        if (angular.isUndefined(scope.$parent.question.options.defaultValue)) {
                            calculatedValue = "xs";
                        } else {
                            calculatedValue = scope.$parent.question.options.defaultValue;
                        }
                    }

                    //Change value to numeric format
                    switch (calculatedValue) {
                        case "s":
                            calculatedValue = 3;
                            break;

                        case "m":
                            calculatedValue = 4;
                            break;

                        case "l":
                            calculatedValue = 5;
                            break;

                        case "xl":
                            calculatedValue = 6;
                            break;

                        case "twoxl":
                            calculatedValue = 7;
                            break;

                        case "threexl":
                            calculatedValue = 8;
                            break;

                        case "fourxl":
                            calculatedValue = 9;
                            break;

                        default:
                            calculatedValue = 1;
                            break;
                    }
                    break;

                case "pantsInseamValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        if (!angular.isUndefined(scope.$parent.question.answer.inseamLength)) {
                            calculatedValue = parseInt(scope.$parent.question.answer.inseamLength, 10);
                        } else {
                            calculatedValue = 32;
                            scope.$parent.question.answer.inseamLength = 32;
                        }
                    } else {
                        calculatedValue = 32;
                        scope.$parent.question.answer = {};
                        scope.$parent.question.answer.inseamLength = 32;
                    }

                    //Correction factor since this is a vertical slider

                    calculatedValue = 32 - (calculatedValue - 30);

                    break;

                case "pantsWaistValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        if (!angular.isUndefined(scope.$parent.question.answer.waistMeasurement)) {
                            calculatedValue = parseInt(scope.$parent.question.answer.waistMeasurement, 10);
                        } else if (!angular.isUndefined(scope.$parent.question.answer.value)) {
                            calculatedValue = scope.$parent.question.answer.value;
                            scope.$parent.question.answer.waistMeasurement = calculatedValue;
                        } else {
                            calculatedValue = 32;
                            scope.$parent.question.answer.waistMeasurement = 32;
                            scope.$parent.question.answer.value = 32;
                        }
                    } else {
                        calculatedValue = 32;
                        scope.$parent.question.answer = {};
                        scope.$parent.question.answer.waistMeasurement = 32;
                    }
                    break;

                case "neckSizeValue":
                case "bicepSizeValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        if (!angular.isUndefined(scope.$parent.question.answer.value)) {
                            calculatedValue = parseInt(scope.$parent.question.answer.value, 10);
                        } else {
                            calculatedValue = 18;
                            scope.$parent.question.answer.value = calculatedValue;
                        }
                    } else {
                        calculatedValue = 18;

                        scope.$parent.question.answer = {};
                        scope.$parent.question.answer.value = calculatedValue;
                    }
                    break;

                case "bustValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        if (!angular.isUndefined(scope.$parent.question.answer.value)) {
                            calculatedValue = parseInt(scope.$parent.question.answer.value, 10);
                        } else {
                            calculatedValue = 34;
                            scope.$parent.question.answer.value = calculatedValue;
                        }
                    } else {
                        calculatedValue = 34;

                        scope.$parent.question.answer = {};
                        scope.$parent.question.answer.value = calculatedValue;
                    }
                    break;

                case "seatValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        if (!angular.isUndefined(scope.$parent.question.answer.value)) {
                            calculatedValue = parseInt(scope.$parent.question.answer.value, 10);
                        } else {
                            calculatedValue = 36;
                            scope.$parent.question.answer.value = calculatedValue;
                        }
                    } else {
                        calculatedValue = 36;

                        scope.$parent.question.answer = {};
                        scope.$parent.question.answer.value = calculatedValue;
                    }
                    break;

                case "chestSizeValue":
                case "thighSizeValue":
                case "shoulderValue":
                    if (!angular.isUndefined(scope.$parent.question.answer)) {
                        if (!angular.isUndefined(scope.$parent.question.answer.value)) {
                            calculatedValue = parseInt(scope.$parent.question.answer.value, 10);
                        } else {
                            calculatedValue = 24;
                            scope.$parent.question.answer.value = calculatedValue;
                        }
                    } else {
                        calculatedValue = 24;

                        scope.$parent.question.answer = {};
                        scope.$parent.question.answer.value = calculatedValue;
                    }
                    break;

                case "gloveValue":
                    if (angular.isUndefined(scope.$parent.question.answer)) {
                        calculatedValue = "s";
                        scope.$parent.question.answer = {};
                        scope.$parent.question.answer.value = calculatedValue;
                    } else if (angular.isUndefined(scope.$parent.question.answer.value)) {
                        calculatedValue = "s";
                        scope.$parent.question.answer.value = calculatedValue;
                    } else {
                        calculatedValue = scope.$parent.question.answer.value;
                    }

                    switch (calculatedValue) {
                        case "m":
                            calculatedValue = 7.5;
                            break;
                        case "l":
                            calculatedValue = 8;
                            break;
                        case "xl":
                            calculatedValue = 9;
                            break;
                        default:
                            calculatedValue = 7;
                            break;
                    }
                    scope.$parent.gloveSizeValue  = calculatedValue;
                    break;
                case "genericSlider":
                    scope.$parent.question.answer.value = parseInt(scope.$parent.question.answer.value, 10);
                break;

                default:
                    break;
            }

            //Set the slider value
            angular.element(iElement).slider('setValue', calculatedValue);

            bootstrapSlider.on('slide', function(ev) {
                var val,
                    inches, readOnlyValue;

                //We introduce a time out here since the event seems to be
                //raised even before the value is updated - we are thus left
                //with the old / previous value instead of the new value
                //The timeout is sufficent enough to get the new value
                $timeout(function () {
                    val = angular.element(iElement).val();

                    switch (type) {
                        case "temperatureValue":
                            val = ((-100 + val) * -1) - 10;
                            angular.element("#temperatureValue").val(val);
                            scope.$parent.logData.temperature = val;
                            break;

                        case "intensityValue":
                            scope.$parent.logData.intensity = val;
                            break;

                        case "heightValue":
                            //Since the minimum value in the slider
                            //lies at the top (of a vertical slider),
                            //we need to convert the received value
                            val = 5.48 + (5.48 - val);

                            //Truncate the value to two digits and get only 
                            //the number of inches from the value
                            inches = Math.ceil(((Math.round(val * 100) / 100) % 1) * 100 / 8);

                            //Check if the inches exceed 12 inches
                            if (inches >= 12) {
                                //Yes, it does.
                                //In such a case move over to the next feet
                                val = Math.floor(val) + 1;
                                inches = 0;
                            } else {
                                val = Math.floor(val);
                            }

                            //Set the value on the model
                            scope.$parent.question.answer.heightValue = val;
                            scope.$parent.question.answer.heightInchValue = inches;
                            break;

                        case "weightValue":
                            //Set the value on the model
                            scope.$parent.question.answer.value = val;
                            break;

                        case "sleeveValue":
                            //Set the value on the model
                            scope.$parent.question.answer.value = 34 + (34 - val);
                            break;

                        case "shoesValue":
                        case "runningShoesValue":
                            //Set the value on the model
                            scope.$parent.question.answer.value = val;
                            break;

                        case "shoeWidthValue":
                            //Set the value on the model
                            scope.$parent.question.answer.value = (val).toFixed(2);
                            break;

                        case "shirtValue":
                        case "jacketValue":
                            switch (val) {
                                case 3:
                                    scope.$parent.question.answer.value = 's';
                                    break;
                                case 4:
                                    scope.$parent.question.answer.value = 'm';
                                    break;
                                case 5:
                                    scope.$parent.question.answer.value = 'l';
                                    break;
                                case 6:
                                    scope.$parent.question.answer.value = 'xl';
                                    break;
                                case 7:
                                    scope.$parent.question.answer.value = 'twoxl';
                                    break;
                                case 8:
                                    scope.$parent.question.answer.value = 'threexl';
                                    break;
                                case 9:
                                case 10:
                                    scope.$parent.question.answer.value = 'fourxl';
                                    break;
                                default:
                                    scope.$parent.question.answer.value = 'xs';
                            }
                            break;

                        case "pantsInseamValue":

                            scope.$parent.question.answer.inseamLength = 32 + (30 - val);

                            break;

                        case "pantsWaistValue":
                            scope.$parent.question.answer.waistMeasurement = val;
                            scope.$parent.question.answer.value = val;
                            break;

                        case "gloveValue":
                            switch (val) {
                                case 7.5:
                                    scope.$parent.question.answer.value = 'm';
                                    break;
                                case 8:
                                    scope.$parent.question.answer.value = 'l';
                                    break;
                                case 8.5:
                                case 9:
                                    scope.$parent.question.answer.value = 'xl';
                                    break;
                                default:
                                    scope.$parent.question.answer.value = 's';
                            }
                            scope.$parent.gloveSizeValue = val;
                            break;

                        case "bustValue":
                        case "thighSizeValue":
                        case "seatValue":
                        case "shoulderValue":
                        case "bicepSizeValue":
                        case "chestSizeValue":
                            scope.$parent.question.answer.value = val;
                            break;

                        case "neckSizeValue":
                            //Set the value on the model
                            scope.$parent.question.answer.value = (val).toFixed(1);
                            break;

                        case "genericSlider":
                            scope.$parent.question.answer.value = val;
                            break;

                        default:
                            scope.value = val;
                            break;
                    }
                }, 500);
            });
        }
    };
}]);

//Bootstrap Carousel
app.directive('bootstrapCarousel', function () {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttr) {
            angular.element(iElement).carousel({
                interval: 10000
            });
        }
    };
});

//jQuery Chart
app.directive('jqueryChart', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttr) {
            //Initialize the chart
            angular.element(iElement).easyPieChart({
                barColor: '#f1672e',
                trackColor:'#ced1d3',
                scaleColor: false,
                size: 128,
                animate: 3000,
                lineWidth: 15,
                lineCap: 'butt'
            });

            //If there is a completion property in the scope, keep an 
            //eye over it and update it when needed
            scope.$watch('completed', function () {
                //Update only if the scope has a "completed" property
                if (angular.isUndefined(scope.completed)) {
                    return;
                }

                if (angular.isArray(scope.completed)) {
                    var id = '#chart' + iAttr.index,
                        value = iAttr.percent;

                    angular.element(id).data('easyPieChart').update(value);
                } else {
                    angular.element(iElement).data('easyPieChart').update(scope.completed);
                }
            }, true);
        }
    };
}]);

//Lite Carousel
app.directive('liteCarousel', function () {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttr) {
            angular.element(iElement).jCarouselLite({
                auto: 2000,
                speed: 1000
            });
        }
    };
});

/* directives to detect leaving input field*/
app.directive('onBlur', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            elm.bind('blur', function() {
                scope.$apply(attrs.onBlur);
            });
        }
    };
});

//Common Footer across pages
app.directive('pageFooter', [function () {
    return {
        restrict: 'E',
        templateUrl: '/partials/page-footer.html'
    };
}]);

//Horizontal Bar Chart

app.directive('horizontalBarChart', [function () {
    return {
        restrict: 'E',
        scope: {
            chartData: '@',
            index: '=',
            absUrl: '@'
        },
        link: function (scope, iElement, iAttr) {

            //Define the canvas - within this we draw the chart
            var element = d3.select(iElement[0]);
            var canvas,
                absUrl = scope.absUrl;

            scope.$watch('chartData', function () {


                if (angular.isUndefined(scope.chartData)) {
                    return;
                } else if (typeof scope.chartData === 'string' && !scope.chartData.empty) {
                    scope.barChartData = JSON.parse(scope.chartData);
                } else {
                    scope.barChartData = JSON.parse(JSON.stringify(scope.chartData));
                }

                //Ensure that we have something to proceed with the chart
                if (angular.isUndefined(scope.barChartData.data) || scope.barChartData.data.length == 0 || angular.isUndefined(scope.barChartData.domain)) {
                    return;
                }

                //Initialize
                var tempData = scope.barChartData.data.slice(0),
                    domain = scope.barChartData.domain.slice(0),
                    data = [],
                    xAxisVal;

                var  dataTemp = {},
                     labelsTemp = [],
                     seriesTemp = [],
                     versions = {},
                     versionValues = [],
                     dataExist = false;

                for (var i=0; i< scope.barChartData.data.length; i++) {
                     labelsTemp.push( scope.barChartData.data[i]);
                }
                 dataTemp.labels =  labelsTemp;

                //Rating
                for (var i=0; i< scope.barChartData.data.length; i++) {
                  if( scope.barChartData.data[i] > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data[i]);
                }
                if (dataExist) {
                    versions = {
                        label: versionValues,
                        values: versionValues,
                        color: "#orange"
                      }
                    seriesTemp.push(versions);
                }

                dataTemp.series =  seriesTemp;

                data =  dataTemp;
                var chartWidth       = 600,
                    barHeight        = 20,
                    groupHeight      = barHeight * data.series.length,
                    gapBetweenGroups = 10,
                    spaceForLabels   = 50,
                    spaceForLegend   = 150,
                    gradId,
                    startOrangeColor = ["#F7923C"],
                    endOrangeColor = ["#F15937"];

                // Zip the series data together (first values, second values, etc.)
                var zippedData = [];

                var gradColor = [];
                for (var i=0; i<data.labels.length; i++) {
                  for (var j=0; j<data.series.length; j++) {
                    zippedData.push(data.series[j].values[i]);
                  }
                }

                // Color scale
                //var color = d3.scale.category20();
                var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

                var y = d3.scale.linear()
                    .domain([0,domain[1]])
                    .range([0, chartWidth + gapBetweenGroups]);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickFormat(function(d) { return d; })
                    .tickSize(-chartHeight + gapBetweenGroups-45)
                    .orient("bottom");

                // Specify the chart area and dimensions

                var chart = element
                    .append("svg:svg")
                    .attr("width", spaceForLabels + chartWidth + spaceForLegend)
                    .attr("height", chartHeight+75);

                gradId = 'orange';
                setGrandientColor(chart,gradId, startOrangeColor, endOrangeColor);

                // Create bars
                var bar = chart.selectAll("g")
                    .data(zippedData)
                    .enter().append("g")
                    .attr("transform", function(d, i) {
                      return "translate(" + (spaceForLabels+100) + "," + ((i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length)))+40) + ")";
                    });

                // Create rectangles of the correct width
                bar.append("rect")
                    .attr("fill", 'url('+absUrl+'#orange)')
                    .attr("rx", "4") // for edge moulding
                    .attr("ry", "4") // for edge moulding
                    .attr("class", "bar")
                    .attr("width", function(d){
                                        var w = y(d);
                                        if(w >= 0){
                                        return w;
                                        } else
                                          {
                                            return 0;
                                          }
                                      })
                    .attr("height", barHeight + 13);

                // Draw labels

                bar.append("text")
                    .attr("class", "rpt-alt2")
                    .attr("x", function(d) { return - 70; })
                    .attr("y", groupHeight / 2)
                    .attr("dy", ".35em")
                    .text(function(d,i) {
                      if (i % data.series.length === 0)
                        return data.labels[Math.floor(i/data.series.length)];
                      else
                        return ""});

                chart.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(" + (spaceForLabels+100) + ", " + (chartHeight+65) + ")")
                      .call(yAxis);
                xAxisVal =  chart.selectAll(".tick");
                                        xAxisVal.selectAll("text").attr("y", -chartHeight + gapBetweenGroups-65)
                                                                  .attr("id", "xAxisText");

                function setGrandientColor(canvas, gradId, startColor, endColor) {
                                                var gradient = canvas.append("svg:defs")
                                                .append("svg:linearGradient")
                                                .attr("id", gradId)
                                                .attr("x1", "50%")
                                                .attr("y1", "0%")
                                                .attr("x2", "50%")
                                                .attr("y2", "100%")
                                                .attr("spreadMethod", "pad");

                                                gradient.append("svg:stop")
                                                .attr("offset", "0%")
                                                .attr("stop-color", startColor[0])
                                                .attr("stop-opacity", 1);

                                                gradient.append("svg:stop")
                                                .attr("offset", "100%")
                                                .attr("stop-color", endColor[0])
                                                .attr("stop-opacity", 1);
                                    }
            });
        }
    };
}]);

//Horizontal Bar Chart
app.directive('ratingGroupBarChart', [function () {
    return {
        restrict: 'E',
        scope: {
            chartData: '@',
            index: '=',
            absUrl: '@'
        },
        link: function (scope, iElement, iAttr) {

            //Define the canvas - within this we draw the chart
            var element = d3.select(iElement[0]);
            var canvas,
                absUrl = scope.absUrl;

            scope.$watch('chartData', function () {


                if (angular.isUndefined(scope.chartData)) {
                    return;
                } else if (typeof scope.chartData === 'string' && !scope.chartData.empty) {
                    scope.barChartData = JSON.parse(scope.chartData);
                } else {
                    scope.barChartData = JSON.parse(JSON.stringify(scope.chartData));
                }

                //Ensure that we have something to proceed with the chart
                if (angular.isUndefined(scope.barChartData.data) || scope.barChartData.data.length == 0 || angular.isUndefined(scope.barChartData.domain)) {
                    return;
                }

                //Initialize
                var tempData = scope.barChartData.data.slice(0),
                    domain = scope.barChartData.domain.slice(0),
                    data = [],
                    xAxisVal;

                var  dataTemp = {},
                     labelsTemp = [],
                     seriesTemp = [],
                     versions = {},
                     versionValues = [],
                     dataExist = false;

                for (var i=0; i< scope.barChartData.data.length; i++) {
                     labelsTemp.push( scope.barChartData.data[i].key);
                }
                 dataTemp.labels =  labelsTemp;

                //Rating
                for (var i=0; i< scope.barChartData.data.length; i++) {
                  if( scope.barChartData.data[i].value > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data[i].value);
                }
                if (dataExist) {
                    versions = {
                        label: 'RatingGroup',
                        values: versionValues,
                        color: "#orange"
                      }
                    seriesTemp.push(versions);
                }

                dataTemp.series =  seriesTemp;

                data =  dataTemp;
                var chartWidth       = 600,
                    barHeight        = 20,
                    groupHeight      = barHeight * data.series.length,
                    gapBetweenGroups = 10,
                    spaceForLabels   = 50,
                    spaceForLegend   = 150,
                    gradId,
                    startRedColor = ["#EE162D"],
                    endRedColor = ["#71000F"],
                    startGreenColor = ["#56B959"],
                    endGreenColor = ["#00683D"],
                    startYellowColor = ["#FFEE4B"],
                    endYellowColor = ["#B7872F"];

                // Zip the series data together (first values, second values, etc.)
                var zippedData = [];

                var gradColor = [];
                for (var i=0; i<data.labels.length; i++) {
                  for (var j=0; j<data.series.length; j++) {
                    zippedData.push(data.series[j].values[i]);
                  }
                }

                // Color scale
                //var color = d3.scale.category20();
                var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

                var y = d3.scale.linear()
                    .domain(domain)
                    .range([0, chartWidth + gapBetweenGroups]);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickFormat(function(d) { return d; })
                    .tickSize(-chartHeight + gapBetweenGroups-15)
                    .orient("bottom");

                // Specify the chart area and dimensions

                var chart = element
                    .append("svg:svg")
                    .attr("width", spaceForLabels + chartWidth + spaceForLegend)
                    .attr("height", chartHeight+70);

                gradId = 'red';
                setGrandientColor(chart,gradId, startRedColor, endRedColor);
                gradId = 'green';
                setGrandientColor(chart,gradId, startGreenColor, endGreenColor);
                gradId = 'yellow';
                setGrandientColor(chart,gradId, startYellowColor, endYellowColor);

                // Create bars
                var bar = chart.selectAll("g")
                    .data(zippedData)
                    .enter().append("g")
                    .attr("transform", function(d, i) {
                      return "translate(" + (spaceForLabels+130) + "," + ((i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length)))+25) + ")";
                    });

                // Create rectangles of the correct width
                bar.append("rect")
                    .attr("fill", function(d,i) {
                            if(d <= 2.5 ){
                                return 'url('+absUrl+'#red)';
                                }
                            if(d > 2.5 && d < 3.25 ){
                                return 'url('+absUrl+'#yellow)';
                                }
                            if(d >= 3.25 ){
                                return 'url('+absUrl+'#green)';
                                }
                    })
                    .attr("rx", "4") // for edge moulding
                    .attr("ry", "4") // for edge moulding
                    .attr("class", "bar")
                    .attr("width", function(d){
                                        var w = y(d);
                                        if(w >= 0){
                                        return w;
                                        } else
                                          {
                                            return 0;
                                          }
                                      })
                    .attr("height", barHeight - 1);

                // Draw labels

                bar.append("text")
                    .attr("class", "rpt-alt2")
                    .attr("x", function(d) { return - 150; })
                    .attr("y", groupHeight / 2)
                    .attr("dy", ".35em")
                    .text(function(d,i) {
                      if (i % data.series.length === 0)
                        return data.labels[Math.floor(i/data.series.length)];
                      else
                        return ""});

                bar.append("text")
                    .attr("class", "rpt-alt2")
                    .attr("x", function(d) { return y(d) - 50; })
                    .attr("y", barHeight / 2)
                    .attr("fill", "white")
                    .attr("dy", ".35em")
                    .text(function(d) { return d; });

                chart.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(" + (spaceForLabels+130) + ", " + (chartHeight+30) + ")")
                      .call(yAxis);
                xAxisVal =  chart.selectAll(".tick");
                                        xAxisVal.selectAll("text").attr("y", -chartHeight + gapBetweenGroups-35)
                                                                  .attr("id", "xAxisText");
                // Draw legend
                var legendRectSize = 18,
                    legendSpacing  = 4,
                    legendData = {},
                    seriesTemp = [],
                    versions = {};

                versions = {
                    label: '0.0 - 2.5',
                    color: "#red"
                };
                seriesTemp.push(versions);

                versions = {
                    label: '2.51 - 3.24',
                    color: "#yellow"
                };
                seriesTemp.push(versions);
                versions = {
                    label: '3.25 - 5.0',
                    color: "#green"
                };
                seriesTemp.push(versions);
                legendData.series =  seriesTemp;

                var legend = chart.selectAll('.legend')
                    .data(legendData.series)
                    .enter()
                    .append('g')
                    .attr('transform', function (d, i) {
                        var height = legendRectSize + legendSpacing;
                        var offset = gapBetweenGroups/2;
                        var horz =  legendSpacing + chartHeight + legendRectSize+20;
                        var vert = (i * height + offset) + 280;
                        if(i >0){
                          vert = vert  + (i*95);
                        }
                        return 'translate(' + vert + ',' + horz + ')';
                    });

                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', function (d, i) {
                      return 'url('+absUrl+d.color+')'; })
                    .style('stroke', function (d, i) { return 'url('+absUrl+d.color+')'; });

                legend.append('text')
                    .attr('class', 'legend')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    .text(function (d) { return d.label; });


                function setGrandientColor(canvas, gradId, startColor, endColor) {
                                                var gradient = canvas.append("svg:defs")
                                                .append("svg:linearGradient")
                                                .attr("id", gradId)
                                                .attr("x1", "50%")
                                                .attr("y1", "0%")
                                                .attr("x2", "50%")
                                                .attr("y2", "100%")
                                                .attr("spreadMethod", "pad");

                                                gradient.append("svg:stop")
                                                .attr("offset", "0%")
                                                .attr("stop-color", startColor[0])
                                                .attr("stop-opacity", 1);

                                                gradient.append("svg:stop")
                                                .attr("offset", "100%")
                                                .attr("stop-color", endColor[0])
                                                .attr("stop-opacity", 1);
                                    }
            });
        }
    };
}]);

app.directive('initFinalBarChart', [function () {
    return {
        restrict: 'E',
        scope: {
            chartData: '@',
            index: '=',
            absUrl: '@'
        },
        link: function (scope, iElement, iAttr) {

            //Define the canvas - within this we draw the chart
            var element = d3.select(iElement[0]);
            var canvas,
                absUrl = scope.absUrl;

            scope.$watch('chartData', function () {


                if (angular.isUndefined(scope.chartData)) {
                    return;
                } else if (typeof scope.chartData === 'string' && !scope.chartData.empty) {
                    scope.barChartData = JSON.parse(scope.chartData);
                } else {
                    scope.barChartData = JSON.parse(JSON.stringify(scope.chartData));
                }

                //Ensure that we have something to proceed with the chart
                if (angular.isUndefined(scope.barChartData.data) || scope.barChartData.data.length == 0 || angular.isUndefined(scope.barChartData.domain)) {
                    return;
                }

                //Initialize
                var tempData = scope.barChartData.data.slice(0),
                    domain = scope.barChartData.domain.slice(0),
                    data = [],
                    xAxisVal;

                var  dataTemp = {},
                     labelsTemp = [],
                     seriesTemp = [],
                     versions = {},
                     versionValues = [],
                     dataExist = false;

                for (var i=0; i< scope.barChartData.data.length; i++) {
                     labelsTemp.push( scope.barChartData.data[i].key);
                }
                dataTemp.labels =  labelsTemp;


                //Initial
                for (var i=0; i< scope.barChartData.data.length; i++) {
                  if( scope.barChartData.data[i].value > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data[i].value);
                }

                if (dataExist) {
                versions = {
                    label: 'Initial',
                    values: versionValues,
                    color: "#orange"
                  }
                   seriesTemp.push(versions);
                }
                  //Final
                versionValues = [];
                dataExist = false;
                for (var i=0; i< scope.barChartData.data1.length; i++) {
                  if( scope.barChartData.data1[i].value > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data1[i].value);
                }
                 if(dataExist) {
                  versions = {
                    label: 'Final',
                    values: versionValues,
                    color: "#lightgrey"
                  }
                   seriesTemp.push(versions);
                 }

                dataTemp.series =  seriesTemp;


                data =  dataTemp;
                var chartWidth       = 600,
                    barHeight        = 20,
                    groupHeight      = barHeight * data.series.length,
                    gapBetweenGroups = 10,
                    spaceForLabels   = 50,
                    spaceForLegend   = 150,
                    gradId,
                    startOrangeColor = ["#F7923C"],
                    endOrangeColor = ["#F15937"],
                    startLightGreyColor = ["#D1D3D4"],
                    endLightGreyColor = ["#808284"];

                // Zip the series data together (first values, second values, etc.)
                var zippedData = [];
                var clrIdx = 0;
                var gradColor = [];
                for (var i=0; i<data.labels.length; i++) {
                  for (var j=0; j<data.series.length; j++) {
                    gradColor.push(addColor(data.series[j].label));
                    zippedData.push(data.series[j].values[i]);
                  }
                }

                // Color scale
                var color = d3.scale.category20();
                var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

                var y = d3.scale.linear()
                    .domain(domain)
                    .range([0, chartWidth + gapBetweenGroups]);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickFormat(function(d) { return d; })
                    .tickSize(-chartHeight + gapBetweenGroups-15)
                    .orient("bottom");

                // Specify the chart area and dimensions

                var chart = element
                    .append("svg:svg")
                    .attr("width", spaceForLabels + chartWidth + spaceForLegend)
                    .attr("height", chartHeight+75);

                gradId = 'orange';
                setGrandientColor(chart,gradId, startOrangeColor, endOrangeColor);
                gradId = 'lightgrey'; setGrandientColor(chart,gradId, startLightGreyColor, endLightGreyColor);

                // Create bars
                var bar = chart.selectAll("g")
                    .data(zippedData)
                    .enter().append("g")
                    .attr("transform", function(d, i) {
                      return "translate(" + (spaceForLabels+130) + "," + ((i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length)))+25) + ")";
                    });

                // Create rectangles of the correct width
                bar.append("rect")
                    .attr("fill", function(d,i) {
                    return "url("+absUrl+gradColor[i]+")"; })
                    .attr("rx", "4") // for edge moulding
                    .attr("ry", "4") // for edge moulding
                    .attr("class", "bar")
                    .attr("width", function(d){
                                        var w = y(d);
                                        if(w >= 0){
                                        return w;
                                        } else
                                          {
                                            return 0;
                                          }
                                      })
                    .attr("height", barHeight - 1);

                // Draw labels

                bar.append("text")
                    .attr("class", "rpt-alt2")
                    .attr("x", function(d) { return - 150; })
                    .attr("y", groupHeight / 2)
                    .attr("dy", ".35em")
                    .text(function(d,i) {
                      if (i % data.series.length === 0)
                        return data.labels[Math.floor(i/data.series.length)];
                      else
                        return ""});

                bar.append("text")
                    .attr("class", "rpt-alt2")
                    .attr("x", function(d) { return y(d) - 50; })
                    .attr("y", barHeight / 2)
                    .attr("fill", "white")
                    .attr("dy", ".35em")
                    .text(function(d) { return d; });

                chart.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(" + (spaceForLabels+130) + ", " + (chartHeight+30) + ")")
                      .call(yAxis);
                xAxisVal =  chart.selectAll(".tick");
                                        xAxisVal.selectAll("text").attr("y", -chartHeight + gapBetweenGroups-35)
                                                                  .attr("id", "xAxisText");

                // Draw legend
                var legendRectSize = 18,
                    legendSpacing  = 4;

                var legend = chart.selectAll('.legend')
                    .data(data.series)
                    .enter()
                    .append('g')
                    .attr('transform', function (d, i) {
                        var height = legendRectSize + legendSpacing;
                        var offset = gapBetweenGroups/2;
                        var horz =  legendSpacing + chartHeight + legendRectSize+35;
                        var vert = (i * height + offset) + 280;
                        if(i >0){
                          vert = vert  + (i*80);
                        }
                        return 'translate(' + vert + ',' + horz + ')';
                    });

                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', function (d, i) {
                      return 'url('+absUrl+d.color+')'; })
                    .style('stroke', function (d, i) { return 'url('+absUrl+d.color+')'; });

                legend.append('text')
                    .attr('class', 'legend')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    .text(function (d) { return d.label; });

                function setGrandientColor(canvas, gradId, startColor, endColor) {
                                                var gradient = canvas.append("svg:defs")
                                                .append("svg:linearGradient")
                                                .attr("id", gradId)
                                                .attr("x1", "50%")
                                                .attr("y1", "0%")
                                                .attr("x2", "50%")
                                                .attr("y2", "100%")
                                                .attr("spreadMethod", "pad");

                                                gradient.append("svg:stop")
                                                .attr("offset", "0%")
                                                .attr("stop-color", startColor[0])
                                                .attr("stop-opacity", 1);

                                                gradient.append("svg:stop")
                                                .attr("offset", "100%")
                                                .attr("stop-color", endColor[0])
                                                .attr("stop-opacity", 1);
                                    }

                function addColor(version) {
                  if(version === 'Initial') {
                    return '#orange';
                  }
                  if(version === 'Final') {
                    return '#lightgrey';
                  }
                }
            });
        }
    };
}]);

app.directive('versionBarChart', [function () {
    return {
        restrict: 'E',
        scope: {
            chartData: '@',
            index: '=',
            absUrl: '@'
        },
        link: function (scope, iElement, iAttr) {

            //Define the canvas - within this we draw the chart
            var element = d3.select(iElement[0]);
            var canvas,
                absUrl = scope.absUrl;

            scope.$watch('chartData', function () {


                if (angular.isUndefined(scope.chartData)) {
                    return;
                } else if (typeof scope.chartData === 'string' && !scope.chartData.empty) {
                    scope.barChartData = JSON.parse(scope.chartData);
                } else {
                    scope.barChartData = JSON.parse(JSON.stringify(scope.chartData));
                }

                //Ensure that we have something to proceed with the chart
                if (angular.isUndefined(scope.barChartData.data) || scope.barChartData.data.length == 0 || angular.isUndefined(scope.barChartData.domain)) {
                    return;
                }

                //Initialize
                var tempData = scope.barChartData.data.slice(0),
                    domain = scope.barChartData.domain.slice(0),
                    data = [],
                    xAxisVal;

                var  dataTemp = {},
                     labelsTemp = [],
                     seriesTemp = [],
                     versions = {},
                     versionValues = [],
                     dataExist = false;

                for (var i=0; i< scope.barChartData.data.length; i++) {
                     labelsTemp.push( scope.barChartData.data[i].key);
                }
                 dataTemp.labels =  labelsTemp;


                //A
                for (var i=0; i< scope.barChartData.data.length; i++) {
                  if( scope.barChartData.data[i].value > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data[i].value);
                }
                if (dataExist) {
                    versions = {
                        label: 'A',
                        values: versionValues,
                        color: "#blue"
                      }
                    seriesTemp.push(versions);
                }

                //B
                versionValues = [];
                dataExist = false;
                for (var i=0; i< scope.barChartData.data1.length; i++) {
                  if( scope.barChartData.data1[i].value > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data1[i].value);
                }
                 if(dataExist) {
                  versions = {
                    label: 'B',
                    values: versionValues,
                    color: "#darkgrey"
                  }
                   seriesTemp.push(versions);
                 }

                //C
                versionValues = [];
                dataExist = false;
                for (var i=0; i< scope.barChartData.data2.length; i++) {
                  if( scope.barChartData.data2[i].value > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data2[i].value);
                }

                if(dataExist) {
                  versions = {
                    label: 'C',
                    values: versionValues,
                    color: "#purple"
                  }
                   seriesTemp.push(versions);
                }

                //D
                versionValues = [];
                dataExist = false;
                for (var i=0; i< scope.barChartData.data3.length; i++) {
                  if( scope.barChartData.data3[i].value > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data3[i].value);
                }
                 if(dataExist) {
                  versions = {
                    label: 'D',
                    values: versionValues,
                    color: "#orange"
                  }
                   seriesTemp.push(versions);
                 }

                //E
                versionValues = [];
                dataExist = false;
                for (var i=0; i< scope.barChartData.data4.length; i++) {
                  if( scope.barChartData.data4[i].value > 0 ){
                    dataExist = true;
                  }
                  versionValues.push( scope.barChartData.data4[i].value);
                }

                if(dataExist){
                  versions = {
                    label: 'E',
                    values: versionValues,
                    color: "#lightgrey"
                  }
                   seriesTemp.push(versions);
                }
                dataTemp.series =  seriesTemp;

                data =  dataTemp;
                var chartWidth       = 600,
                    barHeight        = 20,
                    groupHeight      = barHeight * data.series.length,
                    gapBetweenGroups = 10,
                    spaceForLabels   = 50,
                    spaceForLegend   = 150,
                    gradId,
                    startOrangeColor = ["#F7923C"],
                    endOrangeColor = ["#F15937"],
                    startLightGreyColor = ["#D1D3D4"],
                    endLightGreyColor = ["#808284"],
                    startBlueColor = ["#29AADC"],
                    endBlueColor = ["#264180"],
                    startDarkGrayColor = ["#808184"],
                    endDarkGrayColor = ["#414042"],
                    startPurpleColor = ["#663B91"],
                    endPurpleColor = ["#1B144A"];

                // Zip the series data together (first values, second values, etc.)
                var zippedData = [];

                var gradColor = [];
                for (var i=0; i<data.labels.length; i++) {
                  for (var j=0; j<data.series.length; j++) {
                    gradColor.push(addColor(data.series[j].label));
                    zippedData.push(data.series[j].values[i]);
                  }
                }

                // Color scale
                var color = d3.scale.category20();
                var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

                var y = d3.scale.linear()
                    .domain(domain)
                    .range([0, chartWidth + gapBetweenGroups]);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickFormat(function(d) { return d; })
                    .tickSize(-chartHeight + gapBetweenGroups-15)
                    .orient("bottom");

                // Specify the chart area and dimensions

                var chart = element
                    .append("svg:svg")
                    .attr("width", spaceForLabels + chartWidth + spaceForLegend)
                    .attr("height", chartHeight+75);

                gradId = 'orange';
                setGrandientColor(chart,gradId, startOrangeColor, endOrangeColor);
                gradId = 'lightgrey';
                setGrandientColor(chart,gradId, startLightGreyColor, endLightGreyColor);
                gradId = 'blue';
                setGrandientColor(chart,gradId, startBlueColor, endBlueColor);
                gradId = 'darkgrey';
                setGrandientColor(chart, gradId, startDarkGrayColor, endDarkGrayColor);
                gradId = 'purple';
                setGrandientColor(chart,gradId, startPurpleColor, endPurpleColor);

                // Create bars
                var bar = chart.selectAll("g")
                    .data(zippedData)
                    .enter().append("g")
                    .attr("transform", function(d, i) {
                      return "translate(" + (spaceForLabels+130) + "," + ((i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length)))+25) + ")";
                    });

                // Create rectangles of the correct width
                bar.append("rect")
                    .attr("fill", function(d,i) {
                    return "url("+absUrl+gradColor[i]+")"; })
                    .attr("rx", "4") // for edge moulding
                    .attr("ry", "4") // for edge moulding
                    .attr("class", "bar")
                    .attr("width", function(d){
                                        var w = y(d);
                                        if(w >= 0){
                                        return w;
                                        } else
                                          {
                                            return 0;
                                          }
                                      })
                    .attr("height", barHeight - 1);

                // Draw labels

                bar.append("text")
                    .attr("class", "rpt-alt2")
                    .attr("x", function(d) { return - 150; })
                    .attr("y", groupHeight / 2)
                    .attr("dy", ".35em")
                    .text(function(d,i) {
                      if (i % data.series.length === 0)
                        return data.labels[Math.floor(i/data.series.length)];
                      else
                        return ""});

                bar.append("text")
                    .attr("class", "rpt-alt2")
                    .attr("x", function(d) { return y(d) - 50; })
                    .attr("y", barHeight / 2)
                    .attr("fill", "white")
                    .attr("dy", ".35em")
                    .text(function(d) { return d; });

                chart.append("g")
                      .attr("class", "axis")
                      .attr("transform", "translate(" + (spaceForLabels+130) + ", " + (chartHeight+30) + ")")
                      .call(yAxis);
                xAxisVal =  chart.selectAll(".tick");
                                        xAxisVal.selectAll("text").attr("y", -chartHeight + gapBetweenGroups-35)
                                                                  .attr("id", "xAxisText");

                // Draw legend
                var legendRectSize = 18,
                    legendSpacing  = 4;

                var legend = chart.selectAll('.legend')
                    .data(data.series)
                    .enter()
                    .append('g')
                    .attr('transform', function (d, i) {
                        var height = legendRectSize + legendSpacing;
                        var offset = gapBetweenGroups/2;
                        var horz =  legendSpacing + chartHeight + legendRectSize+35;
                        var vert = (i * height + offset) + 280;
                        if(i >0){
                          vert = vert  + (i*20);
                        }
                        return 'translate(' + vert + ',' + horz + ')';
                    });

                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', function (d, i) {
                      return 'url('+absUrl+d.color+')'; })
                    .style('stroke', function (d, i) { return 'url('+absUrl+d.color+')'; });

                legend.append('text')
                    .attr('class', 'legend')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    .text(function (d) { return d.label; });

                function setGrandientColor(canvas, gradId, startColor, endColor) {
                                                var gradient = canvas.append("svg:defs")
                                                .append("svg:linearGradient")
                                                .attr("id", gradId)
                                                .attr("x1", "50%")
                                                .attr("y1", "0%")
                                                .attr("x2", "50%")
                                                .attr("y2", "100%")
                                                .attr("spreadMethod", "pad");

                                                gradient.append("svg:stop")
                                                .attr("offset", "0%")
                                                .attr("stop-color", startColor[0])
                                                .attr("stop-opacity", 1);

                                                gradient.append("svg:stop")
                                                .attr("offset", "100%")
                                                .attr("stop-color", endColor[0])
                                                .attr("stop-opacity", 1);
                                    }

                function addColor(version) {
                  if(version === 'A') {
                    return '#blue';
                  }
                  if(version === 'B') {
                    return '#darkgrey';
                  }
                  if(version  === 'C') {
                    return '#purple';
                  }
                  if(version === 'D') {
                    return '#orange';
                  }
                  if(version === 'E') {
                    return '#lightgrey';
                  }
                }
       });
        }
    };
}]);

//Donut Chart
app.directive('donutChart', [function () {
    return {
        restrict: 'E',
        scope: {
            chartData: '@',
            index: '=',
            showNoneValues: '=',
            svgWidth: '=',
            svgHeight: '=',
            referenceRadius: '=',
            innerRadiusOffset: '=',
            translateHorizontal: '=',
            translateVertical: '=',
            printMode: '='
        },
        link: function (scope, iElement, iAttr) {
            var width = scope.svgWidth ? scope.svgWidth : 800,
                height = scope.svgHeight ? scope.svgHeight : 370,
                radius = scope.referenceRadius ? scope.referenceRadius / 2 : Math.min(width, 300) / 2,
                innerRadiusOffset = scope.innerRadiusOffset ? scope.innerRadiusOffset : 70,
                xTranslate = scope.translateHorizontal ? scope.translateHorizontal : 300,
                yTranslate = scope.translateVertical ? scope.translateVertical : 180,
                legendXTranslate = scope.printMode ? -270 : -470;

            //The color palette
            /* var color = ["rgb(98, 45, 45)", "rgb(148, 42, 42)", "rgb(195, 42, 42)", "rgb(229, 11, 11)", "rgb(226, 110, 14)", "rgb(226, 151, 14)", "rgb(205, 144, 14)", "rgb(232, 174, 46)", "rgb(232, 188, 46)"]; */
            //default color
            var color = ["#C4F91E", "#F15838", "#7AC0E5", "#FFF14C", "#FBF6B4", "#2A3A8B", "#FCAF56", "#441B56", "#3094AE", "#DE803D", "#725A8F", "#1076B6", "#80432A"];

            //The arc control
            var arc = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(radius - innerRadiusOffset);

            //Define the canvas - within this we draw the chart
            var canvas = d3.select(iElement[0])
                            .append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", "translate(" + xTranslate + ", " + yTranslate + ")");

            scope.$watch('chartData', function () {
                var i,
                    tempData,
                    emptyData,
                    rectTrackerArray = [],
                    textLinesTrackerArray = [];

                //Clear the elements inside the directive - elements created the last time the watch was triggered
                canvas.selectAll("*").remove();

                if (angular.isUndefined(scope.chartData)) {
                    return;
                } else if (typeof scope.chartData === 'string') {
                    scope.barChartData = JSON.parse(scope.chartData);
                } else {
                    scope.barChartData = JSON.parse(JSON.stringify(scope.chartData));
                }

                //Ensure that we have something to proceed with the chart
                if (angular.isUndefined(scope.barChartData.data)) {
                    return;
                }

                //Initialize
                var data = scope.barChartData.data.slice(0);

                //Before proceeding, ensure that we have at least one value for the donut
                var displayDonut = false;

                for (i = data.length - 1; i >= 0; i--) {
                    if (data[i].count > 0) {
                        displayDonut = true;
                        break;
                    }
                }

                if (!displayDonut) {
                    //No data for the donut. Do not show the donut
                    return;
                }

                if (!scope.showNoneValues) {
                    //Ensure that the data has a count of greater than zero
                    tempData = data.slice(0);
                    data = [];

                    for (i = 0; i < tempData.length; i++) {
                        if (tempData[i].count > 0) {
                            data.push(tempData[i]);
                        }
                    }
                } else {
                    //Sort the data
                    //Keys that have values will be shown first followed by keys that have no
                    //values - the difference will be seen in the legend text

                    // note, function modified to no longer put empty values last
                    
                    tempData = data.slice(0);
                    data = [];

                    for (var i = 0; i < tempData.length; i++) {
                        data.push(tempData[i]);
                    }
                }

                //Re-confirm that we have some data to show, after the filtering
                displayDonut = false;

                for (i = data.length - 1; i >= 0; i--) {
                    if (data[i].count > 0) {
                        displayDonut = true;
                        break;
                    }
                }

                if (!displayDonut) {
                    //No data for the donut. Do not show the donut
                    return;
                }

                var pie = d3.layout.pie()
                            .sort(null)
                            .value(function (d) {
                                return d.count;
                            });

                var g = canvas.selectAll(".arc")
                            .data(pie(data))
                            .enter()
                                .append("g")
                                .attr("class", "arc");

                var arcColors = color.slice();

                g.append("path")
                    .transition()
                    .duration(3000)
                    .attr("d", arc)
                    .style("fill", function (d, i) {
                        if (d.data.color) {
                            return '#' + d.data.color;
                        } else {
                            if (arcColors.length > 0) {
                                return arcColors.splice(0, 1)[0];
                            } else {
                                //All colors have been exhausted. Return without specifying color
                                return;
                            }
                        }
                    });

                g.append("text")
                    .attr("transform", function (d) {
                        var c = arc.centroid(d);

                        return "translate(" + c[0]*1.5 +"," + c[1]*1.5 + ")";
                    })
                    .attr("dy", ".35em")
                    .style("text-anchor", function (d) {
                        return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end": "start";
                    })
                    .style("fill", "#656668")
                    .style("font-size", function () {
                        if (scope.printMode) {
                            return "17px";
                        } else {
                            return "18px";
                        }
                    })
                    .style("font-family", function () {
                        if (scope.printMode) {
                            return "Arial, Helvetica, sans-serif";
                        } else {
                            return "'Gotham A', 'Gotham B'";
                        }
                    })
                    /*.text(function (d) {
                        var contribution = ((d.endAngle - d.startAngle) * (180 / Math.PI) * (100 / 360)).toFixed(2);
                        var representationText = '';

                        if (d.data.count > 0) {
                            representationText = '' + Math.round(contribution) + '%';

                            return representationText;
                        } else {
                            return representationText;
                        }
                    })*/;

                var legend = canvas.append("g")
                                .attr("height", 500)
                                .attr("width", 100)
                                .attr("transform", "translate(" + legendXTranslate + ", -130)");

                var legendColors = color.slice();

                legend.selectAll("rect")
                    .data(pie(data))
                    .enter()
                    .append("rect")
                    .attr("x", width - 65)
                    .attr("y", function (d, i) {
                        var words = d.data.value.split(' ');
                        var lengthOfLine = 0;
                        var newLength;
                        var lines = 1;

                        var contribution = ((d.endAngle - d.startAngle) * (180 / Math.PI) * (100 / 360)).toFixed(2);
                        var representationText = '';

                        if (d.data.count > 0) {
                            representationText += '&nbsp;' + Math.round(contribution) + '%';
                        }

                        //Start the lenth of the legend text with the
                        //characters of the % values (representation text)
                        lengthOfLine = representationText.length;

                        for (var j = 0; j < words.length; j++) {
                            //Calculate the number of lines that the 
                            //legend's text would take
                            lengthOfLine = lengthOfLine + words[j].length + 1;

                            //Check if the addition of the next word will exceed the limited
                            //width of the legend
                            newLength = lengthOfLine;

                            if ((j + 1) < words.length) {
                                newLength = newLength + words[j + 1].length + 1;
                            }

                            if (newLength > 24) {
                                lengthOfLine = 0;
                                lines++;
                            }
                        }

                        rectTrackerArray[i] = lines;
                        lines = 0;

                        //Count the total lines now
                        for (var k = 0; k < rectTrackerArray.length - 1; k++) {
                            lines = lines + rectTrackerArray[k];
                        }

                        if (scope.printMode) {
                            return 60 + (lines * 25);
                        } else {
                            return 25 * lines;
                        }
                    })
                    .attr("width", 12)
                    .attr("height", 12)
                    .style("fill", function (d, i) {
                        if (d.data.color) {
                            return '#' + d.data.color;
                        } else {
                            if (legendColors.length > 0) {
                                return legendColors.splice(0, 1)[0];
                            } else {
                                //All colors have been exhausted. Return without specifying color
                                return;
                            }
                        }
                    });

                legend.selectAll("text")
                    .data(pie(data))
                    .enter()
                    .append("text")
                        .attr("x", width - 50)
                        .attr("y", function (d, i) {
                            var words = d.data.value.split(' ');
                            var lengthOfLine = 0;
                            var newLength;
                            var lines = 1;

                            var contribution = ((d.endAngle - d.startAngle) * (180 / Math.PI) * (100 / 360)).toFixed(2);
                            var representationText = '';

                            if (d.data.count > 0) {
                                representationText += '&nbsp;' + Math.round(contribution) + '%';
                            }

                            //Start the lenth of the legend text with the
                            //characters of the % values (representation text)
                            lengthOfLine = representationText.length;

                            for (var j = 0; j < words.length; j++) {
                                //Calculate the number of lines that the 
                                //legend's text would take
                                lengthOfLine = lengthOfLine + words[j].length + 1;

                                //Check if the addition of the next word will exceed the limited
                                //width of the legend
                                newLength = lengthOfLine;

                                if ((j + 1) < words.length) {
                                    newLength = newLength + words[j + 1].length + 1;
                                }

                                if (newLength > 24) {
                                    lengthOfLine = 0;
                                    lines++;
                                }
                            }

                            textLinesTrackerArray[i] = lines;
                            lines = 0;

                            //Count the total lines now
                            for (var k = 0; k < textLinesTrackerArray.length - 1; k++) {
                                lines = lines + textLinesTrackerArray[k];
                            }

                            if (scope.printMode) {
                                return lines * 25 + 70;
                            } else {
                                return (25 * lines) + 10;
                            }
                        })
                        .attr("class", "legend-text")
                        .style("fill", "#656668")
                        .style("font-size", function () {
                            if (scope.printMode) {
                                return "14px";
                            } else {
                                return "15px";
                            }
                        })
                        .style("font-family", function () {
                            if (scope.printMode) {
                                return "'Gotham A', 'Gotham B'";
                            } else {
                                return "Arial, Helvetica, sans-serif";
                            }
                        })
                        .text(function (d) {
                            return d.data.value;
                        });

                legend.selectAll("text")
                    .each(function (d) {
                        var el = d3.select(this);
                        var words = d.data.value.split(' ');
                        var lengthOfLine = 0,
                            newLength = 0;

                        var contribution = ((d.endAngle - d.startAngle) * (180 / Math.PI) * (100 / 360)).toFixed(2);
                        var representationText = '';

                        if (d.data.count > 0) {
                            representationText += '&nbsp;' + Math.round(contribution) + '%';
                        }

                        //Start the lenth of the legend text with the
                        //characters of the % values (representation text)
                        lengthOfLine = representationText.length;

                        el.text(' ');

                        for (var i = 0; i < words.length; i++) {
                            var tspan = el.append('tspan').text(words[i] + ' ');
                            lengthOfLine = lengthOfLine + words[i].length + 1;

                            //Check if the addition of the next word will exceed the limited
                            //width of the legend
                            newLength = lengthOfLine;

                            if ((i + 1) < words.length) {
                                newLength = newLength + words[i + 1].length;
                            }

                            if (newLength > 24) {
                                lengthOfLine = 0;
                                tspan.attr("x", width - 48)
                                    .attr("dy", "17");
                            }
                        }

                        if (representationText.length > 0) {
                            el.append('tspan').html(representationText);
                        }
                    });
            });
        }
    };
}]);

/*Directive to prevent a dropdown from automatically closing when clicked
Dropdown instead needs to be closed by clicking outside it*/
app.directive('dropdownForm', [
function () {
    'use strict';

    return {
        link: function (scope, element, attrs) {
            element.on('click', function (event) {
                event.stopPropagation();
            });
        }
    };
}
]);

//Directive that uses FileSaver.js to allow exporting data as file
//Expects the data to be present in the scope as exportLink
//or as exportLinkAll if all attribute is set to true
//and name of the file to be present in the download attribute of the tag
//to which this directive is attached
app.directive('assistWithExport', [
function () {
    return {
        link: function (scope, element, attrs) {
            var csvString,
                blob,
				all;
			
            element.click(function (event) {
				all = attrs.all || false;
				
				if (all) {
					csvString = scope.exportLinkAll;
				} else {
					csvString = scope.exportLink;
				}

                blob = new Blob([csvString], {
                    encoding: 'utf-8',
                    type: 'text/csv;charset=utf-8'
                });

                saveAs(blob, attrs.download);
            });
        }
    };
}
]);

app.directive('bootstrapTooltip', ['$timeout',
function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            var rendered = false;

            scope.$watch(function () {
                return !rendered && (attrs.contentRendered === 'true' ? true : false);
            }, function (value) {
                if (value === true) {
                    element.tooltip();

                    rendered = true;
                }
            });
        }
    };
}
]);
//Directive to play videos
app.directive('vimeoPlayer', [
    function () {
        return {
            link: function (scope, element, attrs) {
                attrs.$observe('videoId', function () {
                    var path;

                    if (attrs.videoId && typeof attrs.videoId === 'string' && attrs.videoId.length > 0) {
                        path = 'https://player.vimeo.com/video/' + attrs.videoId + '?title=0&portrait=0&byline=0&badge=0'

                        attrs.$set('src', path);
                    }
                });
            }
        };
    }
]);

app.directive('videoUploader', ['$http', 'notificationWindow',
    function ($http, notificationWindow) {
        return {
            link: function (scope, element, attrs) {
                var videoUploadElement = angular.element('.video-upload'),
                    videoInputElement = angular.element('.video-input'),
                    videoFileType = /^video\//,
                    uploadToken,
                    attempts = 0,
                    errorOccurred = false,
                    file = {},
                    request;

                //Function that returns a XMLHttpRequest object
                var createCORSRequest = function (method, url) {
                    var xhr = new XMLHttpRequest();

                    if ("withCredentials" in xhr) {
                        xhr.open(method, url, true);
                    } else if (typeof XDomainRequest != "undefined") {
                        xhr = new XDomainRequest();
                        xhr.open(method, url);
                    } else {
                        xhr = null;
                    }

                    return xhr;
                };

                var getVideoInfo = function () {
                    //Check in place to ensure that we don't call this function in case the upload resulted
                    //in an error
                    if (errorOccurred) {
                        return;
                    }

                    $http.post('/api/misc/video', {
                            complete_uri: uploadToken.complete_uri,
                            username: scope.user.username,
                            weartestId: scope.weartest._id
                        })
                        .success(function (result) {
                            scope.saveUploadedVideo(result);
                        })
                        .error(function (err) {
                            notificationWindow.show('Error. Could not get details of the uploaded video. Try uploading again', false);

                            console.error(err);

                            scope.uploadingVideo = false;
                        });
                };

                //Gets information on the amount of bytes that have been uploaded
                var verifyUpload = function () {
                    //Check in place to ensure that we don't call this function in case the upload resulted
                    //in an error
                    if (errorOccurred) {
                        return;
                    }

                    var xhr = createCORSRequest('PUT', uploadToken.upload_link);

                    xhr.onerror = function () {
                        //Ignore - The main file upload is the one that matters
                    };

                    xhr.onload = function () {
                        var range = xhr.getResponseHeader('Range'),
                            endingByte = parseInt(range.substring('bytes=0-'.length), 10),
                            uploadCompletion = parseInt(endingByte / file.payload.size * 100, 10);

                        if (uploadCompletion < 100) {
                            notificationWindow.show(uploadCompletion + '% of file has been uploaded...', true);

                            //Check for uploaded bytes again, after some delay
                            //We don't want to spam Vimeo
                            setTimeout(function () {
                                verifyUpload();                                
                            }, 2500);
                        } else {
                            notificationWindow.show('Video has been uploaded. Attempting to get information about it...', true);

                            scope.$apply(function () {
                                //Get the location of the uploaded video
                                getVideoInfo();

                                //In the mean time, request for new upload token
                                getUploadTicket();
                            });
                        }
                    };

                    xhr.setRequestHeader('Content-Range', 'bytes */*');

                    xhr.send();
                };

                var getUploadTicket = function () {
                    uploadToken = {};

                    request = null;

                    scope.hideUploadButton = true;

                    $http.get('/api/misc/video')
                        .success(function (result) {
                            if (result.upload_link && result.complete_uri) {
                                uploadToken = result;

                                request = createCORSRequest('PUT', uploadToken.upload_link);
                            } else {
                                request = null;
                            }

                            if (!request) {
                                notificationWindow.show('Cannot upload videos. Your browser is not supported.', false);
                            } else {
                                //Attach listeners
                                request.onerror = function () {
                                    notificationWindow.show('Error uploading file', false);

                                    console.error(request.status, request.statusText);

                                    errorOccurred = true;

                                    scope.uploadingVideo = false;
                                };

                                //We don't listen for upload completed. That will be verified by verifyUpload
                                //function

                                scope.hideUploadButton = false;
                            }
                        })
                        .error(function (err) {
                            notificationWindow.show('Error. Cannot upload videos at this time', false);

                            console.error(err);
                        });
                };

                //Called as soon as a file is selected
                videoInputElement.on('change', function (event) {
                    //Get the selected file details
                    file.payload = event.target.files["0"];

                    //Verify the file type
                    if (!videoFileType.test(file.payload.type)) {
                        return notificationWindow.show('You can only upload videos');
                    }

                    //Limit the file size
                    if (file.payload.size > 200000000) {
                        return notificationWindow.show('Only videos less than 200Mb can be uploaded');
                    }

                    //All tests passed. Proceed to submit the form to upload the file
                    videoUploadElement.submit();
                });

                videoUploadElement.on('submit', function (event) {
                    event.stopPropagation();
                    event.preventDefault();

                    scope.$apply(function () {
                        notificationWindow.show('Reading selected file...', true);

                        request.setRequestHeader('Content-Type', file.payload.type);
                            scope.uploadingVideo = true;

                        //Upload the file
                        request.send(file.payload);

                        //Verify the progress and the upload
                        verifyUpload();
                    });
                });

                //If the dummy button is clicked, trigger the actual file input
                element.click(function (event) {
                    videoInputElement.click();
                });

                //When this directive loads, get an upload token from the server
                getUploadTicket();
            }
        };
    }
]);

app.directive('testRating', ['$timeout',
    function ($timeout) {
        return {
            restrict: 'EA',
            scope: {
                stars: '=',
                readOnly: '=',
                update: '&'
            },
            replace: true,
            templateUrl: '/partials/rating.html',
            link: function (scope, element, attrs) {
                scope.fullStars = [];
                scope.floatPart = 0;

                var _prepareStars = function (stars) {
                    scope.fullStars = [];

                    for (var i = 0; i < stars; i++) {
                        scope.fullStars.push(i);
                    }
                };

                //Sets / Unsets the rating
                scope.toggleRating = function (starNumber) {
                    if (scope.isRatingReadOnly()) {
                        return;
                    }

                    if (scope.stars === starNumber) {
                        //Unset it
                        scope.stars = -1;
                    } else {
                        scope.stars = starNumber;
                    }

                    $timeout(function() {
                        scope.update({attributeName: 'rating'});
                    }, 1000);
                };

                //Determines if that star needs to be set
                scope.isStarSet = function (starNumber) {
                    return starNumber <= scope.stars;
                };

                scope.isHalfStarSet = function (starNumber) {
                    return starNumber === (Math.floor(scope.stars) + 1) &&  scope.floatPart > 0;
                };

                scope.isRatingNotSet = function () {
                    if (scope.isRatingReadOnly()) {
                        return angular.isUndefined(scope.stars) || scope.stars === -1 || scope.stars === null;
                    } else {
                        return scope.fullStars.length === 0 && scope.floatPart <= 0;
                    }
                };

                scope.isRatingReadOnly = function () {
                    return scope.readOnly ? true : false;
                };

                scope.$watch('stars', function () {
                    if (scope.isRatingReadOnly()) {
                        if (scope.stars > 0) {
                            _prepareStars(Math.floor(scope.stars));
                            scope.floatPart = scope.stars % 1;
                        } else {
                            scope.integerPart = 0;
                            scope.floatPart = 0;
                        }
                    }
                });
            }
        };
    }
]);

/*
    Directive to display the human body - needs the user details
*/
app.directive('meshBody', ['$timeout',
function ($timeout) {
    return {
        restrict: 'E',
        template: '<div id="mesh-body"></div>',
        scope: {
            userDetails: '@'
        },
        link: function (scope, element, attrs) {
            var userDetails;
            var dataStored = false;
            var attributes = ['height', 'weight', 'waistMeasurement', 'inseamLength', 'sleeveLength', 'neckMeasurement'];

            function _hasChanged() {
                var changed = attributes.filter(function (a) {
                    if (userDetails[a] !== scope.user[a]) {
                        return true;
                    }

                    return false;
                });

                return changed.length > 0;
            }

            function _initializeBodyKit () {
                var measurements = {};
                var gender = scope.user.gender ? scope.user.gender : 'male';
                var mapping = ['height', 'weight', 'waist_girth', 'inseam', 'shirt_sleeve_length', 'mid_neck_girth'];
                var value;

                attributes.forEach(function (a, i) {
                    value = scope.user[a];

                    if (value && angular.isNumber(value)) {
                        measurements[mapping[i]] = value;
                    }
                });

                if (gender === 'female') {
                    value = scope.user.underBustMeasurement;
                } else {
                    value = scope.user.chestMeasurement;
                }

                if (value && angular.isNumber(value)) {
                    measurements.bust_girth = value;
                }

                //Remove any older measurements
                angular.element('#mesh-body').empty();

                //Allow time to remove old mesh
                $timeout(function () {
                    BodyKit.bootstrapWidget(document.getElementById('mesh-body'), {
                        accessKey: 'AK55ea5b9be40180f52b9291bcd095c51e',
                        showUi: false,
                        defaultGender: gender,
                        defaultUnitSystem: 'unitedStates',
                        defaultValues: measurements
                    });
                }, 1000);
            }

            scope.$watch('userDetails', function () {
                if (typeof scope.userDetails === 'string') {
                    scope.user = JSON.parse(scope.userDetails);

                    if (scope.user.username) {
                        //Not an empty object
                        if (!dataStored) {
                            //Remember the user details - that way we know when the data truly changes
                            userDetails = JSON.parse(JSON.stringify(scope.user));

                            dataStored = true;

                            _initializeBodyKit();
                        } else if(_hasChanged()) {
                            //Re-initialize only if certain attributes of the user have changed.
                            _initializeBodyKit();
                        }
                    }
                } else {
                    scope.user = scope.userDetails;
                }
            });
        }
    };
}
]);

/*
    Directive to set color for the options of a Single Selection Survey question
*/
app.directive('colorSelection', ['$http',
function ($http) {
    return {
        restrict: 'E',
        templateUrl: '/partials/color-picker.html',
        link: function (scope, element, attrs) {
            var path = '/api/mesh01/configuration',
                query = {
                    key: 'SURVEY_ANSWER_CHART_COLORS'
                },
                newPath = path + '?query=' + JSON.stringify(query);

            scope.showColorChoices = false;

            scope.toggleColorPicker = function () {
                scope.showColorChoices = !scope.showColorChoices;
            };

            scope.selectColor = function (color) {
                scope.activeColor = color;
                scope.value.chartColor = color;
                scope.toggleColorPicker();
            };

            scope.getBackgroundColor = function (color) {
                return {
                    'background-color': '#' + color
                };
            };

            if (scope.$last) {
                scope.displayTop = true;
            }

            if (scope.value.chartColor) {
                scope.activeColor = scope.value.chartColor;
            }

            $http.get(newPath)
                .success(function (result) {
                    if (result.key === 'SURVEY_ANSWER_CHART_COLORS') {
                        scope.palette = result.value;
                    }
                });


        }
    };
}
]);

app.directive('performanceZone', ['$timeout',
    function ($timeout) {
        return {
            restrict: 'EA',
            scope: {
                reportData: '='
            },
            replace: true,
            templateUrl: '/partials/performance-zone.html',
            link: function (scope, element, attrs) {
                    var elementIdx = 0;
                        scope.iteration = [];
                        scope.commentsSize = [];
                        var commentsMaxSize = 800;

                        scope.getCommentsMaxSize = function(index) {
                            return commentsMaxSize * index;
                        }

                        scope.getCommentSize = function (index){
                            return scope.commentsSize[index];
                        }

                        scope.getCommentSize1 = function (index){
                            elementIdx = index;
                            return scope.commentsSize[index];
                        }

                        scope.commentsSize = [];
                        var totalSize = 0;

                        scope.getIteration = function(totalDataPoints) {
                              scope.iteration = [];
                              for (var i = 1; i <= (Math.ceil(scope.getCommentSize(totalDataPoints)/commentsMaxSize)); i++) {
                                    scope.iteration.push(i);
                                };
                                return scope.iteration;
                        };

                scope.$watch('reportData', function () {
                        scope.getParticipantName = function (participantId) {
                            for (var i = 0; i < scope.reportData.userData.length; i++) {

                                if (scope.reportData.userData[i]._id === participantId) {
                                    return scope.reportData.userData[i].username;
                                }
                            }

                            for (i = 0; i < scope.reportData.unregisteredUsers.length; i++) {
                                if (scope.reportData.unregisteredUsers[i]._id === participantId) {
                                     return scope.reportData.unregisteredUsers[i].fname + ' ' + scope.reportData.unregisteredUsers[i].lname;
                                }
                            }

                            return 'Unknown User';
                        };

                        scope.setAllCommentsSize = function() {
                            for(var i = 0; i < scope.reportData.performanceZones.length; i++) {
                                var selectedDataPoints = scope.reportData.performanceZones[i].selectedDataPoints;

                                for (var j = 0; j < selectedDataPoints.length; j++) {
                                        if(angular.isUndefined(selectedDataPoints[j].comment)) {
                                            totalSize = totalSize + 0;
                                        } else {
                                            totalSize = totalSize + selectedDataPoints[j].comment.length;
                                        }
                                        scope.commentsSize.push(totalSize);
                                    }
                            }
                        }
                        scope.setAllCommentsSize();

                });
            }
        };
    }
]);

//Autocomplete directive
app.directive('autoComplete', ['$timeout',
function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            var source = attrs.source.split('.');

            element.autocomplete({
                source: scope[source[0]][source[1]],
                select: function (event, ui) {
                    $timeout(function () {
                        element.trigger('input');
                    });
                }
            });
        }
    }
}

]);
