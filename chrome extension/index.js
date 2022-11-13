chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  function setAudio(url) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "set_audio", audio: url });
  }

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
        document.getElementById(
          "dummy"
        ).innerHTML = `<button class="lang-btn" data="null">Original</button> <br>`;
        res.forEach((element) => {
          document.getElementById(
            "dummy"
          ).innerHTML += `<button class="lang-btn" data="${element.audio_url}">${element.lang}</button><br>`;
        });

        const btns = document.getElementsByClassName("lang-btn");
        for (let i = 0; i < btns.length; i++) {
          btns[i].addEventListener("click", () => {
            setAudio(btns[i].getAttribute("data"));
          });
        }
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

  function setRecording(val) {
    chrome.storage.sync.set({ isRecording: val }, function () {
      console.log("Value is set to " + val);
    });
  }

  function setAudioBlob(val) {
    localStorage.setItem("audioBlob", val);
  }

  function showActions(audioBlob) {
    //create a new audio element that will hold the recorded audio
    const audioElm = document.createElement("audio");
    audioElm.setAttribute("controls", ""); //add controls
    const audioURL = window.URL.createObjectURL(audioBlob);
    audioElm.src = audioURL;

    recordedAudioContainer.style.display = "block";

    //show audio
    recordedAudioContainer.insertBefore(
      audioElm,
      recordedAudioContainer.firstElementChild
    );
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

    audioBlob = localStorage.getItem("audioBlob");
    if (audioBlob) {
      audioBlob = generateBlob(audioBlob);
      console.log(audioBlob);

      showActions(audioBlob);
    }

    chrome.storage.sync.get(["isRecording"], function (result) {
      console.log("Value currently is " + result.isRecording);
      isRecording = result.isRecording || false;
      recordButton.innerHTML = isRecording ? "Stop" : "&#127908;";
    });

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
      setAudioBlob("");
      recordedAudioContainer.style.display = "none";
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
            alert("Recording saved successfully");
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

      let f = new File([audioBlob], Date.now().toString() + ".webm", {
        type: "audio/webm",
      });
      //   downloadBlob(audioBlob);
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
          setRecording(isRecording);
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
          setRecording(isRecording);
          recordButton.innerHTML = "&#127908;";

          if (recordedAudioContainer.firstElementChild.tagName === "AUDIO") {
            recordedAudioContainer.firstElementChild.remove();
          }

          setAudioBlob(response);

          audioBlob = generateBlob(response);
          console.log(audioBlob);

          showActions(audioBlob);
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
