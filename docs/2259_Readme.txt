Submission for challenge #2249 of Cloudspokes

To launch the application:
1. Run $ npm install
2. Run $ node app.js
3. Open your browser and load the URL http://localhost:3000

****************************************************************
*Things to know before enhancing / understanding this application*
****************************************************************
	I will not be highlighting that you need to know nodeJs and expressJs here - those
	are but understood. I will highlight the other dependencies and functionalities
	used in this application

	1. Passport
		This nodeJs module is used in this application to authenticate the user.
		Excellent and easy to use / understand module.
		Suggested reading available at http://passportjs.org/guide/

	2. Document Structure
		This application has been enhanced not only in terms of the code, but also
		in terms of the application structure. The document structure followed
		can be found under https://github.com/btford/angular-express-seed#directory-layout which clearly explains the purpose of each file.
		In addition to this, all directives pertaining to registration are located
		under public/js/directives.js - The corresponding template files are located
		under views/partials/registration/

		Restricted templates, that is, templates for which authentication is needed
		are located under views/partials/restricted

		Instead of having multiple configuration files, a single configuration file
		is created under config/application-configuration.js
		This file contains only those configurations that I came across when restructuring the code - but it is expected that all future configurations
		are mapped in this file only. The other two files under config can be discarded.


*********************************
*Issues with the old application*
*********************************
	This section highlights the issues with the old application. This also implies that
	the issues highlighted here have been fixed in the new application.

	1. onclick used instead of ng-click in some pieces of the HTML code for the views
	2. The application did not seem to be a single page application. For example, there
		was a different page altogether when a user is logged in as opposed to when a
		user is not instead of having a different view
	3. The application structure is incorrect. For example, I fail to understand why 
		CSS, JS and Image files are located in the Views folder! This is now corrected
		and follows the structure described in the Angular-Express Seed Repository
		which can be found here: https://github.com/btford/angular-express-seed


*******************************************************
*Changes that were requested and have been carried out*
*******************************************************
	This section highlights the changes that were requested for the weartest-dev 
	application that have been carried out - these requests were mentioned in the
	README.md file of the application

	1. Remove ejs dependency
		Static HTML files are being served. No templates are being used (outside the 
		scope of AngularJS that is). For example, jade and ejs based templates have
		been removed.
		However, ejs is still needed to render the HTML files (files with .html 
		extension). Thus, jade and ejs based templates have been removed but ejs 
		dependency itself has not since it is needed to render the HTML file. ejs 
		templates however are not used - simple HTML files are used.

	2. Follow better directory structure
		Done! This is the first action carried out since the old directory structure
		was not only incorrect, it was highly frowned upon way of structuring the
		application

	3. Central location for API configuration
		Basically, what I observed is that the configuration was being referenced
		from the client and from the sever - both were accessing the configuration.
		In this restructured application, only server can access the configuration.
		The client simply makes requests and the sever routes them accordingly.
		The client is not bothered with the API configurations

*****************************************************************
*Functionalities that existed, but are now broken / do not exist*
*****************************************************************
	1. Ability to display sections in the registration questionnaire
		This has been intentionally left out. The old behaviour was
		to identify the question type and based on the question type 
		'Section' the sections were displayed.
		However, the model in this case is incorrect.
		A survey should consist of sections and the sections should
		consist of questions. By marking a question itself as a section,
		we have a poor way of identifying a section. Following would be
		an ideal model for the survey:
		survey: [
			{
				sectionName: "Section 1"
				//Other attributes of a section
				questions: [
					{
						//the regular question model that we have currently
					}
				]
			}
		]

		Since the model is incorrect, the view will be incorrect.
		In AngularJS, the model drives the view, not the other way around.
		Thus, if the model is corrected, then we can have a 
		corresponding view for the model.

	2. Social Network Logins
		This has been left out as well as part of the restructuring
		of this application.
		The amount of code refactoring performed to make this 
		application conform to the best practices of AngularJS has
		been overwhelming. I will certainly proceed to add this
		functionality but my submission for the challenge 2249 will
		not contain this. I will add this soon though.
