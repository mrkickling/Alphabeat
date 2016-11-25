var app = angular.module('alphabeat', []);

app.controller('alphacontroller', function($scope, $interval, socket){
    var device;
    $scope.topLists;
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
      device = 'phone';
    } else {
      device = 'desktop';
    }

    socket.on('toplists', function(data){
        $scope.topLists = data;
    })
    
    $scope.loggedIn = false;
    $scope.won = false;
    $scope.timer = 0;
    var timerPromise;
    
    $scope.addUser = function(){
        $scope.loggedIn = true;
    }
    $scope.resetGame = function(){
        $scope.timer = 0;
        $scope.won = false;
        timerPromise = '';
        
        for(var i = 0; i<alphabet.length ;i++){
            $scope.alphabet[i].class = '';
        }

        $scope.alphabet[0].class = 'nextLetter';
        currentLetterKey = 0;
    }
    
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    $scope.alphabet = [];
    
    for(var i = 0; i<alphabet.length ;i++){
        var letter = alphabet[i];
        
        $scope.alphabet[i] = {};
        $scope.alphabet[i].letter = letter;
        $scope.alphabet[i].class = '';
    }
    
    $scope.alphabet[0].class = 'nextLetter';
    var currentLetterKey = 0;

    
    $scope.currentKey = 'a';
        // Event handlers
    $scope.onKeyDown = function (keyEvent) {
        
        if($scope.loggedIn){
            if($scope.alphabet[0].class=='nextLetter'){
                startTime = new Date();
                
                timerPromise = $interval(function(){
                    var currentTime = new Date();
                    $scope.timer = (currentTime-startTime)/1000;
                }, 100);
            }

            
            var currentLetter = $scope.alphabet[currentLetterKey].letter;
            var pressedLetter = String.fromCharCode(keyEvent.which).toLowerCase();
            if(pressedLetter == currentLetter){
                if(currentLetterKey >= alphabet.length-1){
                    $interval.cancel(timerPromise);
                    timerPromise = undefined;
                    $scope.alphabet[currentLetterKey].class="typedLetter";
                    $scope.won = true;
                    socket.emit('won', [$scope.username, $scope.timer, device, 'abcdefghijklmnopqrstuvwxyz'])
                    if(device == 'mobile'){
                        if($scope.timer<$scope.topLists.mobileTopList[$scope.topLists.mobileTopList.length-1].score){
                            console.log('you made a record on mobile!');
                            $scope.topList.mobileTopList[$scope.topLists.mobileTopList.length] = {
                                username:$scope.username,
                                score:$scope.timer
                            }
                        }
                    }else{
                        if( $scope.timer < $scope.topLists.desktopTopList[$scope.topLists.desktopTopList.length-1].score ){
                            console.log('you made a record on desktop!');
                            $scope.topLists.desktopTopList[$scope.topLists.desktopTopList.length] = {
                                username:$scope.username,
                                score:$scope.timer
                            }
                        }
                    }
                }else{
                    $scope.alphabet[currentLetterKey].class="typedLetter";
                    currentLetterKey++;
                    $scope.alphabet[currentLetterKey].class="nextLetter";
                }
            }else if($scope.won==false){
                $scope.alphabet[currentLetterKey].class="failedLetter";
            }
        }
        
    };
});



app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    disconnect: function(id){
        socket.disconnect(id);
    }
  };
});

