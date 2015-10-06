angular.module('starter.services', [])
  
  //A simple factory for our firebase/DB calls, so the URL's are managed in a single location. 
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

  //Helper function for escaping emails correctly to input them as usernames to Firebase (no fullstops in usernames)
  .factory('Escape', function () {
    var escape = function(email) {
      return encodeURIComponent(email).replace('.', '%2E');
    };
    
    return {
      escape: escape
    };
  })

  .factory('User', function($firebaseArray, $firebaseObject, Database, Escape, $state) {

    var checkExists = function(dataRef, username) {
      var doesExist;
      dataRef.child(username).once('value', function(snapshot) {
        var exists = (snapshot.val() !== null);
        doesExist = !!exists;
      });
      return doesExist;
    };

    var fetchUserByEmail = function(email) {
      email = Escape.escape(email);

      var userRef = Database.usersRef.child(email);
      var user = $firebaseObject(userRef);


      if (checkExists(Database.usersRef, email)) {
        return user;
      } else {
        return null;
      }

    };

    var isCurrentFriend = function(email) {
      email = Escape.escape(email);
      //pull current user from localStorage
      var currentUser = Escape.escape(JSON.parse(window.localStorage[Database.session]).password.email);
      // pull the current user found in local storage from the DB
      var friendRef = Database.usersRef.child(currentUser).child('friends').child(email);

      var friend = $firebaseObject(friendRef);

      if (checkExists(Database.usersRef.child(currentUser).child('friends'), email)) {
        return friend;
      } else {
        return null;
      }
    };
    var logout = function(Database, $state) {
      Database.ref.unauth();
      $state.go('auth');
    };

    return {
      fetchUserByEmail: fetchUserByEmail,
      isCurrentFriend: isCurrentFriend,
      logout: logout
    };
  })

  .factory('Auth', function(Database, Escape, $state) {

    var createUser = function(email, password, callback) {
      //create a new user in the db
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
          //now that the user is authenticated, add them to the user accessable firebase DB
          email = Escape.escape(email);
          var userRef = Database.usersRef;
          var uid = userData.uid;
          userRef.update({
            [email]: {
              deviceToken: '', //device token is updated later when it has been recieved from GCM
              friends: {}
            }
          });
          callback();
        }
      });
    };
    var login = function(email, password, $state, callback) {
      //check the DB for the user account
      Database.ref.authWithPassword({
        email: email,
        password: password
      }, function(error, authData) {
        if (error) {
          //Should pass something to update the view
          console.log('Login Failed! ' + error);
        } else {
          //log the user details for debugging
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

    // Encode the private key
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
          "tokens": [token], // will need the following format for groups ['your', 'target', 'tokens']
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
