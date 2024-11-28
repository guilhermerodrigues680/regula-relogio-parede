import "./style.css";

import { CanvasCamera } from "./camera";
import { setupClockAdjuster } from "./clockAdjuster";

setupClockAdjuster(document.querySelector<HTMLDivElement>("#app")!);
const canvasCamera = new CanvasCamera(
  document.getElementById("video") as HTMLVideoElement,
  document.getElementById("canvas") as HTMLCanvasElement
);
canvasCamera.startup();
