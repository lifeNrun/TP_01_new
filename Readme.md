# Overview 
 This code is the base code for our wear test series.  It maybe in one or more private cloudspokes github repos.  In the challenge post registration details you will be given instructions from where to clone this source.   You may also need to get the latest copy of the application-configuration.js file which contains the connection strings to the api and contains keys to the cloudinary api and may contain other keys.

The doc folder contains **some** readme specific to challenges but not all.   If you would like specific documentation or code from previous submission please request it from me (kyle@cloudspokes.com).   You may need to update the api hosts from time to time in the application-configuration.js file, as instructed in the challenge post reg details.

## Installation
To launch the application:
1. Run $ npm install
2. Run $ node app.js
3. Open your browser and load the URL http://localhost:3000
4. You should be given some test logins in the post registration details but you can always create your own.
5. Be mindufl when delete records.   We are all using the same datastore so only delete records you created.
6. Be sure to review the docs/Guidelines.txt and docs/changelog.md before you get started.
7. You may clone the github repo or fork it.   If you fork it be sure to understand that your fork will be viewable to other members until we remove it from the wear-test team, which we try to do right away, however we at cloudspokes will still be able to see it.   Likewise if you submit your code via a pull request other members in the wear-test challenge wont be able to browse your forked repo but they will be able to view the changes in your code.  For that reason, if you are concerned about having your code viewable by other members we suggest you don't do a pull request and submit it as a zip. 
8.  If a challenge requires you to deploy your solution to Heroku it will be expressed in the submission details, if it not required it is still a good idea that way you will know if there is a problem with you dependencies and can guarantee we are see the same thing as you are.

## Tracks
This code may be duplicated in more than one repo so we can run concurrent challenges. We are calling these separate code streams "tracks".   The goal is to have the separate tracks to be working on separate components, that way their will be fewer conflicts when we merge them back to the core.

## All features support in this track
1. Landing page uses an imageset for the carousel
1. Registration works for all three types
1. login as cs_tester | activity logs skeleton exists from previous static mockups
1. login as cs_admin | admin tools, crude tool includes all current objects but not all fields



## TODO
1. Karma and or mocha test cases
1. Password is passed without any hashing. This needs to be changed, --supported in Horse API but not testeted
1. API-key -- supported in horse but not yet tested
1. Login using social networks. As of now, only user name and password based login exist
1. Re-introduce  login through social networks. Note: UI already is ready to handle this - I just need to provide backend support
1.  need to rewrite them based on the updated controllers and views
1. Need to check for the uniqueness of user name, had this once need to find it and put it back in
1. Need to check if the user has provided the value in a registration entry before proceeding with the next question
1. make the carousel imageset a configuration setting

 ### API
1. The collection on mongodb is blogcontents and the api endpoint is http://bowerman-meshapi-goat.herokuapp.com/blogContents?query={} and the schema is blogContents this needs to be fixed,  I am not sure how the api is pointing to the mongodb collection called blogcontents but I renamed blogContents to xblogContents to prove it was the right one.
1. Return record count in fetch

### 2312 new todos
1.  Replace jQuery carosel with angular-ui carousel (http://angular-ui.github.io/bootstrap/)
1.  replace js/script.js with a better solution
1.  checkout lines 82-87 to see if I really need it. in index.html
1.  fix the our partners so the images are much smaller and scroll like Jan3594 Submission (http://www.youtube.com/watch?v=OKv4BDGkjb8) 
1. take  the header and footers at loging and post login like Jan3594 did (https://s3.amazonaws.com/cs-production/challenges/2312/jan3594/wear-test-pre-hawk.zip)
1.  replace the nav-bar with header that Jan3594 did (see pervious)