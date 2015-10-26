'use strict';
(function () {
    angular
        .module("LiveTuition")
        .controller("LoginController", LoginController);
    function LoginController($scope, UserService, $rootScope, $location) {
        $rootScope.socket = io.connect("https://live-chenze.rhcloud.com:8443");
        // $rootScope.socket = io.connect("localhost:3000");

        $rootScope.socket.on('user', function (msg) {
            if (msg.type == 'refresh') {
                if($rootScope.user == null)return;
                 $rootScope.$apply(function () {
                $rootScope.onlineUsers = msg.onlineUsers;
                delete $rootScope.onlineUsers[$rootScope.user.connId];
            });

            } else if (msg.type == 'login') {
                $rootScope.user.connId = msg.connId;
                 $rootScope.$apply(function () {
                $rootScope.onlineUsers = msg.onlineUsers;
                delete $rootScope.onlineUsers[$rootScope.user.connId];
            });
            } else if (msg.type == 'request') {
                BootstrapDialog.show({
                    title: 'Tuition Request',
                    message: msg.sourceUser.name + ' is asking you to join the tuition.',
                    buttons: [{
                        label: 'Accept',
                        action: function (dialog) {
                            $rootScope.user.targetId = msg.sourceId;
                            var msg2 = {
                                type: 'group',
                                sourceUser: $rootScope.user,
                                targetUser: msg.sourceuser,
                                targetId: msg.sourceId
                            }
                            $rootScope.socket.emit('user', msg2);
                            document.getElementById('userContainer').style.display = "none";
                            document.getElementById('chatContainer').style.display = "block";
                            dialog.close();
                        }
                    }, {
                            label: 'Cancel',
                            action: function (dialog) {
                                dialog.close();
                            }
                        }]
                });
            } else if (msg.type == 'group') {
                $rootScope.user.targetId = msg.targetId;
                document.getElementById('userContainer').style.display = "none";
                document.getElementById('chatContainer').style.display = "block";
            }
        });

        $scope.login = function () {
            var user = {
                username: $scope.username,
                password: $scope.password
            }
            UserService.findUserByUsernameAndPassword(user);
        }

        $scope.guestLogin = function () {
            var fun = function (user) {
                //$rootScope.user = user;
            };
            var msg = {
                type: 'guestLogin',
                user: {
                    name: $scope.guest
                },
                callback: fun
            }
            $rootScope.user = msg.user;
            $rootScope.socket.emit('user', msg);
            $location.path('/chat');
        }
    }
})();
