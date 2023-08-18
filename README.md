# Running application on Android
```
Move apk file from "game_android" folder top android device
If on Android Nougat version or lower, enable 'Unknown Sources' from settings->security/Lock screen and security->Unknown sources
If on Android Oreo or higher allow installing unknown apps while trying to open apk on android
After successfully installing the app you can open it and start playing
```
# Running application on iOS

## Need to install:
Node.js https://nodejs.org/en/download/
Xcode https://itunes.apple.com/us/app/xcode/id497799835?mt=12

## Install cordova and add iOS platform
```
open terminal in tallin towers game folder (might have to add sudo prefix to commands)
run in terminal: npm install -g cordova
run in terminal: cordova platform add iOS
run in terminal: cordova build ios
```

## Xcode
```
open xcode
open: tallinn-towers -> platform -> ios -> open XcodeProject file

When opening the project if a popup shows that you don't have permission, close the project
open tallinn towers folders sharing&permission settings
give read&write to everyone
press the gear icon on the bottom -> apply to enclosed items...
try opening the project again

to run on physical ios device you need to add developer to project: 
xcode -> preferences -> accounts -> add apple account if you haven't
sign project https://help.apple.com/xcode/mac/current/#/dev23aab79b4
Run the game on a device
You need to trust an unrealeased iOS App: Settings -> General -> Profiles -> Tallinn Towers -> Trust "Tallinn Towers"
Play the game.
```