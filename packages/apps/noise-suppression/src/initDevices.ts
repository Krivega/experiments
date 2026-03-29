/* eslint-disable no-alert */
const initDevices = (audioInputSelect: HTMLSelectElement) => {
  navigator.permissions
    .query({ name: 'microphone' })
    .then(async (result) => {
      if (result.state !== 'granted') {
        return navigator.mediaDevices
          .getUserMedia({
            audio: true,
          })
          .then((mediaStream) => {
            for (const track of mediaStream.getTracks()) {
              track.stop();
            }
          });
      }

      return undefined;
    })
    .then(async () => {
      return navigator.mediaDevices.enumerateDevices();
    })

    .then((deviceInfos) => {
      for (let index = 0; index !== deviceInfos.length; ++index) {
        const deviceInfo = deviceInfos[index];
        const option = document.createElement('option');

        option.value = deviceInfo.deviceId;

        if (deviceInfo.kind === 'audioinput') {
          option.text = deviceInfo.label || `Microphone ${index}`;
          audioInputSelect.append(option);
        }
      }
    })
    .catch(() => {
      alert('error get devices');
    });
};

export default initDevices;
