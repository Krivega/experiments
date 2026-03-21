const createVideoFromMediaStream = async (mediaStream: MediaStream): Promise<HTMLVideoElement> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');

    video.srcObject = mediaStream;
    video.muted = true;
    video.autoplay = true;

    video.addEventListener('canplay', () => {
      resolve(video);
    });
  });
};

export default createVideoFromMediaStream;
