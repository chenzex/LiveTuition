'use strict';

(function(){
    angular
        .module("LiveTuition")
        .config(function($routeProvider){
            $routeProvider
                // .when("/", {
                //     templateUrl: "index.html"
                // })
                .when("/chat", {
                    templateUrl: "chat/chat.view.html",
                    controller: "ChatController"
                })
                .otherwise({
                    templateUrl: "login/login.view.html",
                    controller: "LoginController"
                });
        });
})();