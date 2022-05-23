var conferenceNode = 'au.pexipdemo.com';

var pexRTC = new PexRTC();

// Important! You must have a valid SSL cert for device selection to work!!
// This useEffect will run when the component loads

// Set the constraints of the video to search for
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
let constraints = {
  video: {
    height: {
      min: 1080,
    },
    width: {
      min: 1920,
    },
  },
  audio: true,
};

function addDevicesToDropDown(parent, devices, defaultVal = '') {
  let deviceCount = 0;

  let selectors = document.getElementsByClassName(parent);

  for (let selector of selectors) {
    selector.innerHTML = '';

    for (let device of devices) {
      deviceCount++;

      let deviceId = device.deviceId;
      let deviceLabel = device.label
        ? device.label
        : `Device ${deviceCount} (${deviceId.substring(deviceId.length - 8)})`;

      let deviceOption = new Option(deviceLabel, deviceId);
      selector.append(deviceOption);
    }

    selector.value = defaultVal;
  }
}

function selectDevices(videoDeviceId, audioDeviceId) {
  // If a video device has been selected
  if (videoDeviceId !== 'loading') {
    // Set the video device to the ID from our video dropdown
    pexRTC.video_source = videoDeviceId;
    localStorage.setItem('videoDeviceId', videoDeviceId);
  }

  // If an audio device has been selected
  if (audioDeviceId !== 'loading') {
    // Set the audio device to the ID from our audio dropdown
    pexRTC.audio_device = audioDeviceId;
    localStorage.setItem('audioDeviceId', audioDeviceId);
  }

  syncDevices('videoDevices', localStorage.getItem('videoDeviceId'));
  syncDevices('audioDevices', localStorage.getItem('audioDeviceId'));

  pexRTC.renegotiate(false);
}

function syncDevices(parent, defaultVal = '') {
  let selectors = document.getElementsByClassName(parent);

  for (let selector of selectors) {
    selector.value = defaultVal;
  }
}

// An async function to get the video and audio devices
async function getMediaDevices(constraints) {
  // Request permission to list devices
  await navigator.mediaDevices.getUserMedia(constraints);
  // Enumerate the devices
  let devices = await navigator.mediaDevices.enumerateDevices();

  // Filter only video devices
  let video_devices = devices.filter((d) => d.kind === 'videoinput');
  // Filter only audio devices
  let audio_devices = devices.filter((d) => d.kind === 'audioinput');

  // Set the Video Devices so we can show on the UI
  addDevicesToDropDown(
    'videoDevices',
    video_devices,
    localStorage.getItem('videoDeviceId')
  );
  // Set the Audio Devices so we can show on the UI
  addDevicesToDropDown(
    'audioDevices',
    audio_devices,
    localStorage.getItem('audioDeviceId')
  );
}

// Run the async function
getMediaDevices(constraints);

// This method is called on button push to connect our call
function connectCall() {
  let videoDevice = document.getElementsByClassName('videoDevices')[0];
  let videoDeviceId = videoDevice.options[videoDevice.selectedIndex].value;

  let audioDevice = document.getElementsByClassName('audioDevices')[0];
  let audioDeviceId = audioDevice.options[audioDevice.selectedIndex].value;

  let dialURI = document.getElementById('dialURI').value;
  let participantName = document.getElementById('participantName').value;

  selectDevices(videoDeviceId, audioDeviceId);

  if (dialURI && participantName) {
    // Make the actual call with the pexRTC Library
    // The first parameter should be changed to your conference nodes name
    pexRTC.makeCall(conferenceNode, dialURI, participantName);
  } else {
    alert('You must specify a name and a dial URI');
  }
}
