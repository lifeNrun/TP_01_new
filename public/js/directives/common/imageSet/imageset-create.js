/*************************************************************
	Directive to allow creation of a new Image Set
	Module: imagesetApp
*************************************************************/

imagesetApp.directive('imagesetCreate', ['$http', '$timeout', function ($http, $timeout) {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			displayEntry: '='
		},
		templateUrl: '/partials/restricted/common/imageSets/create.html',
		link: function (scope, iElement, iAttr) {

			//Modal which is mapped to the new ImageSet attributes
			scope.newImageSet = {};

			//Controls when the new ImageSet creation modal is shown / hidden
			scope.showCreateModal = false;

			//Controls the action of creating a new ImageSet
			scope.creationInProgress = false;

			//Confirmation on creation
			scope.creationSuccess = false;
			scope.creationFailure = false;

			//Modal behaviour
			scope.modalOptions = {
				backdropFade: true,
				dialogFade: true
			};

			//Different Statuses for an Image Set
			scope.imageSetStatuses = [
				{
					name: "Active",
					value: "active"
				},
				{
					name: "Disabled",
					value: "disabled"
				}
			];

			//Different types of Image Sets
			scope.imageSetTypes = [
				{
					name: "Answer",
					value: "Answer"
				},
				{
					name: "Profile",
					value: "Profile"
				},
				{
					name: "WearTest",
					value: "WearTest"
				}
			];

			//Open the New Image Set Creation modal
			scope.openCreationModal = function () {
				scope.showCreateModal = true;
			};

			//Close the New Image Set Creation modal
			scope.closeCreationModal = function () {
				scope.showCreateModal = false;

				//Reset the model
				scope.newImageSet = {};
			};

			//Create the new ImageSet
			scope.createNewImageSet = function () {

				scope.creationInProgress = true;

				$http.post('/tableControlApi/imagesets', scope.newImageSet)
					.success(function (record) {
						//var data = JSON.parse(record.data);
						var data = record.data;
						//Verify if record was created
						if (!angular.isUndefined(data._id)) {
							//ID exists => Record successfully created
							scope.creationSuccess = true;
							scope.creationFailure = false;

							$timeout(function () {
								//Close the open modal
								scope.closeCreationModal();

								//Second timeout to allow for this controller to close the modal
								//before the directive is destroyed due to change in mode
								$timeout(function () {
									//Change mode - changes mode to display a single Image Set
									if (!angular.isUndefined(scope.displayEntry)) {
										scope.displayEntry(data._id);
									}
								}, 0);
							}, 3000);
						} else {
							//ID does not exist => Something wrong
							scope.creationSuccess = false;
							scope.creationFailure = true;
						}
						scope.creationInProgress = false;
					})
					.error(function (error) {
						scope.creationInProgress = false;
						scope.creationSuccess = false;
						scope.creationFailure = true;
					});
			};
		}
	};
}]);
