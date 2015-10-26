'use strict';
(function () {
    angular
        .module("LiveTuition")
        .controller("MainController", MainController);
    function MainController($rootScope) {
        $rootScope.AllMyData =
        ['Jim', 'Jane', 'Heidi',
            'Fido', 'Spot'];

    }
})();