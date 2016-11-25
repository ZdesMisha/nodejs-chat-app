/**
 * Created by misha on 22.11.16.
 */
angular.module('registration', [])
    .controller('RegistrationController', ['$scope', '$http', function ($scope, $http) {
        $scope.username = "";
        $scope.password = "";
        $scope.passwordConfirmation = "";

        $scope.register = function () {
            var data = JSON.stringify({
                username: $scope.username,
                password: $scope.password
            });

            var config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $http.post('/register', data, config)
                .success(function (data, status, headers, config) {
                    console.log('registration succeed')
                })
                .error(function (data, status, header, config) {
                    console.log('registration failed failed')
                });
        }
    }])
    .directive('registrationForm', function () {
        return {
            restrict: "E",
            templateUrl: 'js/registration/registration-form.template.html',
            controller: 'RegistrationController'
        }
    });
