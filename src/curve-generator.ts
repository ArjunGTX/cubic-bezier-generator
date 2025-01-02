export type CurveCords = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DraggingPoint = {
  point: "p1" | "p2" | null;
  x: number;
  y: number;
};

export class CurveGenerator {
  // Store the canvas element reference
  private readonly canvas: HTMLCanvasElement;
  // The buffer around the control points to make it easier to drag them
  private readonly pointerBuffer = 30;
  // The point that is currently being dragged
  private draggingPoint: DraggingPoint | null = null;
  // The curve control points initialized with default values
  private readonly curve: CurveCords = {
    x1: 0.25,
    y1: 0.75,
    x2: 0.75,
    y2: 0.25,
  };
  // The canvas rendering context
  private ctx: CanvasRenderingContext2D;
  // List of subscribers to the curve change event
  private curveChangeCallbacks: ((curve: CurveCords) => void)[] = [];

  private onMouseDown = (e: MouseEvent) => {
    // Update the dragging point based on the mouse coordinates
    this.draggingPoint = this.calculateDraggingPoint(e.clientX, e.clientY);
  };

  private onMouseUp = () => {
    // Reset the dragging point when the mouse is released
    this.draggingPoint = null;
  };

  private clampCanvasCord = (cord: number) => {
    // Clamp the coordinate to the range [0,1]
    return Math.max(0, Math.min(1, cord));
  };

  private updateCurve = (clientX: number, clientY: number) => {
    // Calculate the dragging point based on the mouse coordinates
    const point = this.calculateDraggingPoint(clientX, clientY);
    // Update the cursor based on the dragging point
    this.canvas.style.cursor = this.draggingPoint
      ? "grabbing"
      : point?.point
        ? "grab"
        : "default";
    // Update the curve control points based on the dragging point
    const x = this.clampCanvasCord(point.x);
    const y = this.clampCanvasCord(point.y);
    if (this.draggingPoint?.point === "p1") {
      this.curve.x1 = x;
      this.curve.y1 = y;
    } else if (this.draggingPoint?.point === "p2") {
      this.curve.x2 = x;
      this.curve.y2 = y;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    this.updateCurve(e.clientX, e.clientY);
  };

  private onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      // Prevent default behavior to avoid interfering with touch scrolling and zooming if a point is being dragged
      if (this.draggingPoint?.point) {
        e.preventDefault();
      }
      this.updateCurve(touch.clientX, touch.clientY);
    }
  };

  private onTouchStart = (e: TouchEvent) => {
    // Prevent default behavior to avoid interfering with touch scrolling
    e.preventDefault();

    // Get the first touch point
    const touch = e.touches[0];
    if (touch) {
      // Update the dragging point based on touch coordinates
      this.draggingPoint = this.calculateDraggingPoint(
        touch.clientX,
        touch.clientY,
      );
    }
  };

  private animate = () => {
    // Update the canvas on each frame
    this.updateCanvas();
    requestAnimationFrame(this.animate);
  };

  private updateCanvasDimensions = () => {
    // Set the canvas dimensions based on the window width
    const size = Math.min(window.innerWidth - 30, 400);
    this.canvas.width = size;
    this.canvas.height = size;
  };

  private drawDiagonal = () => {
    const { height: canvasHeight, width: canvasWidth } = this.canvas;
    this.ctx.beginPath();
    this.ctx.moveTo(0, canvasHeight);
    this.ctx.lineTo(canvasWidth, 0);
    this.ctx.strokeStyle = "#555555";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  };

  // Draw the control points on the canvas
  private drawPoint = (type: "p1" | "p2") => {
    const { height: canvasHeight, width: canvasWidth } = this.canvas;
    // Calculate the position of the point on the canvas based on the x,y coordinates and the canvas dimensions
    const cordX = type === "p1" ? this.curve.x1 : this.curve.x2;
    const cordY = type === "p1" ? this.curve.y1 : this.curve.y2;
    const x = cordX * canvasWidth;
    const y = canvasHeight - cordY * canvasHeight;

    const pointRadius = 15;

    // Draw the point
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw the label
    this.ctx.font = "14px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "black";
    this.ctx.fillText(type.toUpperCase(), x, y);

    // Draw the coordinates
    this.ctx.font = "12px sans-serif";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(`(${cordX},${cordY})`, x, y + pointRadius * 2);
  };

  private drawCurve = () => {
    const { height: canvasHeight, width: canvasWidth } = this.canvas;
    const { x1, y1, x2, y2 } = this.curve;
    this.ctx.beginPath();
    this.ctx.moveTo(0, canvasHeight);
    // Draw the curve based on the control points
    this.ctx.bezierCurveTo(
      x1 * canvasWidth,
      canvasHeight - y1 * canvasHeight,
      x2 * canvasWidth,
      canvasHeight - y2 * canvasHeight,
      canvasWidth,
      0,
    );
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  };

  private updateCanvas = () => {
    // Clear the canvas and redraw the control points and the curve
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawDiagonal();
    this.drawPoint("p1");
    this.drawPoint("p2");
    this.drawCurve();
    // Publish the updated curve to the subscribers
    this.curveChangeCallbacks.forEach((callback) => callback(this.curve));
  };

  private calculateDraggingPoint = (
    clientX: number,
    clientY: number,
  ): DraggingPoint => {
    const { x, y, width, height } = this.canvas.getBoundingClientRect();
    // Calculate the click coordinates relative to the canvas
    const clickX = clientX - x;
    const clickY = clientY - y;
    // Calculate the control points' coordinates based on the canvas dimensions
    const { x1, x2, y1, y2 } = this.curve;
    const x1Cord = x1 * width;
    const x2Cord = x2 * width;
    const y1Cord = height - y1 * height;
    const y2Cord = height - y2 * height;
    let point: "p1" | "p2" | null = null;
    // Check if the click is within the buffer zone of the control points and set the dragging point accordingly
    if (
      clickX < x1Cord + this.pointerBuffer &&
      clickX > x1Cord - this.pointerBuffer &&
      clickY < y1Cord + this.pointerBuffer &&
      clickY > y1Cord - this.pointerBuffer
    ) {
      point = "p1";
    }
    if (
      clickX < x2Cord + this.pointerBuffer &&
      clickX > x2Cord - this.pointerBuffer &&
      clickY < y2Cord + this.pointerBuffer &&
      clickY > y2Cord - this.pointerBuffer
    ) {
      point = "p2";
    }
    // Return the dragging point and the normalized x,y coordinates
    return {
      point,
      x: +(clickX / width).toFixed(2),
      y: +((height - clickY) / height).toFixed(2),
    };
  };

  constructor(canvas: HTMLCanvasElement, defaultCurve?: CurveCords) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to retrieve the canvas context!");
    }
    this.ctx = ctx;

    if (defaultCurve) {
      this.curve = { ...defaultCurve };
    }

    // Initialize the canvas
    this.updateCanvasDimensions();
    this.animate();

    window.addEventListener("resize", this.updateCanvasDimensions);
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("touchstart", this.onTouchStart);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("touchend", this.onMouseUp);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("touchmove", this.onTouchMove);
  }

  generateCurveString(curve: CurveCords): string {
    // Generate the cubic-bezier string based on the curve control points
    const { x1, x2, y1, y2 } = curve;
    return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  }

  getCurrentCurveString(): string {
    return this.generateCurveString(this.curve);
  }

  getCurrentCurveCoordinates(): CurveCords {
    return this.curve;
  }

  onCurveChange(callback: (curve: CurveCords) => void) {
    this.curveChangeCallbacks.push(callback);
  }
}
