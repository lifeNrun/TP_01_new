# Changelog
## v82 RC for deployment on 11/27 @14:00 CST
### Features in this release
* 542,"Tester Must Be Able to Decline a Test 4 pts","closed","ShankarKamble"
* 538,"Spelling mistake - send invitation 1 pt","closed","ShankarKamble"
* 527,"fix email and case sensitivity for roster add tester 4pts","closed","ShankarKamble"
* 526,"merge email case insensitive search to add tester from roster 1pt","closed","callmekatootie"
* 525,"App Crashes when design site does not reply to authentication 2pts","closed","callmekatootie"
* 504,"Add a Tester to Roster  - Manually (see #526)4pts","closed","ShankarKamble"
* 488,"Change survey.question UI validation to allow floats to be entered 1 pt","closed","ShankarKamble"
* 475,"Update to draft tester hoover over, new modals. 4 pts","closed","ShankarKamble"
* 464,"Dynamic status bar update 15 pts","closed","tgkokk"

### Commit logs
* 2013-11-27 4bea4bd Kyle Bowerman change much to must
* 2013-11-27 9e7c655 callmekatootie Merge remote-tracking branch 'origin/542_declined_status_shankar'
* 2013-11-27 adb2724 Mithun Kamath Corrected the spacing and indentation of the code
* 2013-11-27 b1e13e7 callmekatootie Merge remote-tracking branch 'origin/488_517_shankar_float_validation'
* 2013-11-27 a20230a Shankar Kamble Merge branch '542_declined_status_shankar' of https://github.com/cloudspokes/wear-test-track0 into 542_declined_status_shankar
* 2013-11-27 e4e9559 Shankar Kamble #538 Spelling mistake - send invitation Should say: Select the date testers must respond by
* 2013-11-27 3781023 Shankar Kamble #537:-Spelling mistake - send invitation , Should say: Select the date testers must respond by
* 2013-11-27 e1d13e5 Shankar Kamble #542 :-Tester Must Be Able to Decline a Test
* 2013-11-26 24e0b13 callmekatootie Merge remote-tracking branch 'origin/525_login_Mithun'
* 2013-11-26 9b5bc5b callmekatootie Merge branch '526_roster_Mithun'
* 2013-11-26 e0dc50f Mithun Kamath Removed space between attribute and its value
* 2013-11-26 673cf5e callmekatootie #526 - Allow filter based on email in participant roster
* 2013-11-25 e62fb49 Shankar Kamble #475:- There is an error when we try accessing the "Activities" tab. http://i.imgur.com/jxJqnrs.png
* 2013-11-23 67c0839 Shankar Kamble #475 1)The scope is of type '='. Thus you need not pass the scope variable inside {{ }} 2)change activeTab to testerProfileActiveTab
* 2013-11-23 26c9fdd Shankar Kamble 1)The scope is of type '='. Thus you need not pass the scope variable inside {{ }} 2)change activeTab to testerProfileActiveTab ..
* 2013-11-22 94d06db Shankar Kamble Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 into 475_update_draft_tester_hoover_shankar
* 2013-11-20 7d87f3a callmekatootie #525 - Verify that the result object upon login as design owner contains the login details
* 2013-11-20 a69c866 callmekatootie Merge remote-tracking branch 'origin/464_tgkokk_statusBar'
* 2013-11-18 692ae53 callmekatootie Issue #528 Fix issue where Firefox does not render the charts properly



## v81 Deployed on 11/18
* 528,"FireFox - Surveys are being cut off","closed","callmekatootie"



## v80 RC for deployment on 11/8
### features in this release
 1.  512 increase modal survey window and limit text box size from running off page
 2. added survey name and survey type to admin crude tools for surveys_submitted
 3. 519 report and surveys to calculate averages to 1 decimal point and chart scales to be extended by 1 value.
 4. 515 profile completion percentage to calculate accurately even if it contains a null value.
 5. 518 prevent duplicate surveys if a survey is opened and canceled then opened and submitted in the same session
 6. 523 spell check and single space in reports (summary and tester quotes) and bulk emailer

