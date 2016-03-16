/**************************************************************
	This file contains the directives applicable to a user
	profile.

    Module: dashboardApp
***************************************************************/
'use strict';

var j$ = jQuery.noConflict();

dashboardApp.directive('messageCenter', function ($http,$dialog) {
	return {
		restrict: 'E',
		scope: {
			userData: '='
		},
		templateUrl: '/partials/restricted/common/messageCenter/message-center.html',
		controller: function($http,$scope)
		{
			$scope.messages = {};
			$scope.isLoading = true;
			$scope.unreadMessages = 0;
			function init() {
				$scope.isLoading = true;
				$scope.unreadMessages = 0;
				var url ='/query/weartest?query=';
				//gets all the weartests of which the user is participant
				var query = {"$or":[ {participants:{"$elemMatch":{username: $scope.userData.username}}},
									 {owner: $scope.userData.username},
									 {createUsername: $scope.userData.username} ]};
				
				url+=JSON.stringify(query);
				$http.get(url)
				.then(function success(weartests) {
					//query for all messages
					getMessages(weartests.data);
					
					},function failuer(error) {
					console.error(error);
					$scope.isLoading = false;
					$scope.isSendingMessage = false;
				});
				
				function getMessages(weartests)
				{
					var weartestsNames = [];
					for(var i = 0; i < weartests.length; i++)
					{
						weartestsNames.push(weartests[i].name);
					}
					var url ='/query/messages?query=';
					var query = {"$or": [{toUser: $scope.userData._id},	//messages to me
										 {fromUser:$scope.userData._id},//messages from me
										 {broadcast : "true"}, //messages broadcasted
										 {userType : $scope.userData.utype}//messages to user type
										 ]};
					url+=encodeURIComponent(JSON.stringify(query));
					url+='&orderBy='+JSON.stringify({createdDate: -1});
					$http.get(url)
					.then(function success(messages) {
						$scope.messages = sortMessages(messages.data);
											
						$scope.isLoading = false;
						$scope.isSendingMessage = false;

						},function failure(error) {
							console.error(error);
							$scope.isLoading = false;
							$scope.isSendingMessage = false;
					});
				}
			}
			
			$scope.$watch('userData',function(newval, oldval){
					if($scope.userData) init();
				});
			
			
			/* Checks if a given username exists (and grabs the ID) */
			$scope.isSendingMessage = false;
			$scope.toUser = undefined;
			$scope.checkUsername = function(username, successCallback, errorCallback) {
				$scope.toUser = undefined;
				var url ='/query/users?query=';
				var query = {username:username};
				url+=JSON.stringify(query);
				$http.get(url)
				.then(function success(users) {
					if(users.data && users.data.length > 0) {
						$scope.toUser = users.data[0];
					}
					if(!successCallback) {
						$scope.isSendingMessage = false;
					} else { 
						successCallback();
					}
				},function failure(error) {
					console.error(error);
					$scope.toUser = undefined;
					
					if(!errorCallback) {
						$scope.isSendingMessage = false;
					} else { 
						errorCallback(error);
					}
				});
			}
			
			
			/* Checks if a wear test exists by name */
			$scope.toWeartest = undefined;
			$scope.checkWeartestName = function(name, successCallback, errorCallback) {
				$scope.toWeartest = undefined;
				$scope.isSendingMessage = true;
				var url ='/query/weartest?query=';
				var query = {name:name};
				url+=JSON.stringify(query);
				$http.get(url)
				.then(function success(weartests) {
					if(weartests.data && weartests.data.length > 0) {
						$scope.toWeartest = weartests.data[0];
					}
					if(!successCallback) {
						$scope.isSendingMessage = false;
					} else {
						successCallback();
					}
				},function failure(error) {
					console.error(error);
					$scope.toWeartest = undefined;
					
					if(!errorCallback) {
						$scope.isSendingMessage = false;
					} else { 
						errorCallback(error);
					}
				});
			}
			
			// Modal Initialization
			$scope.errorMessage = undefined;
			$scope.showSendMessageModal = false;

			// Default the blocks to be hidden.
			$scope.isVisible = false;
			
			/*
				Sends a message
			*/
			$scope.errorMessage = undefined;
			$scope.message = {stikyExpirationDate: (new Date()).toISOString()};
			$scope.sendMessage = function (message, type, modalScope) {
				modalScope.isSendingMessage = true;
				delete modalScope.errorMessage;
				if(angular.isUndefined(message)){
					modalScope.errorMessage = 'Select a value.';
					modalScope.isSendingMessage = false;
					return;
				}
				message.stikyExpirationDate = new Date().toISOString();
				var users = [];
				if(!message.title) {
					modalScope.errorMessage = 'Insert a title.';
					modalScope.isSendingMessage = false;
					return;
				}
				if(!message.body) {
					modalScope.errorMessage = 'Message is empty.';
					modalScope.isSendingMessage = false;
					return;
				}
				if(type == 'tester'){
					if (message.userType == 'Admin'){
						//retrieve all admin users and send them the message
						$http.get('/tableControlApi/messages/getAdmins')
							.then(function success(users) {
								$scope.sendMessageTo($scope.userData,users.data.data,message);
							},function failure(err) {
								console.log("Error getting users");
								console.log(err);
							});
					} else if(message.userType == 'Brand'){
						if(!message.wearTest) {
							modalScopeerrorMessage = 'Select a brand.';
							modalScope.isSendingMessage = true;
							return;
						}
						//send message to users of the selected brand
						//$http.get('/query/users?query={"$and":[{"utype":"Brand"},{"company":"'+message.wearTest.brand+'"}]}')
						$http.get('/tableControlApi/messages/getBrandUsers&company='+message.wearTest.brand)
							.then(function success(users) {
								$scope.sendMessageTo($scope.userData,users.data.data,message);
							},function failure(err) {
								console.log("Error getting users");
								console.log(err);
							});
					}
				} else if (type == 'reply'){
					// get the user id to reply to 
					$http.get('/tableControlApi/messages/getByUsername&username='+message.toUsername)
						.then(function success(users) {
							$scope.sendMessageTo($scope.userData,users.data.data,message);
						},function failure(err) {
							console.log("Error getting users");
							console.log(err);
						});
				} else {
					if(message.textUser) {
						// check typeahead user is Valid or not and send if valid
						var usersToSend = [];
						var splitUser = message.textUser.split(',');
						var j = 0;
						for(var i=0; i<splitUser.length; i++) {
							//checks username first
							$scope.checkUsername(splitUser[i].trim(),
							function() {
								j++;
								if(!$scope.toUser) {
									modalScope.isSendingMessage = false;
									modalScope.errorMessage = 'No user found.';
									return;
								} else {
									usersToSend.push($scope.toUser)
									$scope.toUser=undefined;
									if(j == splitUser.length){
										$scope.sendMessageTo($scope.userData,usersToSend,message);
									}
								}
							},
							function(error) {
								modalScope.isSendingMessage = false;
								modalScope.errorMessage = 'Error occurred: '+error;
								console.error('Error'+error);
							});
						}
					} else if(angular.isUndefined(message.toUser)){
						//send to all users of the weartest
						if(!message.wearTest) {
							modalScope.isSendingMessage = false;
							modalScope.errorMessage = 'Please select a wear test.';
							return;
						} 
						for(var i = 0; i < message.wearTest.participants.length; i++) {
							if(message.wearTest.participants[i].status == "on team") {
								var toInsert = message.wearTest.participants[i];
								//swap the id
								toInsert._id = toInsert.userIdkey;
								users.push(toInsert);
							}
						}
						$scope.sendMessageTo($scope.userData,users,message);
					} else {
						//send to selected user, swap the ids
						message.toUser._id = message.toUser.userIdkey;
						users.push(message.toUser);
						$scope.sendMessageTo($scope.userData,users,message);
					}
				}			
				modalScope.isSendingMessage = false;
				modalScope.close();
			}

			// sends message to user/group of users
			$scope.sendMessageTo = function (fromUser,toUsers,message){
				var messageTo = angular.copy(message);
				messageTo.fromUser = fromUser._id;
				messageTo.fromUsername = fromUser.username;
				if(message.isStiky === "false"){
					delete messageTo.stikyExpirationDate;
				}
				for(var i=0; i < toUsers.length; i++){
					var messageToSend = angular.copy(messageTo);
					messageToSend.toUser = toUsers[i]._id;
					messageToSend.toUserName = toUsers[i].username;
					$http.post('/tableControlApi/messages', messageToSend)
						.success(function (data) {
							delete $scope.message;
							if(!$scope.isLoading){
								init();	
							}
							return;
						}).error(function (err){
							return err;
						});
				}
			}
			
			/* message used to "parse" the messages (sort in a tree form)*/
			function sortMessages(messages,parentId,map) {
				if(!map) map = {};
				if(!parentId) parentId = undefined;
				var sorted = [];
				var messageNumber = 0;
				if(messages) {
					for(var i = 0; i < messages.length;i++)	{
						if(!messages[i]._id) continue;
						map[messages[i]._id] = messages[i];
						if(messages[i].fromUser !== $scope.userData._id && messages[i].isRead!==true) $scope.unreadMessages++;
					}
				}
				//gets the first messages (the one without parets): these are the root messages				
				for(var messageId in map) {
					var message = map[messageId];
					if(!message._id) continue;
					if(message.parentMessageId !== parentId) continue;
					//if stily not expired than put it at the start of the array
					if(message.isStiky && new Date(message.stikyExpirationDate) >= new Date())
						sorted.unshift(message);
					else 
						sorted.push(message);
					message.responses = sortMessages(null,message._id,map);
					delete map[messageId];
				}
				
				return sorted;
			}

			$scope.hasUnreadResponses = function (message){
				if(message.fromUser !== $scope.userData._id && message.isRead!==true){
					return true;
				}
				if(!angular.isUndefined(message.responses)){
					for(var i=0;i<message.responses.length;i++){
						if(message.responses[i].fromUser !== $scope.userData._id && message.responses[i].isRead!==true){
							return true;
						}else{
							
							return $scope.hasUnreadResponses(message.responses[i]);
						}
					}
				}
				return false;
			}

			$scope.popurl="popover-res.html";
			
			/*Reply to a given message*/
			$scope.replyTo = function(message, replyToRoom) {
				delete $scope.errorMessage;
				var messageToSend = {};
				$scope.isReply = true;
				if(!replyToRoom)
					messageToSend.toUsername = message.fromUsername;
				else
					messageToSend.roomType = message.roomType;
				messageToSend.title = "Re: " + message.title;
				messageToSend.toUser = message.toUser;
				messageToSend.parentMessageId = message._id;
				$scope.openReplyModal(messageToSend);
			}
			
			//markes a message as read: works only for direct messages
			$scope.markMessageAsRead = function(message) {

				$scope.dropdownActive = true;
				message._showBody =! message._showBody;
				//now get all child messages and set them to read
				var url ='/query/messages?query=';
				var query = {"parentMessageId": message._id};
				url+=JSON.stringify(query);
				$http.get(url)
				.success(function (messages) {
					for(var i = 0; i< messages.length; i++){
						$scope.markMessageAsRead(messages[i]);
					}
				});
				$scope.markResponsesAsRead(message);
				if($scope.userData._id !== message.toUser || message.isRead === true) return;
				message.isRead = true;
				$scope.unreadMessages--;
				
				var id = message._id;
				message.id = id;
				delete message._id;
				//try to insert the message
				$http.put('/tableControlApi/messages/'+id, message)
				.success(function (data) {
					//nothing to do
					message._id = id;
				});
			}

			$scope.markResponsesAsRead = function (message){
				var responses = message.responses;
				//visually mark responses as read
				if(!angular.isUndefined(responses)){
					for(var i = 0;i< responses.length; i++){
						responses[i].isRead = true;
						if(!angular.isUndefined(responses[i].responses)){
							$scope.markResponsesAsRead(responses[i]);
						}
					}
				}
			}

			$scope.openReplyModal = function(message) {
				$scope.isSendingMessage = false;
				var opts = {
				    backdrop: true,
				    keyboard: true,
				    backdropClick: true,
				    templateUrl: '/partials/restricted/common/messageCenter/message-reply-modal.html',
				    controller: function($scope, dialog, sendMessage, message){
						$scope.sendMessage = sendMessage;
				        $scope.message = message;
				        $scope.close = function() {
				            dialog.close();
				        }

				        $scope.send = function(message) {
				        	$scope.sendMessage(message,'reply',$scope);
				        }
				    },
				    resolve: {
				    	sendMessage: function() { return $scope.sendMessage},
				    	message : function() { return angular.copy(message)}
				    }
				};
				var replyDialog = $dialog.dialog(opts);
				replyDialog.open();
			}

			// Open message model depending upon userType
			$scope.openSendMessageModal = function() {
				$scope.isSendingMessage = false;
				if($scope.userData.utype == "Admin") {	
					var opts = {
			            backdrop: true,
			            keyboard: true,
			            backdropClick: true,
			            templateUrl: '/partials/restricted/common/messageCenter/message-admin-modal.html',
			            controller: function($scope, dialog, sendMessage){
							$scope.sendMessage = sendMessage;
			                $scope.close = function() {
			                    dialog.close();
			                }

			                $scope.send = function(message) {
			                	$scope.sendMessage(message,'admin',$scope);
			                }

			                $scope.fillDataForAdmin = function() {
								if($scope.message.toValue=="broadcast")	{
									var url ='/query/weartest?query={"status": "active"}';
									$http.get(url)
									.then(function success(weartest) {
										$scope.wearTests=weartest.data;
									},function failure(error) {
										console.log("Error on GET weartest");
										console.log(error);
									});
								} else {
									delete $scope.testerUsers;
								}
							}
							//default option of "All" and a list of all testers who are ON TEAM for the selected test.
							$scope.fillTester = function() {
								if(!angular.isUndefined($scope.message.wearTest)){
									var url ='/query/weartest?query={"$and":[{"_id":"'+$scope.message.wearTest._id+'"},{"status": "active"},{"participants":{"$elemMatch":{"status":"on team"}}}]}';
										$http.get(url)
										.then(function success(weartest) {		
											var userIds = [];
											for(var i = 0; i < $scope.message.wearTest.participants.length; i++) {
												if($scope.message.wearTest.participants[i].status=="on team") {
													userIds.push($scope.message.wearTest.participants[i].userIdkey);
												}
											}

											var url ='/query/users?query=';
											var query = {utype:"Tester",_id: {"$in": userIds}};
											url+=JSON.stringify(query);
											$http.get(url).then(function success(users) {
												$scope.testerUsers = [];
												for(var i = 0; i < users.data.length; i++) {
													$scope.testerUsers.push(users.data[i]);
												}
											},function failure(error) {
												console.log("Error on GET users");
												console.log(error);
											});
										},function failure(error) {
											console.log("Error on GET weartest");
											console.log(error);
									});
								}
							}
			            },
			            resolve: {
			            	sendMessage: function() { return $scope.sendMessage}
			            }
			          };
			        
					var adminDialog = $dialog.dialog(opts);
			        adminDialog.open();
				} else if($scope.userData.utype == "Brand") {
					$scope.isSendingMessage = false;
					var opts = {
			            backdrop: true,
			            keyboard: true,
			            backdropClick: true,
			            templateUrl: '/partials/restricted/common/messageCenter/message-brand-modal.html',
			            controller: function($scope, dialog, sendMessage, userData){
							$scope.sendMessage = sendMessage;
							$scope.userData = userData;
			                $scope.close = function() {
			                    dialog.close();
			                }

			                $scope.send = function(message) {
			                	$scope.sendMessage(message,'brand',$scope);
			                }
			                // list of all ACTIVE Wear Tests the brand user is associated with or it says "Admin"
							$scope.fillBrandWearTest = function() {
								delete $scope.testerUsers;
								var query = {"$or": [
									{brand:$scope.userData.company},
									{createUserId:$scope.userData._id}
									],
									"status":"active"
								};

								var url ='/query/weartest?query=';
								url+=JSON.stringify(query);
								$http.get(url)
								.then(function success(weartest) {
									$scope.wearTests=weartest.data;
								},function failure(error) {
									console.log("Error on GET weartest");
									console.log(error);
								});
							}
							$scope.getTestersForWearTest = function(){
								var url ='/query/weartest?query={"$and":[{"_id":"'+$scope.message.wearTest._id+'"},{"status": "active"},{"participants":{"$elemMatch":{"status":"on team"}}}]}';
								$http.get(url)
									.then(function success(weartest) {
									var users = [];
									for(var i = 0; i < $scope.message.wearTest.participants.length; i++) {
										if($scope.message.wearTest.participants[i].status=="on team") {
											users.push($scope.message.wearTest.participants[i]);
										}
									$scope.testerUsers = users;
										
									}
								},function failure(error) {
									console.log("Error on GET weartest");
									console.log(error);
								});
							}
							$scope.fillBrandWearTest();
			            },
			            resolve: {
			            	sendMessage: function() { return $scope.sendMessage},
			            	userData: function() { return angular.copy($scope.userData)}
			            }
			          };
					var brandDialog = $dialog.dialog(opts);
			        brandDialog.open();
				} else {
					$scope.isSendingMessage = false;
					var opts = {
			            backdrop: true,
			            keyboard: true,
			            backdropClick: true,
			            templateUrl: '/partials/restricted/common/messageCenter/message-tester-modal.html',
			            controller: function($scope, dialog, sendMessage, userData){
							$scope.sendMessage = sendMessage;
							$scope.userData = userData;
			                $scope.close = function() {
			                    dialog.close();
			                }

			                $scope.send = function(message) {
			                	$scope.sendMessage(message,'tester',$scope);
			                }

			                // ACTIVE Wear Tests for which the Participant is ON TEAM. Sending this message would go to anyone who is part of the BRAND associated to the Wear Test
							$scope.fillWearTest = function() {
								$scope.wearTests=null;
								if($scope.message.userType=="Brand") {
									var url ='/query/weartest?query={"status":"active","$and":[{"participants":{"$elemMatch":{"status":"on team"}}},{"participants":{"$elemMatch":{"userIdkey":"'+$scope.userData._id+'"}}}]}';
									$http.get(url)
									.then(function success(weartest) {
										$scope.wearTests = weartest.data;
									},function failure(error) {
										console.log("Error on GET weartest");
										console.log(error);
									});
								}
							}
			            },
			            resolve: {
			            	sendMessage: function() { return $scope.sendMessage},
			            	userData: function() { return angular.copy($scope.userData)}
			            }
			          };
					var testerDialog = $dialog.dialog(opts);
			        testerDialog.open();
				}
			}
		}
	};
});

