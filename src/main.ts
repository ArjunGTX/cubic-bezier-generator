import { CurveGenerator } from "./curve-generator";
import "./style.css";

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
const copyButton = document.getElementById(
  "copy-btn",
) as HTMLButtonElement | null;
const output = document.getElementById("output") as HTMLElement | null;
const box = document.getElementById("box") as HTMLDivElement | null;

if (!canvas) {
  throw new Error("Canvas element not found!");
}

const curve = new CurveGenerator(canvas);

curve.onCurveChange((curveCords) => {
  const curveString = curve.generateCurveString(curveCords);
  if (output) {
    output.textContent = `animation-timing-function: ${curveString}`;
  }
  if (box) {
    box.style.animationTimingFunction = curveString;
  }
});

// Enable copying the curve value to the clipboard
copyButton?.addEventListener("click", function () {
  navigator.clipboard.writeText(
    `animation-timing-function: ${curve.getCurrentCurveString()}`,
  );
  this.textContent = "Copied!";
  // Reset the button text after 1 second
  setTimeout(() => {
    this.textContent = "Copy";
  }, 1000);
});