### Commit logs
* 2013-11-08 5132d6d Kyle Bowerman issue #512 merged increase modal size Merge remote-tracking branch 'github/512_shankar_surveymodel'
* 2013-11-08 a1dd147 Kyle Bowerman added surveyType and surveyName to the adminTools Surveys_submitted crude tools
* 2013-11-08 bc0ca0d Kyle Bowerman Merge remote-tracking branch 'github/ktb_519'
* 2013-11-08 eb68c49 Kyle Bowerman Merge remote-tracking branch 'github/518_shankar_duplicate_survey'
* 2013-11-08 7f4cf7a Kyle Bowerman Merge remote-tracking branch 'github/515_profileCompletion_Mithun'
* 2013-11-08 c84eb28 Kyle Bowerman Merge branch 'master' of github.com:cloudspokes/wear-test-track0
* 2013-11-08 3207054 Kyle Bowerman add spellcheck and single spacing in bulker emailer. for issue #523
* 2013-11-08 43cac5f Kyle Bowerman add spellcheck and single spacing in bulker emailer.
* 2013-11-07 66729f6 Kyle Bowerman added tinyMCE options #523
* 2013-11-08 3c0cf24 Shankar Kamble #477 :-add surveyName and surveyType
* 2013-11-07 e50a949 Shankar Kamble #518 duplicate survey creation huber issue
* 2013-11-06 493bd95 Kyle Bowerman 1.  changed average from foor toFixed(1) 2.  increased chart max by one and decreased chart min by one so we always get a actu
* 2013-11-06 35c4a29 callmekatootie Merge remote-tracking branch 'origin/446_tgkokk_profileSurveyFix'
* 2013-11-05 dd5540d callmekatootie #515 - Fix slider issue with survey functionality using same logic as the fix for the slider issue in the profile details
* 2013-11-05 b68c96e callmekatootie #515 - remove console statements and reduce the wait period
* 2013-11-05 78d1bd6 callmekatootie #515 - more debugging
* 2013-11-05 f56dc1d callmekatootie #515 - Add some more logs to identify the cause of the null value issue
* 2013-11-05 ea30759 callmekatootie #515 - Give indication when no product images exist. Also, test the firing of event on sliders
* 2013-11-04 4c02e20 Shankar Kamble #512 :-Modal Window - Text Box exceeds the Window
* 2013-11-04 8b580b0 callmekatootie #515 - Handle null values for profile attributes

## v79 deployed on 11/4
* 2013-11-02 50da55b callmekatootie Merge branch '511_colorConsistency_Mithun'
* 2013-11-02 ab47ed3 callmekatootie Merge branch '509_donutChoices_MIthun'
* 2013-11-02 4e39f05 callmekatootie Merge branch '513_charts_Mithun'
* 2013-11-02 62857f8 callmekatootie Merge branch '514_roster_Mithun'
* 2013-11-02 f3f00ef callmekatootie #511 - Sort legend text for donut charts with keys having values appearing earlier than keys having none
* 2013-11-02 dd6f7e6 callmekatootie #509 - Remove choice 'Did not Respond' from the report donut charts as well
* 2013-11-02 3eab3a2 callmekatootie #509 - Remove 'Did Not Respond' as a possible choice for Donut Charts
* 2013-11-02 3de21e0 callmekatootie #513 - Ignore null values in the report's Rating charts too
* 2013-11-02 b29ac30 callmekatootie Issue #513 1. Ignore null values from the calculation of the rating and donut charts 2. In case there is no value for the use
* 2013-11-01 2a6ab88 callmekatootie #510 - Updated the color palette for the donut charts
* 2013-11-01 37e192b callmekatootie Issue #514 1. Fix issue where for non-team testers, the activities list would not show 2. Fix some indentation, lint errors
* 2013-10-31 36b974e callmekatootie #505 - Removed debug-only code
* 2013-10-31 a5451be callmekatootie Merge branch 'master' into 505_reportWidth_Mithun
* 2013-10-31 34e3cee callmekatootie Issue #505 1. Add word wrap feature to the legend text 2. Dynamically calculate the height of the svg (only for the final rep

## v78 deployed on 10/31
* 2013-10-30 88e27fa Kyle Bowerman Merge remote-tracking branch 'github/501_table_Mithun'
* 2013-10-30 692c63f Kyle Bowerman Merge remote-tracking branch 'github/502_performanceZone_Mithun'

## v77 deployed on 10/31
* 2013-10-30 5c4d490 callmekatootie Merge remote-tracking branch 'origin/410_two_stage_draft_eucuepo'
* 2013-10-30 e1d692b callmekatootie Merge branch '506_rte_Mithun'
* 2013-10-30 e5a1a89 callmekatootie #502 - Remove console statements
* 2013-10-30 6332f28 callmekatootie #506 - Added rich text editor to summary and quotes textarea
* 2013-10-29 84e0054 callmekatootie #503 - Fix issue where the create / edit mode of the report is not identified correctly
* 2013-10-29 3755988 callmekatootie #501 - Hide tables when there are no entries to show
* 2013-10-29 be4990a callmekatootie Issue #502 1. Data points for both negative and positive points based images were shown incorrectly in the selection 2. The c
* 2013-10-28 0b538b3 callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-10-28 2e9d925 callmekatootie Merge remote-tracking branch 'origin/479_add_location_shankar'
* 2013-10-28 eb2ea0b callmekatootie Merge remote-tracking branch 'origin/481_tgkokk_imageFormattingBug'
* 2013-10-28 b96edba Kyle Bowerman update change log for v76

