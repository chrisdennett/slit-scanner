import { useRef } from "react";
import { WebcamFrameGrabber } from "./comps/WebcamFrameGrabber";
import "./styles.css";

export default function App() {
  const msPerFrame = 25;

  const slicePositionCanvasRef = useRef();
  const slitScanCanvasRef = useRef();

  const frameWidth = 1280;
  const frameHeight = 720;
  const currXRef = useRef(1);

  const onFrame = ({ video, frameCount }) => {
    if (
      !slitScanCanvasRef ||
      !slicePositionCanvasRef.current ||
      frameHeight === 0
    )
      return;

    const sliceWidth = 1;

    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = frameWidth;
    frameCanvas.height = frameHeight;
    const frameCtx = frameCanvas.getContext("2d");
    const ctx = frameCanvas.getContext("2d");

    // draw webcam video to temp canvas
    ctx.translate(frameCanvas.width, 0);
    ctx.scale(-1, 1);
    frameCtx.drawImage(video, 0, 0);

    const slitScanCanvas = slitScanCanvasRef.current;
    if (slitScanCanvas.width !== frameWidth) {
      slitScanCanvas.width = frameWidth;
      slitScanCanvas.height = frameHeight;
    }

    const sliceX = currXRef.current;

    currXRef.current += sliceWidth;
    if (currXRef.current > slitScanCanvas.width) {
      currXRef.current = 0;
    }

    drawSliceToCanvas({
      sourceCanvas: frameCanvas,
      targetCanvas: slitScanCanvas,
      sliceWidth: sliceWidth,
      targetX: sliceX,
    });

    // reference Canvas
    const slicePositionCanvas = slicePositionCanvasRef.current;
    drawPositionSliceCanvas({
      sourceCanvas: frameCanvas,
      targetCanvas: slicePositionCanvas,
      sliceWidth,
      canvasWidth: 500,
    });
  };

  return (
    <div className="app">
      <canvas ref={slitScanCanvasRef} />
      <canvas ref={slicePositionCanvasRef} style={{ display: "none2" }} />

      <WebcamFrameGrabber onFrame={onFrame} frameInterval={msPerFrame} />
    </div>
  );
}

const drawPositionSliceCanvas = ({
  sourceCanvas,
  targetCanvas,
  canvasWidth,
  sliceWidth,
}) => {
  if (!sourceCanvas || !targetCanvas) return;

  const ctx = targetCanvas.getContext("2d");
  targetCanvas.width = canvasWidth ? canvasWidth : sourceCanvas.width;
  const wToHeightRatio = sourceCanvas.height / sourceCanvas.width;
  targetCanvas.height = canvasWidth
    ? canvasWidth * wToHeightRatio
    : sourceCanvas.height;

  const scale = targetCanvas.width / sourceCanvas.width;
  const scaledWidth = sliceWidth * scale;
  const canvasCenterX = targetCanvas.width / 2;
  const sliceX = canvasCenterX - scaledWidth / 2;

  ctx.save();
  ctx.scale(scale, scale);
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.restore();

  ctx.fillStyle = "rgba(0,0,0,0.6)";

  ctx.fillRect(0, 0, sliceX, targetCanvas.height);
  ctx.fillRect(
    sliceX + scaledWidth,
    0,
    targetCanvas.width - sliceX + scaledWidth,
    targetCanvas.height
  );

  ctx.fillStyle = "rgba(255,0,0,1)";
  ctx.fillRect(sliceX, 0, scaledWidth, targetCanvas.height);
};

const drawSliceToCanvas = ({
  sourceCanvas,
  targetCanvas,
  sliceWidth,
  targetX = null,
}) => {
  const ctx = targetCanvas.getContext("2d");

  const canvasCenterX = sourceCanvas.width / 2;
  const srcX = canvasCenterX - sliceWidth / 2;
  const srcY = 0;
  const srcW = sliceWidth;
  const srcH = sourceCanvas.height;
  const targX = targetX !== null ? targetX : srcX;
  const targY = 0;
  const targW = sliceWidth;
  const targH = srcH;

  ctx.drawImage(
    sourceCanvas,
    srcX,
    srcY,
    srcW,
    srcH,
    targX,
    targY,
    targW,
    targH
  );
};
