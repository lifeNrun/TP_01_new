/*View a Survey that has already been submitted*/
surveyApp.directive('viewSurvey', [function () {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			surveyDetails: '=',
			canEdit: '='
		},
		templateUrl: '/partials/restricted/common/survey/view-submitted-survey.html',
		controller: 'ViewSurveyCtrl'
	};
}]);

surveyApp.directive('editSurvey', [function () {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			surveyDetails: '=',
			updateSurveyInfo: '&',
			executeUpdate: '=',
			changeDisplayMode: '&'
		},
		templateUrl: '/partials/restricted/common/survey/edit-submitted-survey.html',
		link: function (scope, iElement, iAttr) {
			scope.$watch('executeUpdate', function () {
				if (scope.executeUpdate === true) {
					//Update the Survey
					scope.executeUpdateOfSurvey();

					//Reset the update status
					scope.executeUpdate = false;
				}
			});

			scope.$watch('surveyDetails', function () {
				if (!angular.isUndefined(scope.surveyDetails._id)) {
					//Correct the values
					for (var i = 0; i < scope.surveyDetails.answers.length; i++) {
						if (scope.surveyDetails.answers[i].type === 'Numeric' || scope.surveyDetails.answers[i].options.isNumeric === true) {
							scope.surveyDetails.answers[i].value = parseInt(scope.surveyDetails.answers[i].value, 10);
						}
					}
				}
			});
		},
		controller: 'EditSurveyCtrl'
	};
}]);

surveyApp.directive('answerSurvey', ['$timeout', function ($timeout) {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			surveyDetails: '@',
			userDetails: '@',
			updateSurveyInfo: '&',
			activityInfo: '='
		},
		templateUrl: '/partials/restricted/common/survey/answer-survey.html',
		link: function (scope, iElement, iAttr) {
			//Watch the changes to the survey details
			scope.$watch('surveyDetails', function () {
				scope.surveySuccessfullySubmitted=false;
				if (typeof scope.surveyDetails === 'string') {
					scope.survey = JSON.parse(scope.surveyDetails);

					//Wait for the user details to be populated
					$timeout(function () {
						var surveyAnswers = [],
							answer,
							questions = scope.survey.questions.slice(0),
							i;

						//Prepare the answers for the survey
						for (i = 0; i < questions.length; i++) {
							answer = {};

							answer.surveyId = scope.survey._id;
							answer.questionId = questions[i]._id;
							answer.userId = scope.userInfo._id;
							answer.questionName = questions[i].question;
							answer.comment = '';
							answer.type = questions[i].type;
							
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
							}

							answer.options = JSON.parse(JSON.stringify(questions[i].options));

							surveyAnswers.push(answer);
						}

						//Attach the answers to the scope
						scope.surveyAnswers = surveyAnswers.slice(0);
					}, 300);
				}
			});

			//Watch the changes to the user details
			scope.$watch('userDetails', function () {
				if (typeof scope.userDetails === 'string') {
					scope.userInfo = JSON.parse(scope.userDetails);
				}
			});
		},
		controller: 'AnswerSurveyCtrl'
	};
}]);