//directive to stop click progataion which enables the dropdown menu to stay open
dashboardApp.directive('eatClick', function() {
    return function(scope, element, attrs) {
        element.click(function(event) {
            event.stopPropagation();
        });
    }
})

//directive to handle tree structure of popover responses. Directive is recursivly calling itself and making proper tree structure. 
//We have to pass proper scopes to the directive so we can call functions and read properties of other scopes.
//We get the onReply method as scope (because this method is from other directive)
//We also pass userId as showReplyButton property
dashboardApp.directive("popoverRespones", function($compile) {
    return {
        restrict: "E",
        scope: {family: '=', showReplyButton: '&', onReply: '&'},
        template:    
        '<div class="response" ng-repeat="response in family">[{{response.fromUsername}}] {{response.body}}  ' + 
	        '<span ng-hide="showReplyButton() == response.fromUser">'+
						'<button class="btn btn-inverse btn-mini btn-orange"  ng-click="onReply({messageData:response, booleanData: false})" eat-click>reply</button>  '+
						'<button ng-show="response.roomType" class="btn btn-inverse btn-mini btn-orange"  ng-click="onReply({messageData:response,  booleanData: true})" eat-click>reply</i></button>'+
					'</span>'+
	        '<popover-respones family="response.responses" on-reply="onReply({messageData:messageData, booleanData: booleanData})" show-reply-button="showReplyButton()"></popover-respones>' +
      	'</div>',
        compile: function(tElement, tAttr) {
            var contents = tElement.contents().remove();
            var compiledContents;
            return function(scope, iElement, iAttr) {
                if(!compiledContents) {
                    compiledContents = $compile(contents);
                }
                compiledContents(scope, function(clone, scope) {
                         iElement.append(clone); 
                });
            };
        }
    };
});

