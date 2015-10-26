'use strict';
(function(){
    angular
        .module("LiveTuition")
        .controller("ProfileController", ProfileController);
    function ProfileController($scope,UserService) {
        $scope.update = function() {
            var user = {
                username: $scope.username,
                password: $scope.password,
                firstName: $scope.firstName,
                lastName: $scope.lastName,
                email: $scope.email
            }
            UserService.updateUser(user);
            
  }
    }
})();
