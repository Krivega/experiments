/* eslint-disable no-alert */
/* eslint-disable no-console */

import ConstraintsChecked from './constraintsChecked';
import initDevices from './initDevices';
import PlaybackRecorders from './playbackRecorders';
import processNoiseSuppressions, {
  stopEffect,
  type NoiseSuppressionAlgorithm,
} from './processNoiseSuppressions';

const audioInputSelect = document.querySelector<HTMLSelectElement>('#audioInputSelect');
const noiseSuppressionAlgorithmFieldset = document.querySelector<HTMLFieldSetElement>(
  '#noiseSuppressionAlgorithm',
);
const selectedAlgorithmElement = document.querySelector<HTMLElement>('#selectedAlgorithm');
const currentModeElement = document.querySelector<HTMLElement>('#currentMode');
const inputSampleRateElement = document.querySelector<HTMLElement>('#inputSampleRate');
const outputSampleRateElement = document.querySelector<HTMLElement>('#outputSampleRate');
const audioContextSampleRateElement =
  document.querySelector<HTMLElement>('#audioContextSampleRate');
const workletStatusElement = document.querySelector<HTMLElement>('#workletStatus');
const workletReadyElement = document.querySelector<HTMLElement>('#workletReady');
const workletWarningElement = document.querySelector<HTMLElement>('#workletWarning');
const workletErrorElement = document.querySelector<HTMLElement>('#workletError');
const playbackSection = document.querySelector<HTMLElement>('#playback');
const stopButton = document.querySelector<HTMLButtonElement>('#stop');
const startButton = document.querySelector<HTMLButtonElement>('#start');
const playbackOriginal = document.querySelector<HTMLAudioElement>('#playbackOriginal');
const playbackProcessed = document.querySelector<HTMLAudioElement>('#playbackProcessed');
const echoCancellationCheckbox = new ConstraintsChecked('echoCancellation');
const noiseSuppressionCheckbox = new ConstraintsChecked('noiseSuppression');
const autoGainControlCheckbox = new ConstraintsChecked('autoGainControl');

if (
  !audioInputSelect ||
  !noiseSuppressionAlgorithmFieldset ||
  !selectedAlgorithmElement ||
  !currentModeElement ||
  !inputSampleRateElement ||
  !outputSampleRateElement ||
  !audioContextSampleRateElement ||
  !workletStatusElement ||
  !workletReadyElement ||
  !workletWarningElement ||
  !workletErrorElement ||
  !stopButton ||
  !startButton ||
  !playbackOriginal ||
  !playbackProcessed ||
  !playbackSection
) {
  throw new Error('Some elements are not exist');
}

let stopRecord: (() => Promise<void>) | undefined;
let currentInputTrackRate: number | undefined;
let currentOutputTrackRate: number | undefined;
let currentContextRate: number | undefined;
const playbackRecorders = new PlaybackRecorders(playbackOriginal, playbackProcessed);

const disableStartButton = () => {
  stopButton.disabled = false;
  startButton.disabled = true;
};
const enableStartButton = () => {
  stopButton.disabled = true;
  startButton.disabled = false;
};

const formatSampleRate = (rate?: number): string => {
  return rate === undefined ? 'unknown' : `${rate} Hz`;
};

const formatProcessorMessage = (message: unknown): string => {
  if (typeof message === 'string') {
    return message;
  }

  if (typeof message === 'object' && message !== null) {
    const type = 'type' in message && typeof message.type === 'string' ? message.type : 'message';
    const text =
      'message' in message && typeof message.message === 'string'
        ? message.message
        : JSON.stringify(message);

    return `${type}: ${text}`;
  }

  return String(message);
};

const setCurrentMode = (mode: string) => {
  currentModeElement.textContent = mode;
};

const resetProcessorMessages = () => {
  workletReadyElement.textContent = 'none';
  workletWarningElement.textContent = 'none';
  workletErrorElement.textContent = 'none';
};

const updateProcessorMessage = (message: unknown) => {
  workletStatusElement.textContent = formatProcessorMessage(message);

  if (typeof message !== 'object' || message === null || !('type' in message)) {
    return;
  }

  const messageType = message.type;

  if (messageType === 'ready') {
    workletReadyElement.textContent = 'ready';

    return;
  }

  if (messageType === 'warning') {
    workletWarningElement.textContent =
      'message' in message && typeof message.message === 'string' ? message.message : 'warning';

    return;
  }

  if (messageType === 'error') {
    workletErrorElement.textContent =
      'message' in message && typeof message.message === 'string' ? message.message : 'error';
  }
};

const updateSampleRateInfo = ({
  inputTrackRate,
  outputTrackRate,
  contextRate,
}: {
  inputTrackRate?: number;
  outputTrackRate?: number;
  contextRate?: number;
}) => {
  currentInputTrackRate = inputTrackRate;
  currentOutputTrackRate = outputTrackRate;
  currentContextRate = contextRate;

  inputSampleRateElement.textContent = formatSampleRate(currentInputTrackRate);
  outputSampleRateElement.textContent = formatSampleRate(currentOutputTrackRate);
  audioContextSampleRateElement.textContent = formatSampleRate(currentContextRate);
};

