'use strict';
(function () {
    angular
        .module("LiveTuition")
        .factory("UserService", UserService);
    function UserService() {

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }
        
        var currentUsers = [];

        var guestLogin = function (user, callback) {
            user.id = guid();
            currentUsers.push(user);
            callback(user, currentUsers);
        }

        var findUserByUsernameAndPassword = function (username, password, callback) {
            currentUsers.forEach(function (user) {
                if (username == user.username && password == user.password1) {
                    callback(user);
                }
            }, this);
            callback(null);
        };

        var findAllUsers = function (callback) {
            callback(currentUsers);
        };

        var createUser = function (user, callback) {

            user.id = guid();
            currentUsers.push(user);
            callback(user);
        };

        var deleteUserById = function (id, callback) {
            for (var i = currentUsers.length; i--;) {
                if (currentUsers[i].id === id) {
                    currentUsers.splice(i, 1);
                    break;
                }
            }
            callback(currentUsers);
        }
        var updateUser = function (id, user, callback) {
            currentUsers.forEach(function (element) {
                if (id == element.id) {
                    element.firstName = user.firstName;
                    element.lastName = user.lastName;
                    element.email = user.email;
                    callback(element);
                    return;
                }
            }, this);
            callback(null);
        }
        
        var updateOnlineUser = function(callback){
            callback(currentUsers);
        }

        return {
            guestLogin: guestLogin,
            createUser: createUser,
            findAllUsers: findAllUsers,
            findUserByUsernameAndPassword: findUserByUsernameAndPassword,
            deleteUserById: deleteUserById,
            updateUser: updateUser,
            updateOnlineUser: updateOnlineUser
        };
    }
})();

