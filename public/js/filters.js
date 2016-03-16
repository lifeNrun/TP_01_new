/**************************************************************
    This file contains all the filters used by the
    application.

    Module: wearTestWebApp
***************************************************************/

//This filter capitalizes the first character of the supplied string
app.filter('capitalize', function () {
    return function (input, scope) {
        var capitalizedString = "";

        if (angular.isUndefined(input) || input.length < 2) {
            return;
        }

        //Capitalize the first letter
        capitalizedString = input.substring(0, 1).toUpperCase();

        //Concatenate with the rest of the string without capitalization
        capitalizedString = capitalizedString + input.substring(1);

        return capitalizedString;
    };
});

//This filter shows the "foot,inches" on "foot' inches" " format 
app.filter('feetToInchesAndFoot', function () {
    return function (input, scope) {
        var formattedString = "";

        if (angular.isUndefined(input)) {
            return;
        }
        var foot = parseInt(input, 10);
        var inches = Math.round((parseFloat(input)-foot) * 12);
        

        //Put on foot' + inches" format 
        formattedString = foot + '\'' + inches + '"';

        return formattedString;
    };
});

//This filter shows the "foot" on "foot' inches" " format 
app.filter('inchesToFeetAndInches', function () {
    return function (input, scope) {
        var formattedString = "";

        if (angular.isUndefined(input)) {
            return;
        }

        var feet = parseInt(input / 12, 10);
        var inches = (input%12);

        //Put on foot' + inches" format 
        formattedString = feet + '\'' + inches + '"';

        return formattedString;
    };
});

// gets the scaled image url from cloudinary
app.filter('getScaledImage', function(){
    return function(input,width,height,mode) {
        var url = input;
        //if the url is empty, put the placeholder
        if(angular.isUndefined(url) || url === null || url === ""){
            return '/img/placeholder-person.png';
        }
        //set default mode if not set
        if(angular.isUndefined(mode) || mode === null || mode === ""){
            mode = 'c_fit';
        }
        // get filename by parsing the URL
        var filename = url.substring(url.lastIndexOf('/'));
        var endpoint = url.substring(0,url.lastIndexOf('upload/'));
        var modifiers = '';
        // check cloudinary modifiers
        if((width !== null && width !== "") && (height !== null && height !== "")){
            modifiers +=  'w_'+width+',h_'+height;
        }
        if(mode !== null && mode !== ""){
            modifiers += ','+mode;
        }
        return endpoint + 'upload/' + modifiers + filename;
    };
});