## v76 RC for deployment on 10/28
* 2013-10-28 43b40b6 callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-10-28 a9be9d1 callmekatootie Merge branch '484_charts_mithun'
* 2013-10-26 062868b callmekatootie #484 - Show labels even if value is zero
* 2013-10-26 b3d2977 Eugenio Cuevas Merge pull request #497 from cloudspokes/410_two_stage_draft_eucuepo
* 2013-10-26 105a8b3 callmekatootie #484 - reduce the height of the cells in the table for surveys
* 2013-10-26 711700e callmekatootie Issue #484 - Remove extra space from the top of the svg
* 2013-10-26 d4e1cb8 callmekatootie Issue #484 1. Removed the decimal part of the donut chart label 2. Updated the font size and family based on Kyle's feed
* 2013-10-26 da83ea4 callmekatootie Merge branch '487_reportLayout_Mithun'
* 2013-10-25 4e48173 callmekatootie Issue #484 1. Introduce additional control parameters to the donut chart directive 2. Display two donut charts per row i
* 2013-10-24 4c696ae callmekatootie #487 - Restore page break before wear and tear
* 2013-10-24 97785f9 callmekatootie #487 - Remove page break before Wear Test since it introduces scrollbar

### Features in this release

**484** donut charts are now three across and include 0 submission values

**497** reset button on bio draft section 

**484** improve whitespace above and below donuts and in comments

**487** improved chart layouts

##  v75 RC for deployment on 10/25

* 2013-10-24 802f18f callmekatootie Merge branch '486_summary_Mithun'
* 2013-10-24 cc28856 callmekatootie #489 - Fix issue where errors in validation would prevent the survey from being submitted again
* 2013-10-23 c9bd962 callmekatootie #489 - Prevent surveys from being submitted when a survey submission is already in progress:
* 2013-10-23 0e081e9 callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-10-23 2bce963 callmekatootie Merge remote-tracking branch 'origin/459_send_email_button_cut_off_shankar'
* 2013-10-23 b5d1e27 callmekatootie #487 - Add page breaks
* 2013-10-22 d9b9aef callmekatootie #486 - Add tester quotes to the report builder

### Features in this release

**486** Tester quote section on report builder

**489** Prevents double click survey submisison duplicates

**459** prevents submit button cut off for long surveys and low res browsers

**487** add page breaks on print view

## v74 RC for deployment on 10/21

### Features in this release

**460** report builder feedback

* fix nav - existing new/ back and forth
* order by trigger date for surveys
* add comments under response

**374** brief deletion

**451** report builder update
 
 * PZ - If Select all negative and positive is selected, then the other two options are disabled. If select either negative or positive point is selected, then the select all option is disabled.
 * Survey Color Key
 * click include all the graphs the comments should be mutually exclusive
 * Correct spelling
  * fixed location issues not being able to retrieve reports

**471** update percent complete
 
**466** drop required capital in password

**380** update to slider

**461** unauthenticated product tests link

**467** forgot password 2 api calls

**450** - activity log export data

