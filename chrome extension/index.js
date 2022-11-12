chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  function fetchData() {
    fetch(
      `https://ilcoder.biz/list?url=${
        document.getElementById("video_url").value
      }`,
      {
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        document.getElementById("dummy").innerHTML = "";
        res.forEach((element) => {
          document.getElementById(
            "dummy"
          ).innerHTML += `${element.lang} <audio width="320" height="240" controls id="${element.audio_url}">
        <source src="https://ilcoder.biz/audio/${element.audio_url}" type="audio/mp3"/>
        Your browser does not support the audio tag.
      </audio> <br>`;
        });
      });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = filename || "download.mp3";

    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.removeEventListener("click", clickHandler);
      }, 150);
    };
    a.addEventListener("click", clickHandler, false);
    a.click();
    return a;
  }

  function initRecordSetup() {
    let audioBlob = null;
    let isRecording = false;

    const recordButton = document.getElementById("recordButton");
    const discardAudioButton = document.getElementById("discardButton");
    const saveAudioButton = document.getElementById("saveButton");
    const recordedAudioContainer = document.getElementById(
      "recordedAudioContainer"
    );

    // ------------------ Discard Recording --------------------
    function discardRecording() {
      if (confirm("Are you sure you want to discard the recording?")) {
        resetRecording();
      }
    }
    function resetRecording() {
      if (recordedAudioContainer.firstElementChild.tagName === "AUDIO") {
        recordedAudioContainer.firstElementChild.remove();
      }
      audioBlob = null;
    }
    discardAudioButton.addEventListener("click", discardRecording);

    // ------------------ Save Recording --------------------
    function saveRecording() {
      function FileSlicer(file) {
        this.sliceSize = 1024 * 1024;
        this.slices = Math.ceil(file.size / this.sliceSize);

        this.currentSlice = 0;

        this.getNextSlice = function () {
          var start = this.currentSlice * this.sliceSize;
          var end = Math.min(
            (this.currentSlice + 1) * this.sliceSize,
            file.size
          );
          ++this.currentSlice;

          return file.slice(start, end);
        };
      }

      function Sender(url, data) {
        var socket = new WebSocket(url);

        socket.onopen = function () {
          socket.send(JSON.stringify(data));
        };
        socket.onmessage = function (ms) {
          console.log("Message received : ", ms);
          if (ms.data == "ok") {
            console.log("Saved the data");
            socket.close();
          } else {
            console.log("Error occurred");
          }
        };
        socket.onerror = function () {
          console.log("Unable to connect to socket");
        };

        socket.onclose = function () {
          console.log("Saved the data");
        };
        return false;
      }

      function Uploader(url, file, data) {
        var fs = new FileSlicer(file);
        var socket = new WebSocket(url);

        console.log("Upload ", socket, fs, url);

        socket.onopen = function () {
          socket.send(fs.getNextSlice());
        };
        socket.onmessage = function (ms) {
          console.log("Meesage received : ", ms);
          if (ms.data == "ok") {
            fs.slices--;
            if (fs.slices > 0) socket.send(fs.getNextSlice());
            else {
              console.log("Upload complete");
              socket.close();
            }
          } else {
            console.log("Error occurred");
          }
        };
        socket.onerror = function () {
          console.log("Unable to connect to socket");
        };

        socket.onclose = function () {
          if (fs.slices) console.log("Unable to upload");
          else Sender("wss://hack2educate.herokuapp.com/data", data);
        };
        return false;
      }

      let f = new File([audioBlob], Date.now().toString() + ".mp3", {
        type: "audio/mp3",
      });
      downloadBlob(audioBlob);
      //   downloadBlob(f);
      console.log(f);
      Uploader("wss://hack2educate.herokuapp.com/ws", f, {
        name: f.name,
        video_url: document.getElementById("video_url").value,
        lang: document.getElementById("lang").value,
      });
    }
    saveAudioButton.addEventListener("click", saveRecording);

    // ------------------ Handle Blob --------------------
    function generateBlob(data) {
      const l = data.length;
      let array = new Uint8Array(l);
      for (let i = 0; i < l; i++) {
        array[i] = data.charCodeAt(i);
      }
      let b = new Blob([array], { type: "audio/mp3" });
      return b;
    }

    // ------------------ Start Recording --------------------
    function startRecording() {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "start_recording" },
        function (response) {
          console.log("Got response on start ", response);
          if (response) {
            isRecording = true;
          } else {
            isRecording = false;
          }
          recordButton.innerHTML = isRecording ? "Stop" : "&#127908;";
        }
      );
    }

    // ------------------ Stop Recording --------------------
    function stopRecording() {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "stop_recording" },
        function (response) {
          console.log("Got response on stop ");
          isRecording = false;
          recordButton.innerHTML = "&#127908;";

          if (recordedAudioContainer.firstElementChild.tagName === "AUDIO") {
            recordedAudioContainer.firstElementChild.remove();
          }
          audioBlob = generateBlob(response);
          console.log(audioBlob);

          //create a new audio element that will hold the recorded audio
          const audioElm = document.createElement("audio");
          audioElm.setAttribute("controls", ""); //add controls
          const audioURL = window.URL.createObjectURL(audioBlob);
          audioElm.src = audioURL;
          //show audio
          recordedAudioContainer.insertBefore(
            audioElm,
            recordedAudioContainer.firstElementChild
          );
        }
      );
    }

    function record() {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }

    recordButton.addEventListener("click", record);
  }

  const non_yt = document.getElementById("non-yt");
  const yt = document.getElementById("yt");
  const tab = tabs[0];
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const q = tab.url.split("?")[1];
    const body = new URLSearchParams(q);
    console.log(body);
    if (body.has("v")) {
      yt.style.display = "block";
      non_yt.style.display = "none";
      console.log(body.get("v"));
      document.getElementById("video_url").value = body.get("v");
      fetchData();
      initRecordSetup();
    } else {
      yt.style.display = "none";
      non_yt.style.display = "block";
    }
  } else {
    yt.style.display = "none";
    non_yt.style.display = "block";
  }
});