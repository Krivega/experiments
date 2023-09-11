import processNoiseSuppressions, { stopEffect } from './processNoiseSuppressions';

const audioInputSelect = document.querySelector<HTMLSelectElement>('#audioInputSelect');
const downloadLink = document.querySelector<HTMLAnchorElement>('#download');
const stopButton = document.querySelector<HTMLButtonElement>('#stop');
const startButton = document.querySelector<HTMLButtonElement>('#start');
const enabledCheckbox = document.querySelector<HTMLInputElement>('#enabled');

if (!audioInputSelect || !downloadLink || !stopButton || !startButton || !enabledCheckbox) {
  throw new Error('Some elements are not exist');
}

const record = async (audioTrack) => {
  const stream = new MediaStream([audioTrack]);
  const options = { mimeType: 'audio/webm' };
  const recordedChunks = [];
  const mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.addEventListener('dataavailable', (e) => {
    if (e.data.size > 0) {
      // @ts-ignore
      recordedChunks.push(e.data);
    }
  });

  mediaRecorder.addEventListener('stop', () => {
    downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
    downloadLink.download = 'acetest.wav';
  });

  stopButton.addEventListener('click', () => {
    stopEffect();
    mediaRecorder.stop();
    stopButton.disabled = true;
    startButton.disabled = false;
  });

  mediaRecorder.start();
};

const start = () => {
  stopButton.disabled = false;
  startButton.disabled = true;

  const deviceId = audioInputSelect.value;

  navigator.mediaDevices
    .getUserMedia({
      audio: {
        deviceId,
      },
    })
    .then((mediaStream) => {
      return mediaStream.getAudioTracks()[0];
    })
    .then((audioTrack) => {
      if (enabledCheckbox.checked) {
        return processNoiseSuppressions(audioTrack);
      }

      return audioTrack;
    })
    .then(record)
    .catch((error) => {
      console.log('🚀 ~ file: demo.js:34 ~ start ~ error:', error);

      alert(error);

      stopButton.disabled = true;
      startButton.disabled = false;
    });
};

navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
  for (let index = 0; index !== deviceInfos.length; ++index) {
    const deviceInfo = deviceInfos[index];
    const option = document.createElement('option');

    option.value = deviceInfo.deviceId;

    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `Microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.append(option);
    }
  }
});

startButton?.addEventListener('click', start);