* 2013-10-19 b5f06e9 callmekatootie #460 - fix dropdown navigation using styling from prototype
* 2013-10-19 07f96b5 callmekatootie Merge remote-tracking branch 'origin/374_Shankar_deletion_weartest'
* 2013-10-19 8d379cd callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-10-19 ec7a931 callmekatootie Merge branch '451_report_mithun'
* 2013-10-19 64b5425 callmekatootie Issue #460 1. Fix issue where clicking the links in the dropdown did not work properly 2. Display the surveys based on the delivery date registered for the survey in the we
* 2013-10-18 09f20df Shankar Kamble #374 :-you need to add it to the Admin page as well login as admin > Product Test tab > View Draft tab
* 2013-10-18 b9c2b8c Shankar Kamble Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 into 374_Shankar_deletion_weartest
* 2013-10-17 3ca779b mcards13 updated text
* 2013-10-18 f45b219 callmekatootie Merge remote-tracking branch 'origin/380-rating-eucuepo'
* 2013-10-18 9b6e4c1 callmekatootie Merge branch '471_score_mithun'
* 2013-10-18 16d9fb1 callmekatootie Merge branch '466_password_mithun'
* 2013-10-17 a3a0575 callmekatootie #471 - Exclude seat measurement for males
* 2013-10-17 57dcdcb callmekatootie Issue #451 - Mike's testing 1. Rename INSTRUCTIONS to INSTRUCTION in the final report 2. Use the shipping address instead of the mailing address in the tester locations
* 2013-10-14 e54bfff callmekatootie Issue #451 1. Show all options for a question in a donut chart rather than only those options that were selected 2. Include All in the survey section now split into Include
* 2013-10-14 2a9cb85 callmekatootie Issue #451 - Disable selection of data points of a particular color based on the existing selection for an image
bash-3.2$ git log --since 11.days --date=short --pretty=format:"* %cd %h %an %s"
* 2013-10-19 b5f06e9 callmekatootie #460 - fix dropdown navigation using styling from prototype
* 2013-10-19 07f96b5 callmekatootie Merge remote-tracking branch 'origin/374_Shankar_deletion_weartest'
* 2013-10-19 8d379cd callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-10-19 ec7a931 callmekatootie Merge branch '451_report_mithun'
* 2013-10-19 64b5425 callmekatootie Issue #460 1. Fix issue where clicking the links in the dropdown did not work properly 2. Display the surveys based on the delivery date registered for the survey in the we
* 2013-10-18 09f20df Shankar Kamble #374 :-you need to add it to the Admin page as well login as admin > Product Test tab > View Draft tab
* 2013-10-18 b9c2b8c Shankar Kamble Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 into 374_Shankar_deletion_weartest
* 2013-10-17 3ca779b mcards13 updated text
* 2013-10-18 f45b219 callmekatootie Merge remote-tracking branch 'origin/380-rating-eucuepo'
* 2013-10-18 9b6e4c1 callmekatootie Merge branch '471_score_mithun'
* 2013-10-18 16d9fb1 callmekatootie Merge branch '466_password_mithun'
* 2013-10-17 a3a0575 callmekatootie #471 - Exclude seat measurement for males
* 2013-10-17 57dcdcb callmekatootie Issue #451 - Mike's testing 1. Rename INSTRUCTIONS to INSTRUCTION in the final report 2. Use the shipping address instead of the mailing address in the tester locations
* 2013-10-14 e54bfff callmekatootie Issue #451 1. Show all options for a question in a donut chart rather than only those options that were selected 2. Include All in the survey section now split into Include
* 2013-10-14 2a9cb85 callmekatootie Issue #451 - Disable selection of data points of a particular color based on the existing selection for an image
* 2013-10-12 3418a42 callmekatootie Merge remote-tracking branch 'origin/461_tgkokk_recentLink'
* 2013-10-11 17f4808 callmekatootie #467 - Remove ng-submit from form and add ng-click to reset password action
* 2013-10-11 40caf19 callmekatootie #467 - Remove ng-click from submit
* 2013-10-11 dfa0e1f callmekatootie #467 - Restore ng-submit and remove multiple submit buttons
* 2013-10-11 25762e7 callmekatootie Merge remote-tracking branch 'origin/450_export_log_mithun'
* 2013-10-11 eeba80f callmekatootie #450 - Correct the text on the button
* 2013-10-11 9ad6001 tgkokk #461: Link is now orange
* 2013-10-11 9f5621e callmekatootie Issue #450 1. Provide Export activity log functionality to a brand user 2. Replace ng-disabled with ng-hide for export survey since disabled attribute is not supported for 
* 2013-10-10 5bbcc10 Kyle Bowerman update change log
* 2013-10-10 45aa2c7 Kyle Bowerman updates to static data waist size and changelog


## v73 deployed on 10/10/2013 at 1700 CDT
* 2013-10-11 a073cf5 Shankar Kamble #467 :- fixed Forgot password link generates two api calls / resets / emails with IE
* 2013-10-10 1384085 Kyle Bowerman updates to eugeinos draft,  removed 500 limit and change country to any
* 2013-10-10 05d64db callmekatootie #468 - Remove console messages
* 2013-10-10 ad34146 callmekatootie Issue #468 1. Remove the determination of min and max values for the horizontal chart from the logic of determining the average 2. Bypass the user filter to fetch all answers for the
* 2013-10-09 2b668fb Eugenio Cuevas Pozuelo #4#410 add loading message, any country and show first 4 survey questions
* 2013-10-08 9481043 Eugenio Cuevas Merge pull request #465 from cloudspokes/master
* 2013-10-08 0177535 callmekatootie Merge remote-tracking branch 'origin/462_tgkokk_specialChars'
* 2013-10-08 e19196c tgkokk For #462: Fix issue with special characters in URL
* 2013-10-08 42b7969 callmekatootie Issue #458 1. Introduce fill property for horizontal chart styling 2. Remove svg gradients
* 2013-10-07 9da9ff1 tgkokk Merge branch 'master' into 407_tgkokk_selectAll
* 2013-10-07 de63b71 Eugenio Cuevas Pozuelo added whitespace to label
* 2013-10-06 4020ce9 Eugenio Cuevas Pozuelo merge with master erge branch 'master' of https://github.com/cloudspokes/wear-test-track0 into 410_two_stage_draft_eucuepo
* 2013-10-06 47539f4 Eugenio Cuevas Pozuelo #410 update with new requirements

### v72 deployed on 10/7/2013

* 2013-10-05 1922c77 callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-10-05 25108c2 callmekatootie #338 - Fix issue where button would not be disabled when reset is in progress
* 2013-10-05 0a76325 callmekatootie Issue #338 1. Use the prototype to display the forgot password page 2. Borrow the controller and the server handler logic from shankar's branch

