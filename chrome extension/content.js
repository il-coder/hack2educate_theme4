// document.write("Hello World");

let chunks = [];
let mediaRecorder = null;
let audioBlob = null;

let callback;

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Inside content script");

  if (request.action == "start_recording") {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support recording!");
      return;
    }

    // --------------------------------------------
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        console.log("Recording started");
        sendResponse(true);
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
    mediaRecorder.stop();

    // --------------------------------------------

    return true;
  }
});
