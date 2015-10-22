'use strict';
(function(){
    angular
        .module("FormBuilderApp")
        .controller("HeaderController", HeaderController);
    function HeaderController($scope) {
        $scope.adminHello = "Hello from AdminController"
    }
})();