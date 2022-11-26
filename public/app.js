

var socket = io(); //load socket.io-client and connect to the host that serves the page

var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope, $rootScope) {
  $scope.firstName = "John";
  $scope.lastName = "Doe";
  var gameSettings = {
    state: 'menu',
    timer: 30,
    mode: 'short'
  };
  var setGameSettings = function (data) {
    $scope.gameSettings = data;
  };
  $rootScope.gameSettings = gameSettings;
  $scope.gameSettings = $rootScope.gameSettings;

  // console.log($scope.gameSettings);
  $scope.gameSettings = gameSettings;


  $scope.init = function () {

    socket.emit("checkGame", $scope.gameSettings);

  };


  //LISTENERS


  $scope.$on('gameUpdate', function (event, args) {
    $scope.gameSettings = args;
  });


  socket.on('score', function (data) {
    setTimeout(function () {
      document.getElementById("score").innerHTML = data;
    }, 1050)
  });
  socket.on('light', function (data) { //get button status from client
    document.getElementById("light").checked = data; //change checkbox according to push button on Raspberry Pi
    socket.emit("light", data); //send push button status to back to server
  });
  socket.on('start', function (data) {
    //console.log('read start');
    //console.log(data);
    $rootScope.$broadcast('gameUpdate', data);
    $rootScope.gameSettings = data;
    $scope.$apply();
    //setGameSettings(data);
  });

  socket.on('starting', function (data) {
    //console.log('starting in ' + data.countDown);
    $rootScope.$broadcast('gameUpdate', data);

    $scope.$apply();

  });
  socket.on('checkGame', function (data) {
    // console.log('checkGame');
    // console.log(data);

    if (data.state === 'play' || data.state === 'starting') {

      socket.emit("continueGame", data);


    }


  });
  socket.on('finished', function (data) {
    $rootScope.$broadcast('gameUpdate', data);
    $scope.$apply();

  });

  $scope.startGame = function () {
    if ($scope.gameSettings.state === 'menu' || $scope.gameSettings.state === 'finished') {
      //  console.log('menu');
      socket.emit("start", $scope.gameSettings);
    }
  };
  $scope.p1button = function () {
    if ($scope.gameSettings.state === 'play') {
      //  console.log('p1button');
      socket.emit("p1button", $scope.gameSettings);
    }
  };

  $scope.p2button = function () {
    if ($scope.gameSettings.state === 'play') {
      //  console.log('p2button');
      socket.emit("p2button", $scope.gameSettings);
    }
  }


});
