'use strict';
(function(){
    angular
        .module("FormBuilderApp")
        .controller("SidebarController", SidebarController);
    function SidebarController($scope) {
        $scope.adminHello = "Hello from AdminController"
    }
})();