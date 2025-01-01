# Cubic Bezier Curve Generator

This project is a web-based tool for generating cubic bezier curves for CSS animations. It allows users to visually adjust the control points of a cubic bezier curve and see the resulting animation in real-time.

## Features

- Interactive canvas to drag control points and adjust the curve
- Real-time preview of the animation
- Copy the generated `cubic-bezier` value to the clipboard
- Responsive design

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/ArjunGTX/cubic-bezier-generator.git
   cd cubic-bezier-generator
   ```
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Running the Development Server
   ```sh
   npm run dev
   ```
   This will start the Vite development server and you can view the application in your browser at http://localhost:5173.

### Building for Production
To build the project for production, run:
   ```sh
   npm run build
   ```
   The production-ready files will be generated in the dist directory.


### Usage
1. Open the application in your browser.
2. Drag the control points P1 and P2 on the canvas to adjust the curve.
3. The generated cubic-bezier value will be displayed in the output section.
4. Click the "Copy" button to copy the value to the clipboard.
5. Use the copied value in your CSS animation-timing-function property.

## About This Project
I created this project to experiment with Object-Oriented Programming (OOP) in TypeScript, the HTML canvas element, and vanilla JavaScript. This project is built purely using HTML, CSS, and vanilla JavaScript; no libraries were used. 