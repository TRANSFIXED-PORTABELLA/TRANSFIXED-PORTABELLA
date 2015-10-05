angular.module('starter.authController', ['ionic', 'starter.services'])


.controller('AuthController', function ($scope, Auth, $rootScope, $state, $log, $ionicUser, $ionicPush, Escape, Database, Message) {
  //form properties
  $scope.inputs = {
    email: null,
    password: null
  };

  var domain = '@yotempest.com';

  $scope.createUser = function() {
    var newUser = ($scope.inputs.email + domain).toLowerCase();
    Auth.createUser(newUser, $scope.inputs.password, function() {
      $scope.login();
    });
  };

  $scope.login = function() {
    var loginEmail = ($scope.inputs.email + domain).toLowerCase();
    console.log('Logging in with username:' + $scope.inputs.email + "Password:" + $scope.inputs.password);
    Auth.login(loginEmail, $scope.inputs.password, $state, function() {
      $scope.identifyUser();
    });

  };

  $scope.checkUser = function() {
    console.log('Current User: ' + JSON.parse(window.localStorage[Database.session]).password.email);
  };

  //*** PUSH NOTIFICATION AUTH ***
  //Handler for incoming device tokens. Allows us access so we can push it to firebase
  $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
    //Enable alerts for debugging
    // alert("Successfully registered token " + data.token);
    $log.info("Successfully registered token " + data.token);
    $log.info('Ionic Push: DATA = ' + JSON.stringify(data));
    $scope.token = data.token;
    $log.info($scope.token);

    var currentUser = JSON.parse(window.localStorage[Database.session]).password.email;
    // put device token in database
    var userRef = Database.usersRef.child(Escape.escape(currentUser)).child('deviceToken').set(data.token);
  });

  //Identifies a user with the Ionic User service for push notifications
  $scope.identifyUser = function () {
    $log.info('Ionic User: Identifying with Ionic User service');

    var user = $ionicUser.get();
    if(!user.user_id) {
      //if the user doesn't have an id, generate a new one for the ionic account
      //TODO: Use firebase ID to keep it consistent across the user
      user.user_id = $ionicUser.generateGUID();
    }
    angular.extend(user, {
      name: $scope.inputs.email
    });

    $ionicUser.identify(user).then(function(){
      $scope.identified = true;
      //Return the code for testing purposes
      // alert('Identified user' + user.name + '\n ID' + user.user_id);
      $scope.pushRegister();
    });
  };

  $scope.pushRegister = function () {
    $log.info('Ionic Push: Registering user');

    $ionicPush.register({
      canShowAlert: true, //Can pushes show an alert on your screen?
      canSetBadge: true, //Can pushes update app icon badges?
      canPlaySound: true, //Can notifications play a sound?
      canRunActionsOnWake: true, //Can run actions outside the app,
      onNotification: function(notification) {
        // Handle new push notifications here
        $log.info(notification);
        $log.info(JSON.stringify(notification));
        var friend = notification.message;
        $log.info(friend);
        switch( notification.event ){
         case 'message':
          //alert(notification.payload.title + " " + notification.message);
          navigator.notification.confirm(friend, function(btn) {
            if(btn === 1) {
              //format friend for sending
              friend = friend + "@yotempest.com";
              friendId = Escape.escape(friend);
              //send yes response
              Message.createResponse(friendId, 'Yep', function (){
                //replace with toast message
                alert("Sent");
              });
            }
          },
          notification.payload.title,
          ['Yep', 'Nope']);
         break;
         }
        return true;
      }
    });
  };

});

