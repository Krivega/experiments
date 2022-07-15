const mediaStreamToVideo = (mediaStream: MediaStream): Promise<HTMLVideoElement> => {
  const videoElement = document.createElement('video');

  videoElement.srcObject = mediaStream;

  return new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      videoElement.width = videoElement.videoWidth;
      videoElement.height = videoElement.videoHeight;
      videoElement.play();
      resolve(videoElement);
    };
  });
};

export default mediaStreamToVideo;
