import { useEffect, useRef, useState } from "react";

export const WebcamFrameGrabber = ({
  flippedX = true,
  frameInterval = 1000,
  webcamWidth = 1280,
  webcamHeight = 720,
  onFrame,
  hidden = true,
}) => {
  const videoRef = useRef();
  const canvasRef = useRef();

  const [frameCount, setFrameCount] = useState(0);
  const [videoSize, setVideoSize] = useState({ width: null, height: null });

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    onFrame({ video, frameCount });
  }, [frameCount, videoSize, flippedX, onFrame]);

  // set off counter
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCount((prev) => prev + 1);
    }, frameInterval);
    return () => clearInterval(interval);
  }, [frameInterval]);

  // SET OFF VIDEO WEBCAM
  useEffect(() => {
    var video = videoRef.current;
    let constraints = {
      audio: false,
      video: {
        width: { ideal: webcamWidth },
        height: { ideal: webcamHeight },
        // facingMode: { exact: "environment" }
      },
    };

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
          let stream_settings = stream.getVideoTracks()[0].getSettings();

          // actual width & height of the camera video
          let stream_width = stream_settings.width;
          let stream_height = stream_settings.height;
          setVideoSize({ width: stream_width, height: stream_height });

          video.srcObject = stream;
        })
        .catch(function (error) {
          console.log("Something went wrong!");
        });
    }
  }, [webcamWidth, webcamHeight]);

  const styles = hidden ? { display: "none" } : null;

  return (
    <div style={styles}>
      <h1>Frame frameCount: {frameCount.toFixed()}</h1>
      <video autoPlay={true} ref={videoRef} />
      <canvas ref={canvasRef} />
    </div>
  );
};