/* 
Directive to controll bootstrap javascript popover in the "angular way". 
Code licesed by MIT license from here https://github.com/mgcrea/angular-strap
*/
dashboardApp.directive('bsPopover', function($parse, $compile, $http, $timeout, $q, $templateCache) {

  // Hide popovers when pressing esc
  j$('body').on('keyup', function(ev) {
    if(ev.keyCode === 27) {
      j$('.popover.in').each(function() {
        j$(this).popover('hide');
      });
    }
  });

  return {
    restrict: 'A',
    scope: true,
    link: function postLink(scope, element, attr, ctrl) {

      var getter = $parse(attr.bsPopover),
        setter = getter.assign,
        value = getter(scope),
        options = {};

      if(angular.isObject(value)) {
        options = value;
      }

      $q.when(options.content || $templateCache.get(value) || $http.get(value, {cache: true})).then(function onSuccess(template) {

        // Handle response from $http promise
        if(angular.isObject(template)) {
          template = template.data;
        }

        // Handle data-unique attribute
        if(!!attr.unique) {
          element.on('show', function(ev) { // requires bootstrap 2.3.0+
            // Hide any active popover except self
            j$('.popover.in').each(function() {
              var j$this = j$(this),
                popover = j$this.data('popover');
              if(popover && !popover.$element.is(element)) {
                j$this.popover('hide');
              }
            });
          });
        }

        // Handle data-hide attribute to toggle visibility
        if(!!attr.hide) {
          scope.$watch(attr.hide, function(newValue, oldValue) {
            if(!!newValue) {
              popover.hide();
            } else if(newValue !== oldValue) {
              popover.show();
            }
          });
        }

        // Initialize popover
        element.popover(angular.extend({}, options, {
          content: template,
          html: true
        }));

        // Bootstrap override to provide tip() reference & compilation
        var popover = element.data('popover');
        popover.hasContent = function() {
          return this.getTitle() || template; // fix multiple $compile()
        };
        popover.getPosition = function() {
          var r = j$.fn.popover.Constructor.prototype.getPosition.apply(this, arguments);

          // Compile content
          $compile(this.$tip)(scope);
          scope.$digest();

          // Bind popover to the tip()
          this.$tip.data('popover', this);

          return r;
        };

        // Provide scope display functions
        scope.$popover = function(name) {
          popover(name);
        };
        angular.forEach(['show', 'hide'], function(name) {
          scope[name] = function() {
            popover[name]();
          };
        });
        scope.dismiss = scope.hide;

        // Emit popover events
        angular.forEach(['show', 'shown', 'hide', 'hidden'], function(name) {
          element.on(name, function(ev) {
            scope.$emit('popover-' + name, ev);
          });
        });

      });

    }
  };

});
