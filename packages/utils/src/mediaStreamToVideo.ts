const mediaStreamToVideo = async (mediaStream: MediaStream): Promise<HTMLVideoElement> => {
  const videoElement = document.createElement('video');

  videoElement.srcObject = mediaStream;

  return new Promise((resolve, reject) => {
    videoElement.addEventListener('loadedmetadata', () => {
      videoElement.width = videoElement.videoWidth;
      videoElement.height = videoElement.videoHeight;
      videoElement
        .play()
        .then(() => {
          resolve(videoElement);
        })
        .catch(reject);
    });
  });
};

export default mediaStreamToVideo;
