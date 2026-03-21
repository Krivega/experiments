export const supportsFileSystemAccess =
  'showSaveFilePicker' in window &&
  (() => {
    try {
      return window.self === window.top;
    } catch {
      return false;
    }
  })();

const createRecorder = (
  audioTrack: MediaStreamAudioTrack,
  {
    mimeType = 'audio/webm',
    suggestedName = 'microphone-recording.webm',
  }: { mimeType?: string; suggestedName?: string } = {},
) => {
  const stream = new MediaStream([audioTrack]);
  const mediaRecorder = new MediaRecorder(stream, { mimeType });

  const start = async () => {
    if (supportsFileSystemAccess) {
      const handle = await window.showSaveFilePicker({ suggestedName });
      const writable = await handle.createWritable();

      const write = async (data: Blob) => {
        // Write chunks to the file.
        await writable.write(data);

        if (mediaRecorder.state === 'inactive') {
          // Close the file when the recording stops.
          await writable.close();
        }
      };

      mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
        write(event.data).catch((error: unknown) => {
          // eslint-disable-next-line no-console
          console.log('error:', error);
        });
      });

      // Start recording.
      mediaRecorder.start();
    } else {
      throw new Error('Cannot start recording because filesystem is not supported');
    }
  };
  const stop = () => {
    mediaRecorder.stop();
  };

  return { start, stop };
};

export default createRecorder;
