angular.module('starter.services', [])

  .factory('Database', function($firebaseObject) {
    var ref = new Firebase('https://yotempest.firebaseio.com');
    console.log($firebaseObject(ref));
    var usersRef = new Firebase('https://yotempest.firebaseio.com/users');
    var session = 'firebase:session::' + 'yotempest';

    return {
      ref: ref,
      usersRef: usersRef,
      session: session
    };
  })

  .factory('Escape', function () {
    var escape = function(email) {
      return encodeURIComponent(email).replace('.', '%2E');
    };
    
    return {
      escape: escape
    };
  })

  .factory('User', function($firebaseArray, $firebaseObject, Database, Escape) {

    var fetchUserByEmail = function(email) {
      email = Escape.escape(email);

      var userRef = Database.usersRef.child(email);

      var USERS_LOCATION = Database.usersRef;

      var userExistsCallback = function(userId, exists) {
        if (exists) {
          console.log('user ' + userId + ' exists!');
          return true;
        } else {
          console.log('user ' + userId + ' does not exist!');
          return false;
        }
      };

      // Tests to see if /users/<userId> has any data. 
      var checkIfUserExists = function(userId) {
        var userExists;
        var usersRef = USERS_LOCATION;
        usersRef.child(userId).once('value', function(snapshot) {
          var exists = (snapshot.val() !== null);
          userExists = userExistsCallback(userId, exists);
        });
        return userExists;
      };

      var user = $firebaseObject(userRef);

      if (checkIfUserExists(email)) {
        return user;
      } else {
        return null;
      }

    };

    var isCurrentFriend = function(email) {
      email = Escape.escape(email);

      var friendExistsCallback = function(userId, exists) {
        if (exists) {
          console.log('friend ' + userId + ' exists!');
          return true;
        } else {
          console.log('friend ' + userId + ' does not exist!');
          return false;
        }
      };

      var currentUser = Escape.escape(JSON.parse(window.localStorage[Database.session]).password.email);
      var friendRef = Database.usersRef.child(currentUser).child('friends').child(email);

      var checkCurrentFriend = function(userId) {
        var friendsRef = Database.usersRef.child(currentUser).child('friends');
        var friendExists;
        friendsRef.child(userId).once('value', function(snapshot) {
          var exists = (snapshot.val() !== null);
          friendExists = friendExistsCallback(userId, exists);
        });
        return friendExists;
      };

      var friend = $firebaseObject(friendRef);

      if (checkCurrentFriend(email)) {
        return friend;
      } else {
        return null;
      }
    };

    return {
      fetchUserByEmail: fetchUserByEmail,
      isCurrentFriend: isCurrentFriend
    };
  })

  .factory('Auth', function(Database, Escape, $state) {

    var createUser = function(email, password, callback) {
      Database.ref.createUser({
          email: email,
          password: password
        }, function(error, userData) {
        if (error) {
          switch (error.code) {
            case 'EMAIL_TAKEN':
              console.log('The new user account cannot be created because the email is already in use.');
              break;
            case 'INVALID_EMAIL':
              console.log('The specified email is not a valid email.');
              break;
            default:
              console.log('Error creating user:', error);
          }
        } else {
          console.log('Successfully created user account with uid:', userData.uid);
          email = Escape.escape(email);
          var userRef = Database.usersRef;
          var uid = userData.uid;
          userRef.update({
            [email]: {
              deviceToken: '',
              friends: {}
            }
          });
          callback();
        }
      });
    };
    var login = function(email, password, $state, callback) {
      Database.ref.authWithPassword({
        email: email,
        password: password
      }, function(error, authData) {
        if (error) {
          console.log('Login Failed! ' + error);
        } else {
          email = JSON.parse(window.localStorage[Database.session]).password.email;
          console.log('Current User: ' + email);
          console.log('Authenticated successfully with payload:' + authData);
          //redirects to messages
          $state.go('message');
        }
      });
      callback();
    };
   
    return {
      createUser: createUser,
      login: login
    };
  })

  .factory('Message', function($http, $ionicCoreSettings, Database, $state) {

    // Define relevant info
    var privateKey = $ionicCoreSettings.get('privateKey');
    var appId = $ionicCoreSettings.get('app_id');

    // Encode your key
    var auth = btoa(privateKey + ':');

    var sendMessage = function(sender, message, token, callback) {
      // Build the request object
      var req = {
        method: 'POST',
        url: 'https://push.ionic.io/api/v1/push',
        headers: {
          'Content-Type': 'application/json',
          'X-Ionic-Application-Id': appId,
          'Authorization': 'basic ' + auth
        },
        data: {
          "tokens": [token], // will later change to format ['your', 'target', 'tokens']
          "notification": {
            "alert": sender,
            "android":{
              "title": message,
              "iconColor": "purple", 
              "delayWhileIdle":true,
              "timeToLive":300,
              "actions": [
                { icon: "ion-close", title: "NOPE"},
                { icon: "ion-checkmark", title: "YEP", callback:"app.yep()"}
              ]
            }
          }
        }
      };
      // Make the API call
      $http(req).success(function(resp){
        // Handle success
        console.log("We sent the message: " + message);
        console.log("To user: " + token)
        console.log("We got the response: " + JSON.stringify(resp));
        console.log("Ionic Push: Push success!");
        callback();
      }).error(function(error){
        // Handle error 
        console.log("Ionic Push: Push error...");
      });
    };
    var logout = function(Database, $state) {
      Database.ref.unauth();
      $state.go('auth');
    };

    //Used for creating the response before it is sent
    var createResponse = function(friend, message, callback) {
      var token;
      //make a database call to get the user token of the recipient
      var friendRef = Database.usersRef.child(friend);
      friendRef.on('value', function (snapshot) {
        token = snapshot.val().deviceToken;
        
        //find the current user
        var currentUser = JSON.parse(window.localStorage[Database.session]).password.email;
        var currentUsername = currentUser.slice(0, currentUser.indexOf('@'));
        
        //send the message to the user
        sendMessage(currentUsername, message, token, callback)
      });
    };

    return {
      sendMessage: sendMessage,
      logout: logout,
      createResponse: createResponse
    };
  });
