'use strict';

(function(){
    angular
        .module("FormBuilderApp")
        .config(function($routeProvider){
            $routeProvider
                // .when("/", {
                //     templateUrl: "index.html"
                // })
                .when("/home", {
                    templateUrl: "home/home.view.html"
                })
                .when("/register", {
                    templateUrl: "register/register.view.html",
                    controller: "RegisterController"
                })
                .when("/login", {
                    templateUrl: "login/login.view.html",
                    controller: "LoginController"
                })
                .when("/profile", {
                    templateUrl: "profile/profile.view.html",
                    controller: "ProfileController"
                })
                .when("/form", {
                    templateUrl: "form/form.view.html",
                    controller: "FormController"
                })
                .when("/chat", {
                    templateUrl: "chat/chat.view.html",
                    controller: "ChatController"
                })
                .otherwise({
                    redirectTo: "/"
                });
        });
})();