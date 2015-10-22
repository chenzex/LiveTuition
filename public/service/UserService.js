'use strict';
(function () {
    angular
        .module("FormBuilderApp")
        .factory("UserService", UserService);
    function UserService() {
        var currentUsers = [];

        
        var findUserByUsernameAndPassword = function (user) {
            currentUsers.forEach(function(element) {
                if(user.username==element.username && user.password==element.password1){
                    console.log('found');
        
                }
            }, this);
            return null; 
        };

        var createUser = function (user) {
            currentUsers.push(user);
            return; 
        };
        
        var updateUser = function(user){
            currentUsers.forEach(function(element) {
                if(user.username==element.username && user.password==element.password1){
                    element.firstName = user.firstName;
                    element.lastName = user.lastName;
                    element.email = user.email;
        
                }
            }, this);
        }
        
        return {
            createUser : createUser,
            findUserByUsernameAndPassword : findUserByUsernameAndPassword,
            updateUser : updateUser
        };
    }
})();

