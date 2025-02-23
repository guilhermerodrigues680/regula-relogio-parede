import "./style.css";

import { CanvasCamera } from "./camera";
import { setupClockAdjuster } from "./clockAdjuster";
import { ElementLogger } from "./logger";

// const app = document.querySelector<HTMLDivElement>("#app")!;
const video = document.getElementById("video") as HTMLVideoElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const logElem = document.getElementById("log")!;

const logger = new ElementLogger(logElem);

// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
logger.log(`Device pixel ratio: ${window.devicePixelRatio}`);

(async () => {
  const canvasCamera = new CanvasCamera(logger, video, canvas);
  await canvasCamera.startup();
  setupClockAdjuster(logger, canvas);
})()
  .then(() => console.debug("App started"))
  .catch((err) => console.error("Error starting app", err));
