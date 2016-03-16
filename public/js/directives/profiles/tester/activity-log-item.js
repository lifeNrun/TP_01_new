/**************************************************************
	All directives used in the Activity Logs Dashboard Item
	of a user of type Tester are declared here

    Module: dashboardApp
***************************************************************/

dashboardApp.directive('activityLogChart', function () {
	'use strict';
	//Constants
	var margin = {
		top: 40,
		right: 50,
		bottom: 30,
		left: 50
	},
	width = 572 - margin.left - margin.right,
	height = 306 - margin.top - margin.bottom;

	return {
		restrict: 'E',
		scope: {
			val: '=',
			grouped: '='
		},
		controller: 'ActivityLogChartCtrl',
		templateUrl: '/partials/restricted/profiles/tester/activity-logs-chart.html',
		link: function (scope, iElement, iAttrs) {

			//Set the ranges (x,y and y1(right y-axis))
			var x = d3.time.scale().range([0, width]);

			var y = d3.scale.linear().range([height, 0]);
			var y1 = d3.scale.linear().range([height, 0]);

			var chartData = null;
			scope.firstDraw = false;

			//Define the axes
			var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.days, 1).tickFormat(d3.time.format("%m/%d"));

			var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickSize(8,4,0).tickSubdivide(5);

			var yAxisRight = d3.svg.axis().scale(y1).orient("right").ticks(5).tickSize(8,4,0).tickSubdivide(5);

			//Define the lines
			var valueline = d3.svg.line().interpolate("linear").x(function (d) { return x(d.activityDate);
			}).y(function (d) {
				return y(d.currentMetrics);
			});

			var valueline2 = d3.svg.line().interpolate("linear").x(function (d) {
				return x(d.activityDate);
			}).y(function (d) {
				return y1(d.currentMetricsRight);
			});

			//We need this line for animation at the start
			var startvalueline2 = d3.svg.line().interpolate("linear").x(function (d) {
				return x(d.activityDate);
			}).y(function (d) {
				return y(0);
			});

			//Set up initial svg object
			var vis = d3.select(iElement[0]).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			//Add the X Axis
			vis.append("g").attr("class", "grid").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

			//Add the Y Axis
			vis.append("g").attr("class", "y axis").call(yAxis);

			//Add the valueline path.
			vis.append("path").attr("class", "line");

			//Method for updating metrics in the graph. When we update the values
			//we have to call updateAndAnimate() to animate redraw
			scope.updateMetrics = function () {
				//If chartData is empty we exit
				if (!chartData) {
					return;
				}

				//Update the metrics for each value
				chartData.forEach(function (d) {
					//setting for miles or kilometers
					if (scope.distanceType == "miles") {
						d.convertedDistance = d.normalizedDistanceMPH;
						d.cumulativeDistance = d.cumulativeDistanceMPH;
					} else {
						d.convertedDistance = d.normalizedDistanceKPH;
						d.cumulativeDistance = d.cumulativeDistanceMPH * 1.60934;
					}

					//Setting for hours or minutes
					if(scope.timeType == "hours") {
						d.timeDuration = d.durationHours + d.durationMinutes / 60;
						d.timeDurationCumulative = d.cumulativeDurationHours;
					} else {
						d.timeDuration = d.durationHours*60 + d.durationMinutes;
						d.timeDurationCumulative = d.cumulativeDurationMinutes;
					}

					if (scope.yAxisType == "time" && scope.metricsType == "daily") {
						d.currentMetrics = d.timeDuration;
						vis.select("g.y.axis.right").remove();
						vis.select("path.line2").remove();
						scope.leftYAxisName = "Time";
						scope.rightYAxisName = "";
					} else if (scope.yAxisType == "time" && scope.metricsType == "cumulative") {
						d.currentMetrics = d.timeDurationCumulative;
						vis.select("g.y.axis.right").remove();
						vis.select("path.line2").remove();
						scope.leftYAxisName = "Time";
						scope.rightYAxisName = "";
					} else if (scope.yAxisType == "distance" && scope.metricsType == "daily") {
						d.currentMetrics = d.convertedDistance;
						vis.select("g.y.axis.right").remove();
						vis.select("path.line2").remove();
						scope.leftYAxisName = "Distance";
						scope.rightYAxisName = "";
					} else if (scope.yAxisType == "distance" && scope.metricsType == "cumulative") {
						d.currentMetrics = d.cumulativeDistance;
						vis.select("g.y.axis.right").remove();
						vis.select("path.line2").remove();
						scope.leftYAxisName = "Distance";
						scope.rightYAxisName = "";
					} else if (scope.yAxisType == "both" && scope.metricsType == "cumulative") {
						d.currentMetrics = d.cumulativeDistance;
						d.currentMetricsRight = d.timeDurationCumulative;
						scope.leftYAxisName = "Distance";
						scope.rightYAxisName = "Time";

						//Let's create extra line and right yAxis
						if (vis.select("g.y.axis.right").node() === null) {
							scope.createExtraLine();
						}
					} else if (scope.yAxisType == "both" && scope.metricsType == "daily") {
						d.currentMetrics = d.convertedDistance;
						d.currentMetricsRight =  d.timeDuration;
						scope.leftYAxisName = "Distance";
						scope.rightYAxisName = "Time";

						//Let's create extra line and right yAxis
						if (vis.select("g.y.axis.right").node() === null) {
							scope.createExtraLine();
						}
					}
				});

				scope.updateAndAnimate();
			};

			//Creates extra Y-axis and extra path line so we can see two graphs
			scope.createExtraLine = function () {
				//Reset schale so we get "intro animation"
				y1 = d3.scale.linear().range([height, 0]);
				yAxisRight = d3.svg.axis().scale(y1).orient("right").ticks(5).tickSize(8,4,0).tickSubdivide(5);

				//Append the second y-axis and second graph
				vis.append("g").attr("class", "y axis right").attr("transform", "translate(" + width + " ,0)").call(yAxisRight);

				vis.append("path").attr("class", "line2").attr("d", startvalueline2(chartData)).transition().duration(750).attr("d", valueline2(chartData));
			};

			//Update and animate the graph (and x an y axis)
			scope.updateAndAnimate = function () {
				//Scale the range of the data
				x.domain(d3.extent(chartData, function (d) {
					return d.activityDate;
				}));

				var dateRange = (chartData[chartData.length - 1].activityDate - chartData[0].activityDate) / (1000*60*60*24),
					ticks = dateRange < 7
						? d3.time.days
						: dateRange < 45
							? d3.time.weeks
							: dateRange < 210
								? d3.time.months : d3.time.years,
					tickFormat = ticks === d3.time.days
						? "%m/%d"
						: ticks === d3.time.weeks
							? "%d. %b " : "%b'%y ";
				//Adjust the x-axis format of the dates and scaling
				x = d3.time.scale().domain([chartData[0].activityDate, d3.time.day.offset(chartData[chartData.length - 1].activityDate, 1)]).rangeRound([0, width]).nice(d3.time.day);
				xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(ticks, 1).tickFormat(d3.time.format(tickFormat));

				y.domain([0, d3.max(chartData, function (d) {
					return d.currentMetrics;
				})]);

				y1.domain([0, d3.max(chartData, function (d) {
					return d.currentMetricsRight;
				})]);

				//Add toolTip depending on if other graph/axis exists or not
				scope.addTooltip(chartData, "leftAxis");
				if (scope.rightYAxisName) {
					vis.selectAll("circle.rightAxis").remove();
					scope.addTooltip(chartData, "rightAxis");
				} else {
					vis.selectAll("circle.rightAxis").remove();
				}

				//Update / animate all the lines and axis
				//Change the line
				vis.select("path.line").transition().duration(750).attr("d", valueline(chartData));
				//Change the line
				vis.select("path.line2").transition().duration(750).attr("d", valueline2(chartData));
				//Change the X axis
				vis.select("g.x.axis").transition().duration(750).call(xAxis);
				//Change the Y axis
				vis.select("g.y.axis").transition().duration(750).call(yAxis);
				//Change the Y Axis
				vis.select("g.y.axis.right").transition().duration(750).call(yAxisRight);
			};

			scope.addTooltip = function (data, axisType) {
				var axisName = "";
				var currentMetricsName = "";
				var axisFunction = null;
				if (axisType == "leftAxis") {
					vis.selectAll("circle.leftAxis").remove();
					axisName = "leftYAxisName";
					currentMetricsName = "currentMetrics";
					axisFunction = y;
				} else {
					axisName = "rightYAxisName";
					currentMetricsName = "currentMetricsRight";
					axisFunction = y1;
				}

				var formatTime = d3.time.format("%m/%d/%y");
				var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

				vis.selectAll("dot").data(data).enter().append("circle").attr("r", 5).attr("class", "circleHover "+ axisType).attr("cx", function (d) {
						return x(d.activityDate);
					}).attr("cy", function (d) {
						return axisFunction(d[currentMetricsName]);
					}).on("mouseover", function (d) {
						div.transition().duration(200).style("opacity", 0.9);

						//Format string for tooltip
						var tooltip = "";

						if (scope[axisName] == "Distance") {
							if (scope.distanceType == "miles") {
								tooltip = d[currentMetricsName].toFixed(2) + " miles";
							} else {
								tooltip = d[currentMetricsName].toFixed(2) + " kilometers";
							}
						} else {
							if (scope.timeType == "hours") {
								tooltip = d[currentMetricsName].toFixed(2) + " hours";
							} else {
								tooltip = d[currentMetricsName].toFixed(0) + " minutes";
							}
						}

						div.html(formatTime(d.activityDate) + "<br/>" + tooltip).style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
					}).on("mouseout", function (d) {
						div.transition().duration(500).style("opacity", 0);
					});
			};

			//Watch for chartData (and when GET methods gets the data in controller) 
			//we want to draw the graph
			scope.$watch('chartData', function (data) {
				//If 'val' is undefined, exit
				if (!data) {
					return;
				} else if (data.length === 0) {
					//No activity logs to plot
					return;
				}

				//Preparse it
				for (var i = 0; i < data.length; i++) {
					data[i].activityDate = new Date(data[i].activityDate.getFullYear(),data[i].activityDate.getMonth(),data[i].activityDate.getDate());

					if (data[i-1] && data[i].activityDate.getDate() == data[i-1].activityDate.getDate() && data[i].activityDate.getMonth() == data[i-1].activityDate.getMonth() && data[i].activityDate.getFullYear() == data[i-1].activityDate.getFullYear()) {
						data[i-1].durationHours = data[i-1].durationHours + data[i].durationHours;
						data[i-1].durationMinutes = data[i-1].durationMinutes + data[i].durationMinutes;

						data.splice(i,1);
						i--;
					}
				}

				//Pre-parse it
				var previousDistance  = 0;
				var previousHours = 0;
				var previousMinutes = 0;
				chartData = data;
				data.forEach(function (d) {
					//CumulativeDuration hours
					d.cumulativeDurationHours = previousHours + d.durationHours;
					previousHours = d.cumulativeDurationHours;
					d.currentMetrics = d.durationHours;

					d.cumulativeDurationMinutes = previousMinutes + (d.durationHours*60) + d.durationMinutes;
					previousMinutes = d.cumulativeDurationMinutes;

					//CumulativeDistance
					d.cumulativeDistanceMPH = previousDistance + d.normalizedDistanceMPH;
					previousDistance =  d.cumulativeDistanceMPH;
					d.currentMetricsRight =  d.cumulativeDistanceMPH;
				});

				//Scale the range of the data
				x.domain(d3.extent(data, function (d) {
					return d.activityDate;
				}));
				y.domain([0, d3.max(data, function (d) {
					return d.currentMetrics;
				})]);

				//If firstDraw then animate intro otherwise don't 
				if (!scope.firstDraw) {
					vis.select("path.line").attr("d", startvalueline2(data)).transition().duration(750).attr("d", valueline(data));
					scope.firstDraw=true;
				} else {
					vis.select("path.line").transition().duration(750).attr("d", valueline(data));
				}

				scope.updateMetrics();
			});
		}
	};
});

