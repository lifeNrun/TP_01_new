dashboardApp.factory('Surveys', [
function () {
    'use strict';

    return {
        /*
        Returns the correct question number in a survey by ignoring questions
        of type 'Title / Header'
        */
        getQuestionNumber: function (actualIndex, surveyQuestions) {
            var questionNumber = 0,
                i;

            //If question at that index itself is of type 'Title / Header', return 0 as the number
            if (surveyQuestions[actualIndex - 1].type === 'Title / Header') {
                return 0;
            }

            for (i = 0; i < actualIndex; i++) {
                if (surveyQuestions[i].type === 'Title / Header') {
                    //Ignore
                    continue;
                }

                questionNumber += 1;
            }

            return questionNumber;
        }
    };
}
]);
