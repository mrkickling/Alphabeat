var app = angular.module('alphabeat', []);

app.controller('alphacontroller', function($scope, $interval){
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
        
        for(var i = 0; i<alphabet.length ;i++){
            $scope.alphabet[i].class = '';
        }

        $scope.alphabet[0].class = 'nextLetter';
        currentLetterKey = 0;
    }
    
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    $scope.alphabet = []
    
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
            if(currentLetterKey==0){
                startTime = new Date();
                
                timerPromise = $interval(function(){
                    var currentTime = new Date();
                    $scope.timer = (currentTime-startTime)/1000;
                }, 100);
            }

            
            var currentLetter = $scope.alphabet[currentLetterKey].letter;
            var pressedLetter = String.fromCharCode(keyEvent.which).toLowerCase();
            if(pressedLetter == currentLetter){
                if(currentLetterKey == alphabet.length-1){
                    $interval.cancel(timerPromise);
                    $scope.alphabet[currentLetterKey].class="typedLetter";
                    $scope.won = true;
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