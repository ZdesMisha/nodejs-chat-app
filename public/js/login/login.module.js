/**
 * Created by misha on 22.11.16.
 */
angular.module('login', [])
    .controller('LoginController', ['$scope', '$http', function ($scope, $http) {
        $scope.username = "";
        $scope.password = "";

        $scope.login = function () {
            var data = JSON.stringify({
                username: $scope.username,
                password: $scope.password
            });

            var config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $http.post('/login', data, config)
                .success(function (data, status, headers, config) {
                    console.log('loggin succeed')
                    $http.get("/");
                })
                .error(function (data, status, header, config) {
                    console.log('login failed')
                });
        }
    }])
    .directive('loginForm', function () {
        return {
            restrict: "E",
            templateUrl: 'js/login/login-form.template.html',
            controller: 'LoginController'
        }
    });