dashboardApp.directive('activityLogItem', [function () {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			showActivityLogModal: '=',
			logData: '=',
			questionNumber: '=',
			wearTests: '@',
			activityLogMode: '@',
			updateLogInfo: '=',
			currentUser: '@',
			hideWearTestSelection: '@'
		},
		templateUrl: '/partials/restricted/profiles/tester/activity-logs-create-edit.html',
		link: function (scope, iElement, iAttr) {
			//Watch the Wear Tests information passed - it is in string and needs to be in Array Form
			scope.$watch('wearTests', function () {
				if (angular.isUndefined(scope.wearTests)) {
					scope.wearTests = [];
				} else if (typeof scope.wearTests === "string") {
					scope.wearTests = JSON.parse(scope.wearTests);
				}
			});

			//Watch the user details passed - it is in string from and should be in object form
			scope.$watch('currentUser', function () {
				if (angular.isUndefined(scope.currentUser)) {
					scope.currentUser = {};
				} else if (typeof scope.currentUser === "string") {
					scope.currentUser = JSON.parse(scope.currentUser);
				}
			});

			//Watch if the consumer wishes to hide the Wear Test Selection screen
			scope.$watch('hideWearTestSelection', function () {
				if (angular.isUndefined(scope.hideWearTestSelection)) {
					scope.hideWearTestSelection = false;
				} else if (typeof scope.hideWearTestSelection === "string") {
					scope.hideWearTestSelection = (scope.hideWearTestSelection === "true");
				}

				if (scope.hideWearTestSelection) {
					scope.questions = ["Activity Type:", "Conditions:", "Intensity:", "Terrain:", "Temperature:", "Duration / Distance:", "Activity Notes"];
				} else {
					scope.questions = ["Choose Product Test:", "Activity Type:", "Conditions:", "Intensity:", "Terrain:", "Temperature:", "Duration / Distance:", "Activity Notes"];
				}
			});

			//Watch the changes to the Activity Log date
			scope.$watch('logData.activityDate', function () {
				if (typeof scope.logData.activityDate === 'string') {
					scope.logData.activityDate = new Date(scope.logData.activityDate);
				}
			});
		},
		controller: 'ActivityLogsMaintainCtrl'
	};
}]);