// gets the scaled image url from cloudinary
app.filter('draftFilter', function(){
    return function(input,filters) {
        var filtered = [];

        if(angular.isUndefined(input)){
            return filtered;
        }
        var count = {
                drafted: 0,
                confirmed: 0,
                onTeam: 0,
                invited: 0,
                total: 0
        };

        if(!angular.isUndefined(filters.testerName) && filters.testerName.length > 0) {
            for (var i = 0; i < input.length; i++) {

                value = input[i];

                var filterBy = filters.testerName.toLowerCase();

                ////Is it the name?
                var fullName = '',
                    nameFound = false;

                if (value.fname) {
                    var fname = value.fname.toLowerCase();

                    if (fname.substring(0, filterBy.length).search(filterBy) > -1) {
                        nameFound = true;
                    }

                    fullName += fname + ' ';
                }

                if (value.lname) {
                    var lname = value.lname.toLowerCase();
                    if (lname.substring(0, filterBy.length).search(filterBy) > -1) {
                        nameFound = true;
                    }

                    fullName += value.lname.toLowerCase();
                }

                if (fullName.search(filterBy) > -1) {
                    nameFound = true;
                }

                ////Is it a username?
                var username = value.username.toLowerCase();

                if (username.substring(0, filterBy.length).search(filterBy) > -1) {
                    nameFound = true;
                }

                if (!angular.isUndefined(value.email) && value.email.indexOf(filterBy) !== -1) {
                    nameFound = true;
                }

                if (nameFound) {
                    filtered.push(value);
                    count.total++;
                    //check status
                    if (value.status == "on team") {
                        count.onTeam++;
                    } else if (value.status == "drafted") {
                        count.drafted++;
                    } else if (value.status == "confirmed") {
                        count.confirmed++;
                    } else if (status == "invited") {
                        count.invited++;
                    }
                }
            }
            filters.count = count;
            return filtered;
        } else {


            // initialize dates
            var today = new Date();
            var minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - (filters.ageMin));
            var maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - (filters.ageMax + 1));

            for (var i = 0; i < input.length; i++) {
                value = input[i];
                var dateOfBirth = new Date(Date.parse(value.dateOfBirth));
                var toAdd = false;
                toAdd = (

                (!angular.isUndefined(value.shoeSize) && value.shoeSize <= filters.shoeMax && value.shoeSize >= filters.shoeMin) &&
                (!angular.isUndefined(value.height) && value.height <= (filters.heightMax * 12) && value.height >= (filters.heightMin * 12)) &&
                (!angular.isUndefined(value.weight) && value.weight <= filters.weightMax && value.weight >= filters.weightMin) &&
                (!angular.isUndefined(value.inseamLength) && value.inseamLength <= filters.inseamMax && value.inseamLength >= filters.inseamMin) &&
                (!angular.isUndefined(value.waistMeasurement) && value.waistMeasurement <= filters.waistMax && value.waistMeasurement >= filters.waistMin) &&
                (!angular.isUndefined(value.dateOfBirth) && dateOfBirth >= maxDate && dateOfBirth <= minDate)
                )
                // check shoe width
                var shoeWidthsMatch = false;
                var shoeWidthsCounter = 0;
                for (var j = 0; j < filters.shoeWidthStrs.length; j++) {
                    if (filters.shoeWidthStrs[j].checked == true) {
                        //check if value equals
                        if (!angular.isUndefined(value.shoeWidthStr)) {
                            shoeWidthsMatch = shoeWidthsMatch || (filters.shoeWidthStrs[j].name.toUpperCase() == value.shoeWidthStr.toUpperCase());
                        }
                    } else {
                        shoeWidthsCounter++;
                    }
                }
                // none selected
                if (shoeWidthsCounter == filters.shoeWidthStrs.length) {
                    shoeWidthsMatch = true;
                }
                toAdd = toAdd && shoeWidthsMatch;

                // check glove size
                var glovesMatch = false;
                var glovesCounter = 0;
                for (var j = 0; j < filters.gloveSizes.length; j++) {
                    if (filters.gloveSizes[j].checked == true) {
                        //check if value equals
                        if (!angular.isUndefined(value.gloveSize)) {
                            glovesMatch = glovesMatch || (filters.gloveSizes[j].name.toUpperCase() == value.gloveSize.toUpperCase());
                        }
                    } else {
                        glovesCounter++;
                    }
                }
                // none selected
                if (glovesCounter == filters.gloveSizes.length) {
                    glovesMatch = true;
                }
                toAdd = toAdd && glovesMatch;

                // check jacket size
                var jacketMatch = false;
                var jacketCounter = 0;
                for (var j = 0; j < filters.jacketSizes.length; j++) {
                    if (filters.jacketSizes[j].checked == true) {
                        //check if value equals
                        if (!angular.isUndefined(value.jacketSize)) {
                            jacketMatch = jacketMatch || (filters.jacketSizes[j].name.toUpperCase() == value.jacketSize.toUpperCase());
                        }
                    } else {
                        jacketCounter++;
                    }
                }
                // none selected
                if (jacketCounter == filters.jacketSizes.length) {
                    jacketMatch = true;
                }
                toAdd = toAdd && jacketMatch;

                // check country
                if (!angular.isUndefined(filters.country) && filters.country != null && filters.country.toUpperCase() != 'ANY') {
                    if (!angular.isUndefined(value.address) && !angular.isUndefined(value.address[0])) {
                        toAdd = toAdd && ((!angular.isUndefined(value.address[0]) && value.address[0].country == filters.country) || (!angular.isUndefined(value.address[1]) && value.address[1].country == filters.country));
                    } else {
                        toAdd = false;
                    }
                }

                // set the gender
                if (filters.gender != 'both') {
                    // check the participant gender
                    toAdd = toAdd && filters.gender == value.gender;
                }

                if (toAdd) {
                    filtered.push(value);
                    count.total++;
                    //check status
                    if (value.status == "on team") {
                        count.onTeam++;
                    } else if (value.status == "drafted") {
                        count.drafted++;
                    } else if (value.status == "confirmed") {
                        count.confirmed++;
                    } else if (status == "invited") {
                        count.invited++;
                    }
                }
            }
            filters.count = count;
            return filtered;
        }
    };
});

// gets the address from a user
app.filter('getCityStateAddress', function(){
    return function(input){
        var participant = input;
        if (angular.isUndefined(participant) || angular.isUndefined(participant.address)) {
            return;
        } else {
            var address = '';
            for (var i = 0; i < participant.address.length; i++) {
                if (participant.address[i].type === "ship") {
                    address = participant.address[i].city + ", " + participant.address[i].state;
                }
            }
            return address;
        }
    };
});


app.filter('UTCDate', function($filter) {
    return function(date, format) {
        if (!date) {
            return "";
        }

        if (typeof date === 'string') {
            date = new Date(date);
        }

        if (!format) {
            format = 'MM/dd/yyyy';
        }

        var now = date;
        var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

        var formatedUTCDate =   now_utc + "/" + date.getUTCDate();
        return $filter('date')(now_utc, format);
  };
 });

app.filter('startFrom', function() {
    return function(input, idx) {
        if(angular.isUndefined(input)){
            return;
        }
        var i=idx, len=input.length, result = [];
        for (; i<len; i++)
            result.push(input[i]);
        return result;
    };
});

app.filter('truncate', function () {
    return function (text, length, end) {
        if(angular.isUndefined(text)){
            return "";
        }

        if(angular.isUndefined(length)){
            return text;
        }

        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            return String(text).substring(0, length-end.length) + end;
        }

    };
});

// This filter will format the given number as a percentage
// i.e. it will multiply the number by 100 and then floor it
// it also checks so that the number returned is always <= 100

// example: 0.75 -> 75
//          0.753 -> 75
//          0.757 -> 75
//          1 -> 100
//          50 -> 100

app.filter('percentage', function () {
    return function (number) {
        return number < 1 ? Math.floor(number * 100) : 100;
    }
});
