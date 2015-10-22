'use strict';
(function(){
    angular
        .module("FormBuilderApp")
        .controller("LoginController", LoginController);
    function LoginController($scope,UserService) {
        $scope.login = function() {
            var user = {
                username: $scope.username,
                password: $scope.password
            }
            UserService.findUserByUsernameAndPassword(user);
            
  }
    }
})();
