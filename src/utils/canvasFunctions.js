export const drawSliceToScrolledCanvas = ({
  sourceCanvas,
  targetCanvas,
  sliceWidth,
  isReflected,
}) => {
  const ctx = targetCanvas.getContext("2d");

  const sliceXFrac = 0.5;
  const widthBeforeScan = sourceCanvas.width * sliceXFrac;

  drawLiveWebcamSection({
    src: sourceCanvas,
    target: targetCanvas,
    w: widthBeforeScan,
    isReflected,
  });

  // draw the target image to itself
  const xToShiftRightFrom = widthBeforeScan - sliceWidth;
  const widthToShiftRight = targetCanvas.width - xToShiftRightFrom;
  const shiftToX = widthBeforeScan;

  ctx.drawImage(
    targetCanvas,
    xToShiftRightFrom,
    0,
    widthToShiftRight,
    targetCanvas.height,
    shiftToX,
    0,
    widthToShiftRight,
    targetCanvas.height
  );
};

const drawLiveWebcamSection = ({ target, src, w, isReflected }) => {
  const ctx = target.getContext("2d");
  const h = src.height;

  // draw live webcam portion of screen
  ctx.drawImage(src, 0, 0, w, h, 0, 0, w, h);

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.7;
  ctx.drawImage(src, 0, 0, w, h, 0, 0, w, h);
  ctx.restore();

  if (isReflected) {
    const halfH = h / 2;

    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(target, 0, 0, w, halfH, 0, halfH * -2, w, halfH);
    ctx.restore();
  }
};

export const drawSwipeRightCanvas = ({
  sourceCanvas,
  targetCanvas,
  sliceWidth,
  targetX = null,
}) => {
  drawSliceToCanvas({
    sourceCanvas,
    targetCanvas,
    sliceWidth,
    targetX,
  });
};

export const drawSliceToCanvas = ({
  sourceCanvas,
  targetCanvas,
  sliceWidth,
  targetX = null,
  isReflected,
  effect,
}) => {
  const ctx = targetCanvas.getContext("2d");

  const canvasCenterX = sourceCanvas.width / 2;
  const reflectHeight = sourceCanvas.height / 2;
  const srcX = canvasCenterX - sliceWidth / 2;
  const srcY = 0;
  const srcW = sliceWidth;
  const srcH = isReflected ? reflectHeight : sourceCanvas.height;
  const targX = targetX;
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

  ctx.save();
  if (isReflected) {
    ctx.scale(1, -1);
    ctx.translate(0, -sourceCanvas.height);
    const reflectWidth = sliceWidth;
    ctx.drawImage(
      sourceCanvas,
      srcX,
      srcY,
      reflectWidth,
      reflectHeight,
      0,
      0,
      reflectWidth,
      reflectHeight
    );
  }
  ctx.restore();
};

export const drawPositionSliceCanvas = ({
  sourceCanvas,
  targetCanvas,
  canvasWidth,
  sliceWidth,
  isReflected,
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
  if (isReflected) {
    ctx.scale(1, -1);
    ctx.translate(0, -sourceCanvas.height);
    const reflectHeight = sourceCanvas.height / 2;
    const reflectWidth = sourceCanvas.width;
    ctx.drawImage(
      sourceCanvas,
      0,
      0,
      reflectWidth,
      reflectHeight,
      0,
      0,
      reflectWidth,
      reflectHeight
    );
  }
  ctx.restore();

  ctx.fillStyle = "rgba(0,0,0,0.6)";

  ctx.fillRect(0, 0, sliceX, targetCanvas.height);
  ctx.fillRect(
    sliceX + scaledWidth,
    0,
    targetCanvas.width - sliceX + scaledWidth,
    targetCanvas.height
  );

  ctx.fillStyle = "rgba(255,0,0,0.5)";
  ctx.fillRect(sliceX, 0, scaledWidth, targetCanvas.height);
};
