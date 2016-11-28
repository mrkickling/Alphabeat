
var device;
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
  device = 'mobile';
} else {
  device = 'desktop';
}

$(function(){
    $('#mobile-text-input').focus();
})


var app = angular.module('alphabeat', []);

app.controller('alphacontroller', function($scope, $interval, socket){
    $scope.topLists;
    if(device=='mobile'){
        $scope.mobile = true;
        $('#mobile-text-input').focus();
    }else{
        $scope.mobile = false;
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
        $("#a").focus();
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
    $scope.currentLetter = $scope.alphabet[currentLetterKey].letter;

    
    $scope.currentKey = 'a';
        // Event handlers
    $scope.onKeyUp = function(){
        $('#mobile-text-input').val('');
    }
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
            
            if($scope.mobile){
                var pressedLetter = $('#mobile-text-input').val().toLowerCase();
            }else{
                var pressedLetter = String.fromCharCode(keyEvent.which).toLowerCase();
            }
            if(pressedLetter == currentLetter){
                if(currentLetterKey >= alphabet.length-1){
                    $interval.cancel(timerPromise);
                    timerPromise = undefined;
                    $scope.alphabet[currentLetterKey].class="typedLetter";
                    $scope.won = true;
                    socket.emit('won', [$scope.username, $scope.timer, device, 'abcdefghijklmnopqrstuvwxyz'])
                    
                    if(device == 'mobile'){
                        if($scope.timer < $scope.topLists.mobileTopList[$scope.topLists.mobileTopList.length-1].score){
                            console.log('you made a record on mobile!');
                            $scope.topLists.mobileTopList[$scope.topLists.mobileTopList.length] = {
                                username:$scope.username,
                                score:$scope.timer
                            }
                            $scope.topLists.mobileTopList = sortByKey($scope.topLists.mobileTopList, 'score')
                        }
                    }else{
                        if( $scope.timer < $scope.topLists.desktopTopList[$scope.topLists.desktopTopList.length-1].score ){
                            console.log('you made a record on desktop!');
                            $scope.topLists.desktopTopList[$scope.topLists.desktopTopList.length] = {
                                username:$scope.username,
                                score:$scope.timer
                            }
                            $scope.topLists.desktopTopList = sortByKey($scope.topLists.desktopTopList, 'score')
                        }
                    }
                    
                }else{
                    $scope.alphabet[currentLetterKey].class="typedLetter";
                    currentLetterKey++;
                    $scope.alphabet[currentLetterKey].class="nextLetter";
                    
                    if($scope.mobile){
                        $("#" + $scope.alphabet[currentLetterKey].letter).focus();
                    }
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

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}


