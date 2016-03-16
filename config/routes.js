module.exports = exports = [
    {
        path: '/api/misc/video',
        verb: 'GET',
        authenticationRequired: true,
        controller: 'misc',
        method: 'getVimeoVideo'
    },
    {
        path: '/api/misc/video/:vimeoVideoId',
        verb: 'GET',
        authenticationRequired: true,
        controller: 'misc',
        method: 'getVimeoVideo'
    },
    {
        path: '/api/misc/video',
        verb: 'POST',
        authenticationRequired: true,
        controller: 'misc',
        method: 'getVimeoVideoPath'
    },
    {
        path: '/api/misc/weartest/:weartestId/ratings',
        verb: 'GET',
        authenticationRequired: true,
        controller: 'weartest',
        method: 'getWeartestRatings'
    },
    {
        path: '/api/misc/weartest/:weartestId/ratingsgroup',
        verb: 'GET',
        authenticationRequired: true,
        controller: 'weartest',
        method: 'getRatingsGroupWeights'
    },
    {
        path: '/api/misc/weartest/:weartestId/ratingsgroupbysurvey',
        verb: 'GET',
        authenticationRequired: true,
        controller: 'weartest',
        method: 'getRatingsGroupWeightsBySurvey'
    },
    {
        path: '/api/feature/draft',
        verb: 'GET',
        authenticationRequired: true,
        controller: 'user',
        method: 'getTestersToDraft'
    },
    {
        path: '/api/misc/tags',
        verb: 'GET',
        authenticationRequired: true,
        controller: 'misc',
        method: 'getTagsCreatedByBrand'
    },
    {
        path: '/api/misc/tags/:testerId',
        verb: 'GET',
        authenticationRequired: true,
        controller: 'misc',
        method: 'getBrandTagsForTester'
    },
    {
        path: '/api/misc/tags/:testerId',
        verb: 'PUT',
        authenticationRequired: true,
        controller: 'misc',
        method: 'updateBrandTagForTester'
    },
    {
        path: '/api/misc/bulk/tags',
        verb: 'PUT',
        authenticationRequired: true,
        controller: 'misc',
        method: 'addBrandTagForTestersInBulk'
    }
];