const resetStatus = () => {
  updateSampleRateInfo({});
  workletStatusElement.textContent = 'idle';
  setCurrentMode('idle');
  resetProcessorMessages();
  playbackSection.classList.add('is-disabled');
};

const getNoiseSuppressionAlgorithm = (): NoiseSuppressionAlgorithm => {
  const checked = noiseSuppressionAlgorithmFieldset.querySelector<HTMLInputElement>(
    'input[name="noiseSuppressionAlgorithm"]:checked',
  );

  if (!checked) {
    throw new Error('No noise suppression algorithm selected');
  }

  const selectedAlgorithmValue = checked.value;

  if (
    selectedAlgorithmValue === 'off' ||
    selectedAlgorithmValue === 'rnnoise' ||
    selectedAlgorithmValue === 'dtln'
  ) {
    return selectedAlgorithmValue;
  }

  throw new Error(`Unsupported noise suppression algorithm: ${selectedAlgorithmValue}`);
};

const start = () => {
  disableStartButton();
  playbackRecorders.clearPlaybackUrls();

  const deviceId = audioInputSelect.value;
  const noiseSuppressionAlgorithm: NoiseSuppressionAlgorithm = getNoiseSuppressionAlgorithm();

  selectedAlgorithmElement.textContent = noiseSuppressionAlgorithm;
  setCurrentMode(
    noiseSuppressionAlgorithm === 'off'
      ? 'input passthrough'
      : `${noiseSuppressionAlgorithm} active`,
  );
  workletStatusElement.textContent =
    noiseSuppressionAlgorithm === 'off' ? 'noise suppression disabled' : 'starting';
  resetProcessorMessages();
  updateSampleRateInfo({});

  navigator.mediaDevices
    .getUserMedia({
      audio: {
        deviceId,
        echoCancellation: echoCancellationCheckbox.checked,
        noiseSuppression: noiseSuppressionCheckbox.checked,
        autoGainControl: autoGainControlCheckbox.checked,
      },
    })
    .then((mediaStream) => {
      return mediaStream.getAudioTracks()[0];
    })
    .then(async (inputAudioTrack) => {
      updateSampleRateInfo({
        inputTrackRate: inputAudioTrack.getSettings().sampleRate,
      });

      return processNoiseSuppressions(inputAudioTrack, noiseSuppressionAlgorithm, {
        onAudioContextCreated: (audioContext: AudioContext) => {
          updateSampleRateInfo({
            inputTrackRate: inputAudioTrack.getSettings().sampleRate,
            outputTrackRate: currentOutputTrackRate,
            contextRate: audioContext.sampleRate,
          });
        },
        onProcessorMessage: (message) => {
          updateProcessorMessage(message);
        },
      }).then((processedAudioTrack) => {
        return { inputAudioTrack, processedAudioTrack };
      });
    })
    .then(async ({ inputAudioTrack, processedAudioTrack }) => {
      updateSampleRateInfo({
        inputTrackRate: currentInputTrackRate,
        outputTrackRate: processedAudioTrack.getSettings().sampleRate,
        contextRate: currentContextRate,
      });

      playbackRecorders.startRecording(inputAudioTrack, processedAudioTrack);

      return async () => {
        await playbackRecorders.stopRecordingAndAssignPlayback();
      };
    })
    .then((stopRecording) => {
      stopRecord = stopRecording;
    })
    .catch((error: unknown) => {
      console.log('🚀 ~ file: demo.js:34 ~ start ~ error:', error);

      alert(error);
      resetStatus();

      enableStartButton();
    });
};

initDevices(audioInputSelect);
enableStartButton();
resetStatus();
startButton.addEventListener('click', start);
noiseSuppressionAlgorithmFieldset.addEventListener('change', ({ target }) => {
  if (!(target instanceof HTMLInputElement) || target.name !== 'noiseSuppressionAlgorithm') {
    return;
  }

  const selectedNoiseSuppressionAlgorithm: NoiseSuppressionAlgorithm =
    getNoiseSuppressionAlgorithm();

  selectedAlgorithmElement.textContent = selectedNoiseSuppressionAlgorithm;
  setCurrentMode(
    selectedNoiseSuppressionAlgorithm === 'off'
      ? 'idle'
      : `${selectedNoiseSuppressionAlgorithm} selected`,
  );
});

const handleStopClick = async () => {
  const finalizeRecording = stopRecord;

  stopRecord = undefined;

  try {
    await finalizeRecording?.();
  } catch (error: unknown) {
    console.error(error);
  }

  try {
    await stopEffect();
  } catch (error: unknown) {
    console.error(error);
  }

  workletStatusElement.textContent = 'stopped';
  setCurrentMode('stopped');
  enableStartButton();
  playbackSection.classList.remove('is-disabled');
};

stopButton.addEventListener('click', () => {
  handleStopClick().catch((error: unknown) => {
    console.error(error);
  });
});
