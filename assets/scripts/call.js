var farEndVideo = document.getElementById('farEndVideo');
var selfViewVideo = document.getElementById('selfViewVideo');
var pin = document.getElementById('pin');

// Linke the callSetup method to the onSetup callback
pexRTC.onSetup = callSetup;
// Linke the callConnected method to the onConnect callback
pexRTC.onConnect = callConnected;
// Linke the callDisconnected method to the onError callback
pexRTC.onError = callDisconnected;
// Linke the callDisconnected method to the onDisconnect callback
pexRTC.onDisconnect = callDisconnected;

window.addEventListener('beforeunload', function (e) {
  // Disconnect the call
  pexRTC.disconnect();
});

// This method is called when the call is setting up
function callSetup(stream, pinStatus) {
  // If no pin is required, connect to the call with no pin
  if (pinStatus === 'none') {
    hidePinPopup();

    pexRTC.connect();
  } else {
    if (pinStatus === 'optional') {
      callPinTitle.innerText = 'Enter your PIN or press Connect';
    } else {
      callPinTitle.innerText = 'A PIN is required to enter this meeting';
    }

    showPinPopup();
  }

  if (stream) {
    selfViewVideo.srcObject = stream;
  }

  pexRTC.setPresentationInMix();
  navigateToCall();
}

// When the call is connected
function callConnected(stream) {
  if (typeof MediaStream !== 'undefined' && stream instanceof MediaStream) {
    farEndVideo.srcObject = stream;
  } else {
    farEndVideo.src = stream;
  }

  pexRTC.pin = null;
  hidePinPopup();
}

// When the call is disconnected
function callDisconnected(reason = '') {
  navigateToPreflight();
}

// This method is used to connect to the call with a pin
function enterCall() {
  // Connect to the call with the pin entered in the text field
  pexRTC.connect(pin.value);
  hidePinPopup();
}

// This method hangs up the cxall
function hangup() {
  // Tell the PextRTC library to disconnect
  pexRTC.disconnect();

  navigateToPreflight();
}

// Toggle the microphone mute
function toggleMicMute() {
  // Tell the pexRTC lib to mute the microphone and store the response
  // This will ensure that the mute state is in sync
  let micState = pexRTC.muteAudio();
  updateMicMuteState(micState);
}

// Toggle the video mute
function toggleVidMute() {
  // Tell the pexRTC lib to mute the video and store the response
  // This will ensure that the mute state is in sync
  let vidState = pexRTC.muteVideo();
  updateVideoMuteState(vidState);
}

function selectMedia() {
  let videoDevice = document.getElementsByClassName('videoDevices')[1];
  let videoDeviceId = videoDevice.options[videoDevice.selectedIndex].value;

  let audioDevice = document.getElementsByClassName('audioDevices')[1];
  let audioDeviceId = audioDevice.options[audioDevice.selectedIndex].value;

  stopStreamedVideo(selfViewVideo);
  pexRTC.clearLocalStream();
  selectDevices(videoDeviceId, audioDeviceId);
}

function stopStreamedVideo(videoElem) {
  const stream = videoElem.srcObject;
  const tracks = stream.getTracks();

  tracks.forEach(function (track) {
    track.stop();
  });

  videoElem.srcObject = null;
}
