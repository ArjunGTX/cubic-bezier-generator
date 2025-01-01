import "./style.css";

type Curve = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DraggingPoint = {
  x: number;
  y: number;
  point: "p1" | "p2" | null;
};

// Initial curve control points
const curve: Curve = {
  x1: 0.25,
  y1: 0.75,
  x2: 0.75,
  y2: 0.25,
};

let draggingPoint: DraggingPoint | null = null;

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
const copyButton = document.getElementById(
  "copy-btn",
) as HTMLButtonElement | null;
const output = document.getElementById("output") as HTMLElement | null;
const box = document.getElementById("box") as HTMLDivElement | null;

const ctx = canvas?.getContext("2d");

const pointerBuffer = 30;

if (!canvas) {
  throw new Error("Canvas element not found!");
}

if (!ctx) {
  throw new Error("Failed to retrieve the canvas context!");
}

// Enable copying the curve value to the clipboard
copyButton?.addEventListener("click", function () {
  navigator.clipboard.writeText(
    `animation-timing-function: ${generateCurveValue()}`,
  );
  this.textContent = "Copied!";
  // Reset the button text after 1 second
  setTimeout(() => {
    this.textContent = "Copy";
  }, 1000);
});

// Convert the curve object to a CSS cubic-bezier value
const generateCurveValue = () => {
  const { x1, x2, y1, y2 } = curve;
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
};

// Update the output text
const updateCurveOutput = () => {
  if (output) {
    output.textContent = `animation-timing-function: ${generateCurveValue()}`;
  }
  if (box) {
    box.style.animationTimingFunction = generateCurveValue();
  }
};

// Draw the control points on the canvas
const drawPoint = (type: "p1" | "p2") => {
  const { height: canvasHeight, width: canvasWidth } = canvas;
  // Calculate the position of the point on the canvas based on the x,y coordinates and the canvas dimensions
  const cordX = type === "p1" ? curve.x1 : curve.x2;
  const cordY = type === "p1" ? curve.y1 : curve.y2;
  const x = cordX * canvasWidth;
  const y = canvasHeight - cordY * canvasHeight;

  const pointRadius = 15;

  // Draw the point
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw the label
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(type.toUpperCase(), x, y);

  // Draw the coordinates
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(`(${cordX},${cordY})`, x, y + pointRadius * 2);
};

const drawDiagonal = () => {
  const { height: canvasHeight, width: canvasWidth } = canvas;
  ctx.beginPath();
  ctx.moveTo(0, canvasHeight);
  ctx.lineTo(canvasWidth, 0);
  ctx.strokeStyle = "#555555";
  ctx.lineWidth = 1;
  ctx.stroke();
};

const drawCurve = () => {
  const { height: canvasHeight, width: canvasWidth } = canvas;
  const { x1, y1, x2, y2 } = curve;
  ctx.beginPath();
  ctx.moveTo(0, canvasHeight);
  ctx.bezierCurveTo(
    x1 * canvasWidth,
    canvasHeight - y1 * canvasHeight,
    x2 * canvasWidth,
    canvasHeight - y2 * canvasHeight,
    canvasWidth,
    0,
  );
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.stroke();
};

const updateCanvasDimensions = () => {
  const size = Math.min(window.innerWidth - 30, 400);
  canvas.width = size;
  canvas.height = size;
};

const initCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawDiagonal();
  drawPoint("p1");
  drawPoint("p2");
  drawCurve();
  updateCurveOutput();
};

const calculateDraggingPoint = (
  clientX: number,
  clientY: number,
): DraggingPoint => {
  const { x, y, width, height } = canvas.getBoundingClientRect();
  const clickX = clientX - x;
  const clickY = clientY - y;
  const { x1, x2, y1, y2 } = curve;
  const x1Cord = x1 * width;
  const x2Cord = x2 * width;
  const y1Cord = height - y1 * height;
  const y2Cord = height - y2 * height;
  let point: "p1" | "p2" | null = null;
  if (
    clickX < x1Cord + pointerBuffer &&
    clickX > x1Cord - pointerBuffer &&
    clickY < y1Cord + pointerBuffer &&
    clickY > y1Cord - pointerBuffer
  ) {
    point = "p1";
  }
  if (
    clickX < x2Cord + pointerBuffer &&
    clickX > x2Cord - pointerBuffer &&
    clickY < y2Cord + pointerBuffer &&
    clickY > y2Cord - pointerBuffer
  ) {
    point = "p2";
  }
  return {
    point,
    x: +(clickX / width).toFixed(2),
    y: +((height - clickY) / height).toFixed(2),
  };
};

document.addEventListener("mousedown", (e) => {
  draggingPoint = calculateDraggingPoint(e.clientX, e.clientY);
});

document.addEventListener("mouseup", () => {
  draggingPoint = null;
});

canvas.addEventListener("mousemove", (e) => {
  const point = calculateDraggingPoint(e.clientX, e.clientY);
  canvas.style.cursor = draggingPoint
    ? "grabbing"
    : point?.point
      ? "grab"
      : "default";
  if (draggingPoint?.point === "p1") {
    curve.x1 = point.x;
    curve.y1 = point.y;
  } else if (draggingPoint?.point === "p2") {
    curve.x2 = point.x;
    curve.y2 = point.y;
  }
});

const animate = () => {
  initCanvas();
  requestAnimationFrame(animate);
};
animate();

window.addEventListener("load", () => {
  updateCurveOutput();
  updateCanvasDimensions();
});
window.addEventListener("resize", updateCanvasDimensions);
