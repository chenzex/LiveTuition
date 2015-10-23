'use strict';

(function(){
    angular
        .module("FormBuilderApp")
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
                    templateUrl: "chat/chat.view.html",
                    controller: "ChatController"
                });
        });
})();