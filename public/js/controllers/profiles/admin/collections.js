app.controller('UserCollectionController', ['$scope', '$http', '$routeParams', '$location', 'notificationWindow',                                 
function ($scope, $http, $routeParams, $location, notificationWindow) {                                                                           
    var userId = $routeParams.itemId,                                                                                                             
        fields = ['fname', 'lname', 'username', 'utype', 'email', 'company', 'dateOfBirth', 'gender', 'address', 'unavailableToTest', 'brandAssociation', 'tags'],            
        oldUserDetails;                                                                                                                           
                                                                                                                                                  
    if (!userId) {                                                                                                                                
        notificationWindow.show('Error. Cannot get details of the document as no document id provided', false);                                   
        return;                                                                                                                                   
    }                                                                                                                                             
                                                                                                                                                  
    var path = '/api/mesh01/users/' + userId,                                                                                                   
        projection = {                                                                                                                            
            'fname': 1,                                                                                                                           
            'lname': 1,                                                                                                                           
            'username': 1,                                                                                                                        
            'utype': 1,                                                                                                                           
            'email': 1,                                                                                                                           
            'company': 1,                                                                                                                         
            'dateOfBirth': 1,                                                                                                                     
            'gender': 1,                                                                                                                          
            'address': 1,                                                                                                                         
            'modifiedDate': 1,                                                                                                                    
            'modifiedUsername': 1,                                                                                                                
            'createdDate': 1,                                                                                                                     
            'createdUsername': 1,                                                                                                                 
            'unavailableToTest': 1,
            'brandAssociation': 1,
            'tags': 1
        };                                                                                                                                        
                                                                                                                                                  
    $scope.user = {};                                                                                                                             
                                                                                                                                                  
    $scope.countries = [];                                                                                                                      
                                                                                                                                                  
    $scope.statesInUsa = [];                                                                                                                      
                                                                                                                                                  
    $scope.userTypes = ['Admin', 'Brand', 'Tester'];                                                                                              
                                                                                                                                                  
    $scope.updateInProgress = false;
    
    var adjustUserAddress = function (toRecord, fromRecord) {                                                                                     
        $scope.user.tempAddress = {};                                                                                                             
                                                                                                                                                  
        //Adjust the address of the user                                                                                                          
        for (var i = 0; i < fromRecord.address.length; i++) {                                                                                     
            if (fromRecord.address[i].type === 'ship') {                                                                                          
                toRecord.tempAddress.address1 = fromRecord.address[i].address1;                                                                   
                toRecord.tempAddress.address2 = fromRecord.address[i].address2;                                                                   
                toRecord.tempAddress.city = fromRecord.address[i].city;                                                                           
                toRecord.tempAddress.state = fromRecord.address[i].state;                                                                         
                toRecord.tempAddress.zipCode = fromRecord.address[i].zipCode;
                toRecord.tempAddress.country = fromRecord.address[i].country;                                                                     
                                                                                                                                                  
                break;                                                                                                                            
            }                                                                                                                                     
        }
    };                                                                                                                                            
                                                                                                                                                  
    $scope.blankoutState = function () {
    	  console.log('Country = '+$scope.user.tempAddress.country);
    	  if ($scope.user.tempAddress.country === 'United States')
    	  {
    	  	  $scope.user.tempAddress.state = '';
    	  }
    }                                                                                                          
                                                                                                                                                  
    $scope.updateUser = function () {                                                                                                             
        var changesMade = false,                                                                                                                  
            affectedFields,                                                                                                                       
            path,                                                                                                                                 
            addressFields = ['address1', 'address2', 'city', 'state', 'country', 'zipCode']                                                                  
            changedUser = {};                                                                                                                     
                                                                                                                                                  
        if ($scope.updateInProgress) {                                                                                                            
            return;                                                                                                                               
        }                                                                                                                                         
                                                                                                                                                  
        //First check that all fields have values.                                                                                                
        for (var i = 0; i < fields.length; i++) {                                                                                                 
            if (fields[i] === 'address') {                                                                                                        
                for (var j = 0; j < addressFields.length; j++) {                                                                                  
                    if (addressFields[j] === 'address2') {                                                                                        
                        //No validation required for address 2 field                                                                              
                        continue;                                                                                                                 
                    }                                                                                                                             
                                                                                                                                                  
                    if ($scope.user.tempAddress[addressFields[j]].length === 0) {                                                                 
                        notificationWindow.show('Cannot update user record. Please enter a value for the ' + addressFields[j] + ' field', false); 
                                                                                                                                                  
                        return;                                                                                                                   
                    }                                                                                                                             
                                                                                                                                                  
                    //Additional validation for USA zip code
                    if (addressFields[j] === 'zipCode'  && $scope.user.tempAddress['country'] === 'United States') {                                                                                         
                        if (!(/^\d{5}(-\d{4})?$/.test($scope.user.tempAddress.zipCode))) {                                                        
                            notificationWindow.show('Invalid USA zip code. Please provide a valid zip code either in ##### or #####-#### format');
                                                                                                                                                  
                            return;                                                                                                               
                        }                                                                                                                         
                    }                                                                                                                             
                }                                                                                                                                 
            } else {                                                                                                                              
                if (fields[i] === 'company') {                                                                                                    
                    if ($scope.user.utype ==='Brand' && (!$scope.user.company || $scope.user.company.length === 0)) {                             
                        notificationWindow.show('Brand users need a value for the "company" attribute', false);                                   
                                                                                                                                                  
                        return;                                                                                                                   
                    }                                                                                                                             
                                                                                                                                                  
                    continue;                                                                                                                     
                } else if (fields[i] === 'unavailableToTest' || fields[i] === 'company' || fields[i] === 'brandAssociation') {                                                                                   
                    //Boolean field. Either does not exist / false or is true or not a mandatory field.                                                                    
                    continue;                                                                                                                     
                } else if (!$scope.user[fields[i]] || $scope.user[fields[i]].length === 0) {                                                      
                    notificationWindow.show('Cannot update user record. One or more values are empty', false);                                    
                                                                                                                                                  
                    return;                                                                                                                       
                }                                                                                                                                 
            }                                                                                                                                     
        }                                                                                                                                         
                                                                                                                                                  
        //Next determine which fields have changed                                                                                                
        affectedFields = fields.filter(function (fieldName) {                                                                                     
            if (fieldName === 'address') {                                                                                                        
                for (var i = 0; i < oldUserDetails.address.length; i++) {                                                                         
                    if (oldUserDetails.address[i].type === 'ship') {                                                                              
                        for (var j = 0; j < addressFields.length; j++) {                                                                          
                            if (oldUserDetails.address[i][addressFields[j]] !== $scope.user.tempAddress[addressFields[j]]) {                      
                                return true;                                                                                                      
                            }                                                                                                                     
                        }                                                                                                                         
                                                                                                                                                  
                        break;                                                                                                                    
                    }                                                                                                                             
                }                                                                                                                                 
                                                                                                                                                  
                return false;                                                                                                                     
            } else {                                                                                                                              
                return oldUserDetails[fieldName] !== $scope.user[fieldName];                                                                      
            }                                                                                                                                     
        });                                                                                                                                       
                                                                                                                                                  
        if (affectedFields.length === 0) {                                                                                                        
            notificationWindow.show('No changes carried out to user record. Save cancelled', false);                                              
                                                                                                                                                  
            return;                                                                                                                               
        }                                                                                                                                         
                                                                                                                                                  
        //Finally, create a new object containing only the changed fields                                                                         
        affectedFields.forEach(function (fieldName) {                                                                                             
            if (fieldName === 'address') {                                                                                                        
                changedUser.address = oldUserDetails.address;                                                                                     
                                                                                                                                                  
                for (var i = 0; i < changedUser.address.length; i++) {                                                                            
                    if (changedUser.address[i].type === 'ship') {                                                                                 
                        changedUser.address[i].address1 = $scope.user.tempAddress.address1;                                                       
                        changedUser.address[i].address2 = $scope.user.tempAddress.address2;                                                       
                        changedUser.address[i].city = $scope.user.tempAddress.city;                                                               
                        changedUser.address[i].zipCode = $scope.user.tempAddress.zipCode;                                                         
                        changedUser.address[i].state = $scope.user.tempAddress.state;                                                             
                        changedUser.address[i].country = $scope.user.tempAddress.country;                                                             
                                                                                                                                                  
                        break;                                                                                                                    
                    }                                                                                                                             
                }                                                                                                                                 
            } else {                                                                                                                              
                changedUser[fieldName] = $scope.user[fieldName];                                                                                  
            }                                                                                                                                     
        });                                                                                                                                       
                                                                                                                                                  
        changedUser._id = $scope.user._id;                                                                                                        
                                                                                                                                                  
        path = '/api/mesh01/users/' + changedUser._id;                                                                                          
                                                                                                                                                  
        notificationWindow.show('Saving changes...', true);                                                                                       
                                                                                                                                                  
        $scope.updateInProgress = true;                                                                                                           
                                                                                                                                                  
        $http.put(path, changedUser)                                                                                                              
            .success(function (result) {                                                                                                          
                var saved = true;                                                                                                                 
                                                                                                                                                  
                if (result._id === changedUser._id) {                                                                                             
                    //Verify that all changes have been saved                                                                                     
                    affectedFields.forEach(function (fieldName) {                                                                                 
                        if (fieldName === 'address') {                                                                                            
                            for (var i = 0; i < result.address.length; i++) {                                                                     
                                if (result.address[i].type === 'ship') {                                                                          
                                    for (j = 0; j < changedUser.address.length; j++) {                                                            
                                        if (changedUser.address[j].type === 'ship') {                                                             
                                            if (result.address[i].address1 === changedUser.address[j].address1 &&                                 
                                            result.address[i].address2 === changedUser.address[j].address2 &&                                     
                                            result.address[i].city === changedUser.address[j].city &&                                             
                                            result.address[i].zipCode === changedUser.address[j].zipCode &&                                       
                                            result.address[i].state === changedUser.address[j].state) {                                           
                                                saved = saved && true;                                                                            
                                            } else {                                                                                              
                                                saved =  saved && false;                                                                          
                                            }                                                                                                     
                                                                                                                                                  
                                            break;                                                                                                
                                        }                                                                                                         
                                    }                                                                                                             
                                    break;                                                                                                        
                                }                                                                                                                 
                            }                                                                                                                     
                        } else if (fieldName === 'dateOfBirth') {                                                                                 
                            if (new Date(result[fieldName]).getTime() === new Date(changedUser[fieldName]).getTime()) {                           
                                saved = saved && true;                                                                                            
                            } else {                                                                                                              
                                saved = saved && false;                                                                                           
                            }                                                                                                                     
                        } else if (fieldName === 'brandAssociation') {                                                                                 
                            if (angular.equals(result[fieldName].toString(), changedUser[fieldName].toString())) {                           
                                saved = saved && true;                                                                                            
                            } else {                                                                                                              
                                saved = saved && false;                                                                                           
                            }                                                                                                                     
                        } else if (fieldName === 'tags') {                                                                                 
                            if (angular.equals(result[fieldName].toString(), changedUser[fieldName].toString())) {                           
                                saved = saved && true;                                                                                            
                            } else {                                                                                                              
                                saved = saved && false;                                                                                           
                            }                                                                                                                     
                        } else if (result[fieldName] === changedUser[fieldName]) {                                                                
                            saved = saved && true;                                                                                                
                        } else {
                            saved = saved && false;                                                                                               
                        }                                                                                                                         
                    });                                                                                                                           
                                                                                                                                                  
                    if (saved) {                                                                                                                  
                        oldUserDetails = JSON.parse(JSON.stringify(result));                                                                      
                                                                                                                                                  
                        $scope.user = result;                                                                                                     
                                                                                                                                                  
                        adjustUserAddress($scope.user, oldUserDetails);                                                                           
                                                                                                                                                  
                        notificationWindow.show('Changes saved successfully', false);                                                             
                                                                                                                                                  
                        $scope.updateInProgress = false;                                                                                          
                                                                                                                                                  
                        $location.path('/dashboard/AdminTools/users');                                                                            
                    } else {                                                                                                                      
                        $scope.updateInProgress = false;                                                                                          
                                                                                                                                                  
                        notificationWindow.show('An error occurred while saving the record. Changes have not been saved', false);                 
                    }                                                                                                                             
                } else {                                                                                                                          
                    $scope.updateInProgress = false;                                                                                              
                                                                                                                                                  
                    notificationWindow.show('An error occurred while saving the record. Changes have not been saved', false);                     
                }                                                                                                                                 
            })                                                                                                                                    
            .error(function (err) {                                                                                                               
                $scope.updateInProgress = false;                                                                                                  
                                                                                                                                                  
                notificationWindow.show('An error occurred while saving the record. Changes have not been saved', false);                         
            });                                                                                                                                   
    };                                                                                                                                            
                                                                                                                                                  
    notificationWindow.show('Getting user details...', true);                                                                                     
                                                                                                                                                  
    path += '?projection=' + JSON.stringify(projection);                                                                                          
                                                                                                                                                  
    //Get the user details                                                                                                                        
    $http.get(path)                                                                                                                               
        .success(function (user) {                                                                                                                
            if (user._id === userId) {                                                                                                            
                notificationWindow.show('User details fetched successfully', false);                                                              
                $scope.user = user;
                
                oldUserDetails = JSON.parse(JSON.stringify(user));                                                                                
                                                                                                                                                  
                adjustUserAddress($scope.user, user);
            } else {                                                                                                                              
                notificationWindow.show('Error while fetching the user details', false);                                                          
            }                                                                                                                                     
        })                                                                                                                                        
        .error(function (err) {                                                                                                                   
            notificationWindow.show('Error while fetching the user details', false);                                                              
        });                                                                                                                                       
                                                                                                                                                  
    //Get the countries annd states                                                                                                                              
    $http.get('/js/static-data.json')                                                                                                             
        .success(function (records) {                                                                                                             
            $scope.countries = records.countries;                                                                                             
            $scope.statesInUsa = records.statesInUsa;                                                                                             
        });                                                                                                                                       
}                                                                                                                                                 
]);                                                                                                                                               