### v71 deployed on 10.3.2013 22:00 CDT
* 2013-10-03 c290972 callmekatootie Merge commit '412a500bb05a82d28955e0c61b12d7280b95a82c' Merge tgkokk_emailIssues until the above SHA (sans merge with Shankar's code)
 *this includes bulk emails and roster emails but not password reset*
* 2013-10-03 71df80c callmekatootie #448 - Delete ID of question when copying
* 2013-10-03 85525ab callmekatootie #448 - Include Wear Test Surveys
* 2013-10-03 67dbfb7 callmekatootie Issue #448 1. Remove the activity logs item from the admin and replace with correction report 2. Have logic to determine the rogue surveys in the controller 3. Prepare a view of the 
* 2013-10-01 412a500 tgkokk Merge branch 'master' into tgkokk_emailIssues
* 2013-10-02 48d1402 callmekatootie Merge branch 'master' into 370_sizing_mithun
* 2013-10-02 c2c3701 callmekatootie #370 - Change step size of weight to 1 from 50
* 2013-10-02 09f7ab8 callmekatootie #370 - Fix merging issue where slider is off by 2
* 2013-10-02 3a5651b callmekatootie #370 - Display seat measurement only for female user types
* 2013-10-02 9bc3f30 callmekatootie #370 - Fix issue where a script error on the toFixed() method occurs in the console for thigh, seat, shoulder, biceps and chest attributes editing
* 2013-10-02 b60a1d6 callmekatootie Merge remote-tracking branch 'origin/431_shankarBrand_Survey_Archive'
* 2013-10-02 48230ad callmekatootie Issue #370 1. Update the styling for the profile / registration modals (sync with prototype) 2. Update the styling for the non-restricted pages (sync with prototype) 3. Update the ra
* 2013-10-01 301c1d0 callmekatootie Merge branch '181_report_builder_mithun'
* 2013-09-30 b0c220a tgkokk Merge branch 'master' into tgkokk_emailIssues
* 2013-09-30 c5d48f8 callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-09-30 ea49ba4 callmekatootie Merge remote-tracking branch 'origin/180_tgkokk_surveyErrors'
* 2013-09-30 99e57ef callmekatootie #438 - Include all points in image
* 2013-09-30 8031afa callmekatootie #438 - Add image word
* 2013-09-30 0db98b7 callmekatootie Issue #438 1. Provide mutually exclusive feature in the images 2. Hide sections for which there is no data 3. Dynamically populate the averages 4. Display occupations and locations a
* 2013-09-30 987bd7d callmekatootie #438 - Add word 'image' to the images in the performance zones
* 2013-09-28 2b197cd Kyle Bowerman updated changelog for v68 deployment


### v68 deployed on 9.28.2013 22:00 CDT
* 2013-09-28 580eced callmekatootie Restore node version in package manager to accomodate updates to heroku
* 2013-09-28 21606fa callmekatootie Merge remote-tracking branch 'origin/427_tgkokk_addTrailingSlash'
* 2013-09-28 6164072 callmekatootie #181 - Fix formatting of the final report for print purposes
* 2013-09-28 c5d013c Shankar Kamble #441 :- fixed Tester: activity profile tweeks
* 2013-09-27 a3062a9 Kyle Bowerman updated package to limit to 0.10.18

### v67 deployed on 9.26.2013
* 2013-09-26 2e78f53 Shankar Kamble #437 :- Can submit two profile surveys in a row
* 2013-09-25 13c0f3d Kyle Bowerman updated report builder tooltips
* 2013-09-26 13e7606 callmekatootie #181 - Correct the placeholder for the textarea for the summary
* 2013-09-26 11d2c4f callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-09-26 70479df callmekatootie #181 - Change button text to aid demo

### v66 deployed on 9.25.2013

* 2013-09-24 8921ca3 Kyle Bowerman update changelog for v64
* 2013-09-25 c2f4f73 callmekatootie Merge branch 'master' into 181_report_builder_mithun
* 2013-09-25 70edbb1 callmekatootie Issue #181 1. Improvements - did not keep track of them 2. Create the page that will be the final page which gets converted to PDF 3. Provide supplementary code to aid the display of t
* 2013-09-24 fc451cf callmekatootie #423 - Fix issue where rules are not being shown / uploaded
## v64 deployed on 9/24/2013
* 2013-09-24 cdc4560 Shankar Kamble #428 fixed fuplicate survey submiited
* 2013-09-24 85ab1cf Shankar Kamble #428 :- Fixed AL / Survey / PZ stability bugs
* 2013-09-24 13e94dc Kyle Bowerman fix for #433 roster now uses ship address
* 2013-09-24 fc451cf callmekatootie #423 - Fix issue where rules are not being shown / uploaded
* 2013-09-23 f186af4 callmekatootie Merge remote-tracking branch 'origin/409_shankar_userActivity'
* 2013-09-21 d91c702 callmekatootie HOTFIX - #424 1. Fix issue where when a wear test's dashboard is opened, the image for the wear test is not seen 2. Fix issue where navigation from survey to rules while editing wear test was not possible
* 2013-09-20 a209415 callmekatootie Merge remote-tracking branch 'origin/eucuepo_branch'
* 2013-09-20 ebb9260 callmekatootie Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0
* 2013-09-20 5264259 callmekatootie #418 - HOTFIX - Tester's participation in Wear Tests are now being shown
* 2013-09-19 89ee6b7 Kyle Bowerman update to change log

## v63 deployed on 9/19/2013
* 2013-09-19 a03f963 tgkokk Changed according to Mithun's comments
* 2013-09-19 f2f14a3 tgkokk Fixed admin tab issue
* 2013-09-19 4515b43 tgkokk HOTFIX: Fix brand creating brief issue
* 2013-09-20 87eb735 callmekatootie Merge remote-tracking branch 'origin/398_lfname_eucuepo'
* 2013-09-19 6c2d453 callmekatootie #292 - HOTFIX - Error when accessing template files
* 2013-09-19 5bc2f6b callmekatootie Merge remote-tracking branch 'origin/337_tgkokk_surveyBuilder'
* 2013-09-19 f8fc053 callmekatootie Merge remote-tracking branch 'origin/402_css_branch'
* 2013-09-19 8b7ebe1 callmekatootie 1. #340 - Crop the images to fit in their containers rather than scale
* 2013-09-19 9fdd9d6 callmekatootie Merge remote-tracking branch 'origin/339_tgkokk_linkUpdates'
* 2013-09-18 1b2ba65 callmekatootie 1. #292 - Add timestamp to all GET requests to resolve IE cache trouble
* 2013-09-18 28b50e5 Eugenio Cuevas Pozuelo modify comma
* 2013-09-17 9b05cba tgkokk #337: Admin survey management with building, editing and deleting survey functionality
* 2013-09-17 eb92bf4 Eugenio Cuevas Pozuelo add first name and last name to roster popover if tester is on team
* 2013-09-16 8efbe42 Eugenio Cuevas Pozuelo fix css on sliders
* 2013-09-16 8ce27cb callmekatootie Merge branch 'release_candidate'
* 2013-09-13 09ba9ce callmekatootie Merge branch 'master' of heroku.com:weartest-staging into release_candidate
* 2013-09-13 e7836f8 tgkokk #339: Fixed admin page
* 2013-09-13 df8c90f callmekatootie Merge remote-tracking branch 'origin/365_eucuepo_draft'
* 2013-09-12 fdf67e5 Eugenio Cuevas Pozuelo fix max number
* 2013-09-12 cd8c634 Eugenio Cuevas Pozuelo fix weight
* 2013-09-13 ba69b23 callmekatootie 360 - Reduce the size of the text
* 2013-09-13 92d9b82 callmekatootie #360 - Skip registration for recurring users below 13 years of age
* 2013-09-13 3bb08e2 callmekatootie #366 - Replace attribute shoeWidth with shoeWidthStr and adjust the correction factor
* 2013-09-13 f309656 callmekatootie #359 - Set the default value of intensity as 1 instead of 0.01
* 2013-09-13 42cb5d6 callmekatootie Merge remote-tracking branch 'origin/365_eucuepo_draft'
* 2013-09-13 51c3671 callmekatootie Fix indentation issues
* 2013-09-13 4b17c49 callmekatootie Merge remote-tracking branch 'origin/354_gender_shankar'
* 2013-09-13 033bd69 callmekatootie Merge commit 'f4ea1b6f9f0fec0ff2c6f635ed9c55a00aa38b5c'
* 2013-09-12 04e5ac2 Eugenio Cuevas Pozuelo fix slider values
* 2013-09-13 eae3eb5 callmekatootie #359 - Set the default value of intensity as 1 instead of 0.01
* 2013-09-13 151cda7 callmekatootie #366 - Replace attribute shoeWidth with shoeWidthStr and adjust the correction factor
* 2013-09-12 05891ae callmekatootie 360 - Reduce the size of the text
* 2013-09-12 dd4e447 callmekatootie #360 - Skip registration for recurring users below 13 years of age
* 2013-09-12 0a71e39 callmekatootie #83 - Fix issue where entering non-numeric value in required number of testers would fail to 
* 2013-09-12 0afc5ed callmekatootie 1. #83 - Allow the user to navigate to respective step of the wear test based on the origin o
* 2013-09-11 bec7a24 mcards13 updated txt
* 2013-09-11 82f4acd mcards13 updated error messages
* 2013-09-11 d47184f mcards13 text updates for consistency
* 2013-09-12 7e84c04 callmekatootie Sync styling with prototype
* 2013-09-12 b6b83f2 callmekatootie #83 - Calculate score of Wear Test only when activating (by admin)
* 2013-09-12 c011517 callmekatootie 1. #83 - Allow validations for a wear test 2. Replace all occurrences of .id with ._id 3. Whi
* 2013-09-11 f4ea1b6 callmekatootie 1. #361 - Allow activation of wear tests without validation 2. Fix the format of the end of w
* 2013-09-11 17fc964 tgkokk #339: Fix tabs yet again and fix mismatched ending tags
* 2013-09-11 2af8567 tgkokk #339: Fix URL when changing edit tabs by clicking on them
* 2013-09-11 1600e13 tgkokk #339: Fix redirect issue
* 2013-09-11 b457501 tgkokk #339: Fix 'Go to Draft'
* 2013-09-11 21d085b tgkokk #339: Remove trailing whitespace
* 2013-09-11 2e19b41 tgkokk #339: HOTFIX
* 2013-09-11 b743f96 tgkokk #339: New links and fixes
* 2013-09-10 77194db Kyle Bowerman update changelog
## v62 deployed on 9/10/2013
* 2013-09-11 22e9fd2 callmekatootie  #28 - Display the link to activate the weartest as a button 
* 2013-09-11 a9b34cc callmekatootie  Merge remote-tracking branch 'origin/260_tgkokk_ipBlock' 
* 2013-09-10 f2a5084 callmekatootie  Sync styling with prototype 
* 2013-09-10 822bdcb callmekatootie  #28 - Fix issue where empty conditions or terrain for an activity log would not save the activity log and thus not contribute towards the score 
* 2013-09-10 778d131 callmekatootie  Sync styling with prototype 
* 2013-09-10 dd1f04d callmekatootie  #28 - Sync positioning of the score progress with the prototype 
* 2013-09-10 2e2f3d5 callmekatootie  Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 
* 2013-09-10 4842e26 callmekatootie  1. #28 - Replace chart with progress bar 2. Show the total score in the weartest preview and the participant roster 
* 2013-09-10 670eea4 Kyle Bowerman  added subject to blogContent crud tools 
* 2013-09-10 83f4da6 callmekatootie  #28 - Fix issue where performance zones and wear and tear would incorrectly contribute scores due to a delay in update 
* 2013-09-10 4273709 callmekatootie  Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 
* 2013-09-10 88bcf67 callmekatootie  #28 - Fix issue where score would be calculated incorrectly if activity logs were not updated in time 
* 2013-09-09 ad9fa51 mcards13  updated link 
* 2013-09-09 ccd3e95 mcards13  updated link 
* 2013-09-09 5f6ba22 callmekatootie  HOTFIX: Fix issue where HTTP urls are not working 
* 2013-09-09 8cb6751 callmekatootie  #28 - Fix issue where submitting a survey would have no effect on the score 
* 2013-09-09 0d7cf44 tgkokk  Merge branch 'master' into 260_tgkokk_ipBlock 
* 2013-09-09 e7eb05d callmekatootie  #28 - Calculate the participant score 
* 2013-09-09 f071c11 callmekatootie  Merge remote-tracking branch 'origin/surveys_submitted_crud_tools_319' 
* 2013-09-09 504b7b6 callmekatootie  1. #28 - Calculate the total score for a Wear Test 2. Fix issue where expected activity log count is incorrectly calculated for daily and weekly 3. Housekeeping 
* 2013-09-08 18fa6d7 tgkokk  #260: Right message is showing and progress bar is hidden 
* 2013-09-08 8a59052 tgkokk  #260: Hide everything except the message 
* 2013-09-08 f36e49e callmekatootie  #355 - Redirect Design user types to dedicated registration page 
* 2013-09-06 b25879d tgkokk  #260: IP block 
* 2013-09-07 ec48669 Shankar Kamble  #319 :- code review 
* 2013-09-07 aa89c90 Shankar Kamble  #319 :- Code review changes 
* 2013-09-07 f7a774b Shankar Kamble  Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 into surveys_submitted_crud_tools_319 
* 2013-09-06 92ac904 callmekatootie  Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 
* 2013-09-06 0f4d6eb callmekatootie  #350 - Fix issue where lengthy URL resulted in a failed GET request 
* 2013-09-05 e8361fc mcards13  updated txt 
* 2013-09-05 307e5b4 callmekatootie  #341 - Remove ISOString conversion to verify the correct display of activity log date 
* 2013-09-05 ef4c4c1 callmekatootie  Housekeeping changes 
* 2013-09-05 00e1730 callmekatootie  #334 - Adjust spacing 
* 2013-09-05 991a5ee callmekatootie  #334 - Sync login page with the prototype 

## v61 deployed on 9/4/2013
* 2013-09-04 00f7951 callmekatootie  Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 
* 2013-09-04 9640a01 callmekatootie  #334 - Provide functionality to allow designers to login and be redirected to their home page 
* 2013-09-04 9f2ca1a mcards13  updated links 

## v58 deployed on 9/3/2013
* 2013-09-03 30a43cc callmekatootie  Merge remote-tracking branch 'origin/313_shankar_admin_weartest' 
* 2013-09-03 f42466d Shankar Kamble  #313 :- Code indentation at line 240 
* 2013-09-03 dbe2af1 Kyle Bowerman  fix for #335 Google /adwords/SEO close 
* 2013-09-03 9be8423 mcards13  fixed text 
* 2013-09-03 c3d7c0f callmekatootie  Disable modal to change score in participant roster 
* 2013-09-03 f639513 callmekatootie  #329 - Fix the link for Design Community 
* 2013-09-03 d42e353 callmekatootie  #329 - Fix footer Spacing 
* 2013-09-03 37f3fed callmekatootie  #329 - Fix merge conflicts 
* 2013-09-03 9061857 callmekatootie  Merge remote-tracking branch 'origin/329_follow_up' 
* 2013-09-03 c044099 callmekatootie  Merge branch 'master' of https://github.com/cloudspokes/wear-test-track0 
* 2013-09-03 36f9833 callmekatootie  Merge remote-tracking branch 'origin/59_tgkokk_surveyValidation' 
* 2013-09-03 8f78939 mcards13  updated footer links 
* 2013-09-03 bd97e7e tgkokk  #329: Fix unable to log in issue 
* 2013-09-03 7d36f97 tgkokk  Merge branch '329_tgkokk_footerUpdates' into 329_follow_up 
* 2013-09-02 f086222 callmekatootie  #252 - Remove unseen items from legend for donut chart. Make the starting scale for rating to be the minimum value of the rating 
* 2013-09-02 26005d6 Shankar Kamble  #313 :- Code indentation 
* 2013-09-02 3268f61 Shankar Kamble  #313 :- Code indentation 
* 2013-09-02 28b2f60 Shankar Kamble  #313 code indentation 
* 2013-09-02 44c8690 tgkokk  #59: Changes according to Mithun's comments 
* 2013-09-02 0c61098 callmekatootie  #252 - fix the width of the canvas 
* 2013-08-31 c86a961 Shankar Kamble  #319 :- Indentation 
* 2013-08-31 bb49d52 Shankar Kamble  #319 :-Fixed create surveys_submitted in admin crud tools 
* 2013-08-31 5120d09 callmekatootie  #322 - Provide instruction text for the Image upload modal when upload images for Wear and Tear 
* 2013-08-31 5e38d7b callmekatootie  #318 - Update login page to be in sync with mockup. Also, update the restricted styling 
* 2013-08-31 b7a7d7b callmekatootie  #252 - Reduce the size of the user selection 
* 2013-08-31 9e6828a callmekatootie  #252 - Make the Export Survey button in line with the neighbouring dropdown selection 
* 2013-08-31 565e089 callmekatootie  #252 - Improve the positioning of the legen 
* 2013-08-31 a50f7b3 callmekatootie  #252 - Improve the display of the Donut Charts. Introduce legend for it and position the elements properly 
* 2013-08-31 29ca793 callmekatootie  #324 - Fix issue of display and edit of the submitted surveys 
* 2013-08-31 418ca05 callmekatootie  #324 - FIx issue of dispalying data for multiple selections 
* 2013-08-30 0beeb6d callmekatootie  #324 - Fix error while submitting profile surveys 
* 2013-08-30 79800ac tgkokk  #329: Footer is spaced correctly 
* 2013-08-30 f5571f8 callmekatootie  #310 - Handle login, restricted access and redirects elegantly 
* 2013-08-30 b13984f tgkokk  #329: PDFs force-download 
* 2013-08-30 4bee094 tgkokk  #329: PDFs now open in new tab 
* 2013-08-30 7bd5c36 tgkokk  #329: Changes to footer and nav pages 
* 2013-08-30 4697427 tgkokk  Added .DS_Store to .gitignore 
* 2013-08-30 b189176 callmekatootie  #321 - Allow user to navigate to home page from registration page 
* 2013-08-30 83798a3 tgkokk  Merge branch 'master' into 59_tgkokk_surveyValidation 
* 2013-08-30 edd21b1 callmekatootie  Merge remote-tracking branch 'origin/298_shankar_passwdModal' 
* 2013-08-30 0f75cb9 tgkokk  Merge branch 'master' into 59_tgkokk_surveyValidation 
* 2013-08-30 1af6c75 Shankar Kamble  #298 Code Review Change 
* 2013-08-29 8e0143a Kyle Bowerman  changelog added #328 close 

## v0.5.2 deployed on 8/29/2013
### commit 5402af
* 327 Hot fix changes to an imageset of a wear test
* 323 add orange version of favicon for mesh Opened by kbowerma 
* 320 Roster Fix Drop Down Integration tasks Ready for Review Opened by mcards13 
* 315 Survey Builder Tooltip (1pt) Ready for Review Opened by mcards13 
* 314 Export Survey Data Ready for Review Opened by mcards13 2 days ago   
* 307 Footer Consolidation (1pt) Ready for Review Opened by mcards13 6 days ago   
* 305 create an info tab on the admin tools that points to an empty partial (2pts) Integration tasks Ready for Review Opened by kbowerma 
* 299 Security update 2 6pts Integration tasks Medium Ready for Review Opened by kbowerma 
* 278 Roster Karma - Add the Ability to Update Karma (2pt) Integration tasks Ready for Review Opened by mcards13 
* 256 Activate weartest in crud tools 3pts Ready for Review Opened by kbowerma 
* 194 Add Survey Preview to Step 4 of Brief Creation (2pt) Integration tasks Ready for Review Opened by mcards13 