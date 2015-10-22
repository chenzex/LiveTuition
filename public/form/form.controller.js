'use strict';
(function(){
    angular
        .module("FormBuilderApp")
        .controller("FormController", FormController);
    function FormController($scope) {
        $scope.adminHello = "Hello from AdminController"
    }
})();