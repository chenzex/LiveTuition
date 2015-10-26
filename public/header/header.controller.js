'use strict';
(function(){
    angular
        .module("LiveTuition")
        .controller("HeaderController", HeaderController);
    function HeaderController($scope) {
        $scope.adminHello = "Hello from AdminController"
    }
})();