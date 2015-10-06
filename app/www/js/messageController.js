angular.module('starter.messageController', ['ionic', 'starter.services','firebase'])

.controller('MessageController', function ($scope, $rootScope, $state, $firebaseObject, Message, $timeout, Database, Escape) {

  $scope.sent = [];


  // Stop input when max character length of 15 is reached
  $scope.$watch('message', function(newVal, oldVal) {
    if (newVal) {
      if(newVal.length > 15) {
        $scope.message = oldVal;
      }
    }
  });

  //sent a message to createResponse which is sent to sendMessage in the Message factory to send
  //Potentially rename these functions to be more clear.
  $scope.sendMessage = function(friend, $index) {
    Message.createResponse(friend, $scope.message, function () {
      $scope.sent[$index] = true;
      $timeout(function() {
        $scope.sent[$index] = false;
      }, 1000);
    });
  };

  console.log(JSON.parse(window.localStorage[Database.session]).password.email);
  //pull username from token (not secure) and escape username for db search
  var email = Escape.escape(JSON.parse(window.localStorage[Database.session]).password.email);
  var friends = Database.usersRef.child(email);
  
  // Update on friend added
  var userRef = Database.usersRef.child(email).child('friends');
  userRef.on('value', function (snapshot) {
    var user = $firebaseObject(friends);
    user.$loaded()
    .then(function(data) {
      //when the user is found add all the friends to an array to display in the messages page
      $scope.decodedFriends = {};
      for (var friend in data.friends) {
        $scope.decodedFriends[friend] = {
          email: friend,
          username: data.friends[friend]
        };
      }
      $scope.friends = data.friends;
    });
  });

  $scope.navToUsers = function() {
    $state.go('users');
  };

  // Check if at least one friend selected
  $scope.isFriendChecked = function () {
    for (var i = 0; i < $scope.friends.length; i++) {
      if ($scope.friends[i].checked) {
        return true;
      }
    }
    return false;
  };

  $scope.logout = function() {
    Message.logout(Database, $state);
  };

});
