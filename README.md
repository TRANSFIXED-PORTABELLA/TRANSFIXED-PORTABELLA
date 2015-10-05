# Yep

>Yep helps people plan impromptu events with their closest friends.

Have you ever, on an uninspiring Sunday afternoon, gotten the urge hang out at your favorite spot? You'd rather not go alone but it's too last minute to coordinate with your crew. ‘Yep’ can help. Send a quick, one word invite to your inner circle and know, real time, who will be joining you. 

## Team

  - __Product Owner__: Alex
  - __Scrum Master__: Juana
  - __Development Team Members__: Alex, Juana, Livvie

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

The application is currently only fully supported on Android devices.  Apple devices can send messages, but cannot receive push notifications.

## Requirements

- Gulp 3.5.6
- Gulp-sass 1.3.3
- Gulp-concat 2.2.0
- Gulp-minify-css 0.3.0
- Gulp-rename 1.2.0
- Gulp-util 2.2.14
- Bower 1.3.3
- Shelljs 0.3.0
- Cordova Plugins:
    "cordova-plugin-device"
    "cordova-plugin-console"
    "cordova-plugin-whitelist"
    "cordova-plugin-splashscreen"
    "com.ionic.keyboard"


## Development

### Installing Dependencies

Ionic Setup

1. Run ```npm install``` from the app directory.
2. Run ```npm install``` from the the push-server directory.
3. Set up an [Ionic account](https://apps.ionic.io/signup).
4. Initialize the platform by running ```ionic add ionic-platform-web-client``` from the root directory.
5. Run ```ionic plugin add phonegap-plugin-push``` from the root directory.
6. Run ```ionic io init``` from the root directory.
7. Go to your [Ionic apps](https://apps.ionic.io) and navigate to the app you just created.  Get the app id from My Apps home page and the public and secret API keys under Settings->Keys in the app.
8. In the .io-config.json file in the app directory, set dev_push to false to run the app on an Android device, or to true to run the app on the desktop.  Set the app id and API keys.  Then set up a [GCM key](http://docs.ionic.io/docs/push-android-setup).  The file should look like the following:
```
{
  "dev_push": false,
  "app_id": APPID,
  "api_key": PUBLICKEY,
  "privateKey": SECRET,
  "gcm_key": GCMKEY
}
```
9. Run ```ionic config build```.

Firebase Setup

1. Go to the [Firebase](https://www.firebase.com) website and sign up for an account.
2. In the homepage, create an app.
3. Click on Manage App and navigate to Login & Auth.  Check the box next to "Enable Email & Password Authentication."
4. In the app/www/js/services.js file, replace any instances of yotempest in the Database factory with your app name.  (There should be three instances, one each in ref, usersRef, and session)

* Note: Installation instructions have changed since the start of this project.  This is a beta product in flux.

### Roadmap

View the project roadmap [here](https://github.com/TRANSFIXED-PORTABELLA/TRANSFIXED-PORTABELLA/issues)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
