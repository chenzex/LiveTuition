'use strict';
(function(){
    angular
        .module("LiveTuition")
        .controller("RegisterController", RegisterController);
        //RegisterController.$inject=['$scope','UserService'];
    function RegisterController($scope,UserService) {
        $scope.register = function() {
            var user = {
                username: $scope.username,
                password1: $scope.password1,
                password2: $scope.password2,
                email: $scope.email,
            }
            UserService.createUser(user);
            
  }
    }
})();
