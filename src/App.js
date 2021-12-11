import { useRef, useState } from "react";
import { WebcamFrameGrabber } from "./comps/WebcamFrameGrabber";
import "./styles.css";
import {
  drawPositionSliceCanvas,
  drawSliceToScrolledCanvas,
  drawSwipeRightCanvas,
} from "./utils/canvasFunctions";

const modeOptions = ["swipeRight", "scrollRight", "scrollLeft"];

export default function App() {
  const [sliceWidth, setSliceWidth] = useState(1);
  const [msPerFrame, setMsPerFrame] = useState(22);
  const [isReflected, setIsReflected] = useState(true);
  const currentMode = modeOptions[1];

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

    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = frameWidth;
    frameCanvas.height = frameHeight;
    const frameCtx = frameCanvas.getContext("2d");

    // draw webcam video to temp canvas to flip it
    frameCtx.translate(frameCanvas.width, 0);
    frameCtx.scale(-1, 1);
    frameCtx.drawImage(video, 0, 0);

    // create slit scan
    const slitScanCanvas = slitScanCanvasRef.current;
    if (slitScanCanvas.width !== frameWidth) {
      slitScanCanvas.width = frameWidth;
      slitScanCanvas.height = frameHeight;
    }

    // use a refence to keep track of xPos
    currXRef.current += sliceWidth;
    if (currXRef.current > slitScanCanvas.width) {
      currXRef.current = 0;
    }

    const sliceX = currXRef.current;

    if (currentMode === "scrollRight") {
      drawSliceToScrolledCanvas({
        sourceCanvas: frameCanvas,
        targetCanvas: slitScanCanvas,
        sliceWidth: sliceWidth,
        targetX: sliceX,
        direction: "scrollRight",
        isReflected,
      });
    } else if (currentMode === "scrollLeft") {
      drawSliceToScrolledCanvas({
        sourceCanvas: frameCanvas,
        targetCanvas: slitScanCanvas,
        sliceWidth: sliceWidth,
        targetX: sliceX,
        direction: "scrollLeft",
        isReflected,
      });
    } else {
      drawSwipeRightCanvas({
        sourceCanvas: frameCanvas,
        targetCanvas: slitScanCanvas,
        sliceWidth: sliceWidth,
        targetX: sliceX,
        isReflected,
      });
    }

    // Reflection
    // if (isReflected) {
    //   const ctx = slitScanCanvas.getContext("2d");
    //   ctx.save();
    //   if (isReflected) {
    //     ctx.scale(1, -1);
    //     ctx.translate(0, -slitScanCanvas.height);
    //     const reflectHeight = slitScanCanvas.height / 2;
    //     const reflectWidth = slitScanCanvas.width;
    //     ctx.drawImage(
    //       slitScanCanvas,
    //       0,
    //       0,
    //       reflectWidth,
    //       reflectHeight,
    //       0,
    //       0,
    //       reflectWidth,
    //       reflectHeight
    //     );
    //   }
    //   ctx.restore();
    // }

    // reference Canvas
    const slicePositionCanvas = slicePositionCanvasRef.current;
    drawPositionSliceCanvas({
      sourceCanvas: frameCanvas,
      targetCanvas: slicePositionCanvas,
      sliceWidth,
      canvasWidth: 500,
      isReflected,
    });
  };

  return (
    <div className="app">
      <div style={{ color: "white" }}>
        <div>
          isReflected:
          <input
            type="checkbox"
            min={1}
            max={300}
            value={isReflected}
            onChange={(e) => setIsReflected(e.target.checked)}
          />
        </div>
        <div>
          sliceWidth:
          <input
            type="range"
            min={1}
            max={300}
            value={sliceWidth}
            onChange={(e) => setSliceWidth(e.target.value)}
          />
        </div>
        <div>
          msPerFrame:
          <input
            type="range"
            min={1}
            max={100}
            value={msPerFrame}
            onChange={(e) => setMsPerFrame(e.target.value)}
          />
          {msPerFrame}
        </div>
      </div>

      <canvas ref={slitScanCanvasRef} />
      <canvas ref={slicePositionCanvasRef} style={{ display: "none" }} />

      <WebcamFrameGrabber onFrame={onFrame} frameInterval={msPerFrame} />
    </div>
  );
}
