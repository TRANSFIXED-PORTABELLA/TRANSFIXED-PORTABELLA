angular.module('starter.usersController', ['ionic', 'starter.services'])

.controller('UsersController', function ($scope, $state, User, Escape, Database) {

  $scope.inputs = {
    email: null
  };

  var domain = '@yotempest.com';

  $scope.fetchUserByEmail = function() {
    var searchEmail = ($scope.inputs.email + domain).toLowerCase();
    var searchResult = User.fetchUserByEmail(searchEmail);
    if (searchResult) {
      // If user found, show either add friend or remove friend button
      $scope.notFound = false;
      $scope.added = false;
      $scope.removed = false;
      $scope.identified = false;
      $scope.username = $scope.inputs.email;
      // Check if user is already a friend
      var isCurrentFriend = User.isCurrentFriend(searchEmail);
      if (isCurrentFriend) {
        $scope.notFound = false;
        $scope.alreadyFriend = true;
        $scope.searchUser = isCurrentFriend;
      } else {
        $scope.identified = true;
        $scope.alreadyFriend = false;
        $scope.searchUser = searchResult;
      }
    } else {
      // If user not found, show user not found button
      $scope.identified = false;
      $scope.notFound = true;
      $scope.added = false;
      $scope.alreadyFriend = false;
      $scope.removed = false;
    }
  };

  $scope.addFriend = function() {
    var friendEmail = $scope.searchUser.$id;
    var myEmail = Escape.escape(JSON.parse(window.localStorage[Database.session]).password.email);
    var userRef = Database.usersRef.child(myEmail)
    .child('friends').update({[friendEmail]: decodeURIComponent(friendEmail).slice(0, decodeURIComponent(friendEmail).indexOf('@'))});
    // Reset text box
    $scope.inputs.email = '';
    // Hide the add friend button
    $scope.identified = false;
    // Show message that friend was added
    $scope.added = true;
  };

  $scope.removeFriend = function() {
    var friendEmail = $scope.searchUser.$id;
    var myEmail = Escape.escape(JSON.parse(window.localStorage[Database.session]).password.email);
    var userRef = Database.usersRef.child(myEmail).child('friends').child(friendEmail);
    userRef.remove();
    // Reset text box
    $scope.inputs.email = '';
    // Hide the remove friend button
    $scope.alreadyFriend = false;
    // Show message that friend was removed
    $scope.removed = true;
  };

  $scope.logout = function() {
    User.logout(Database, $state);
  };

  $scope.navToMessage = function() {
    $state.go('message');
  };

});
