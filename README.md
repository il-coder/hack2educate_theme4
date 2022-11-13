# Hack2Educate Theme 4

## _Repository for extension for Audio dubbing for YouTube videos_ #hack2educate

## Team Details :

**Team Name : Code Breakers**<br>
**Theme : Theme 4 (Audio dubbing for YouTube videos)**

Piyush Garg <br>
**Discord** : infinity_star#4499

Mayank Goswami <br>
**Discord** : Vegeta#9780

Shashikant Rajput <br>
**Discord** : t33#9261

### DEMO (Links & Process)

> Backend API Docs : https://ilcoder.biz/docs <br>
> Backend API test URL : https://ilcoder.biz <br>
> Test Video URL (Dubbing already available) : https://www.youtube.com/watch?v=9em32dDnTck&ab_channel=Valkeir <br>

Step 1. Download the chrome extension folder (either by cloning or direct download)

Step 2. Go to Extensions in Chrome and enable developer mode.

Step 3. Click on Load Unpacked and select the downloaded chrome extension folder.<br>Make sure that the extension has been loaded in the extensions list.<br>You may use see this tutorial here : https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/

Step 4. After following the above steps, the extension is ready to use.

Open any youtube video and click on extension icon. The available audio dubbings will be listed there. Click on any audio dubbing to listen to that one.

Step 5. (Optional) You can also record and upload your own dubbing for a video. To do so, click on extension icon and fill in language. After that just click on "Mic" icon and it will ask for permission and once done, it will start recording. Click on "Stop" once done<br>
Now you can listen, save or discard the recording.<br>
Note :- Don't click anywhere else otherwise the recording will be lost.

### Tools & Technologies to be used

- HTML
- CSS
- JavaScript
- Chrome Extension
- Python 3.9
- FastAPI
- Websockets
- Cockroach DB
- Deta Drive SDK
- VS Code

### Progress Chart

1. Created basic API for storage of audio files on Deta Drive ✅
2. Created streaming API for sendng audio files in part ✅
3. Created basic chrome extension ✅
4. Created API and connected with Cockroach DB ✅
5. Linked Custom Domain (https://ilcoder.biz) to backend hosting service ✅
6. Hosted on Heroku for Websocket Support ✅
7. Adding functionalities to the extension ✅

### Work in Progress

- Automatic conversion of audio using Speech Recognition
- Beautification of extension UI

## How we will solve the problem? :thinking:

We will create an extension, using which a user will be able to

1. Give it's own translation for any particular video for any part of it in any language of his/her choice which will be stored on the server
2. Choose a translation/dubbed audio to play instead of original audio out of available ones which is retrieved from the server

Once a user uploads the dubbed audio, the server will store the audio and save the metadata like language, date recorded, username of the recording user, etc. in the database. And retrieve the same when needed

![workflow_2 drawio](https://user-images.githubusercontent.com/62426177/201458660-e5253cec-baf4-44b9-9ec3-355331664380.png)

_Still one question remains - How to identify genuine dubbing?_<br>
We can ask the user for rating once the audio dubbing has ended and based on that we can rank the audio dubbings.

## What will be our final demo? :smiley:

We will aim to create a demo which will include

1. A browser extension
2. A server with database and cloud storage for saving audio dubbings

The user will open a YouTube video and extension will become active. When user clicks on extension prompt, option for recording a new dub and the available dubs for that particular video will be displayed and user can choose a dub in the required language which will be played over the original audio.

### _Further Scope_

1. We can add automatic translation using below process :

![Workflow drawio](https://user-images.githubusercontent.com/62426177/201351267-c8d00abb-fa33-468a-8acc-ca5a7c8bf007.png)

2. We can add incentives & support to the person doing dubbing task

3. Right now, only whole video dub / dub from starting is available. As a future scope, dubbing in parts and auto-syncing will be made possible using timestamps at which audio are recorded.

4. We can also provide automatic translations using auto generated translations for captions by YouTube (though not all videos have captions, so not all videos will be translated using it)

### Plan to Work on Auto Sync of Audio & Video when dubbing is in part of the video

> Get timestamp at beginning of recording & store it along with recording file and duration

> Sync Time : <br>
> If new audio is available at current timestamp, prompt user to continue current or select a new one<br>
> Also make an option, to always continue current audio dubbing, if it is available for current time

![Workflow_3 drawio](https://user-images.githubusercontent.com/62426177/201509487-8bc829b0-46e0-4726-bfec-1d3dfdf579a5.png)