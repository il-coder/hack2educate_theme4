// document.write("Hello World");

let chunks = [];
let mediaRecorder = null;
let audioBlob = null;

const player_vid = document.getElementsByClassName("video-stream")[0];
const play_pause = document.getElementsByClassName("ytp-play-button")[0];
const player = document.getElementsByClassName("html5-video-player")[0];
let beat = null;

let callback;

player_vid.addEventListener("timeupdate", () => {
  if (beat) beat.currentTime = player_vid.currentTime;
});

function muteOriginal() {
  player_vid.muted = true;
}

function unmuteOriginal() {
  player_vid.muted = false;
}

function restartVideo() {
  player_vid.currentTime = 0;
}

function getCurrentVideoTime() {
  return player_vid.currentTime;
}

function mediaRecorderDataAvailable(e) {
  chunks.push(e.data);
}

function mediaRecorderStop() {
  //check if there are any previous recordings and remove them
  console.log("Recording Saved");

  //create the Blob from the chunks
  audioBlob = new Blob(chunks, { type: "audio/mp3" });
  console.log(chunks);
  console.log(audioBlob);
  console.log("Calling callback");

  const reader = new FileReader();
  reader.onload = () => {
    // console.log(reader.result);
    callback(reader.result);
  };
  reader.readAsBinaryString(audioBlob);

  // Reset
  mediaRecorder = null;
  chunks = [];
}

// function record(callback) {
//   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//     alert("Your browser does not support recording!");
//     return;
//   }

//   if (!mediaRecorder) {
//     navigator.mediaDevices
//       .getUserMedia({
//         audio: true,
//       })
//       .then((stream) => {
//         mediaRecorder = new MediaRecorder(stream);
//         mediaRecorder.start();
//         console.log("Recording started");
//         callback(true);
//         mediaRecorder.ondataavailable = mediaRecorderDataAvailable;
//         mediaRecorder.onstop = mediaRecorderStop;
//       })
//       .catch((err) => {
//         alert(`The following error occurred: ${err}`);
//         callback(false);
//       });
//   } else {
//     // stop recording
//     mediaRecorder.stop(callback);
//   }
// }

function playVideo() {
  if (player.classList.contains("paused-mode")) play_pause.click();
  if (player.classList.contains("ended-mode")) {
    beat = null;
    unmuteOriginal();
  }
  if (beat) beat.play();
}

function pauseVideo() {
  if (player.classList.contains("playing-mode")) play_pause.click();
  if (beat) beat.pause();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Inside content script");

  if (request.action == "start_recording") {
    pauseVideo();
    restartVideo();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      playVideo();
      alert("Your browser does not support recording!");
      return;
    }

    // --------------------------------------------
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        sendResponse(true);
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        muteOriginal();
        playVideo();
        console.log("Recording started");
        mediaRecorder.ondataavailable = mediaRecorderDataAvailable;
        mediaRecorder.onstop = mediaRecorderStop;
      })
      .catch((err) => {
        alert(`The following error occurred: ${err}`);
        sendResponse(false);
      });

    //  ------------------------------------------
    return true;
  } else if (request.action == "stop_recording") {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support recording!");
      return;
    }

    // --------------------------------------------

    callback = sendResponse;
    pauseVideo();
    mediaRecorder.stop();

    // --------------------------------------------

    return true;
  } else if (request.action == "set_audio") {
    console.log(request.audio);
    pauseVideo();
    if (!request.audio || request.audio == "null") {
      beat = null;
      unmuteOriginal();
      playVideo();
    } else {
      muteOriginal();
      beat = new Audio(`https://ilcoder.biz/audio/${request.audio}`);
      beat.currentTime = getCurrentVideoTime();
      console.log(beat);
      beat.addEventListener("canplay", (e) => {
        playVideo();
      });
    }
  }
});
