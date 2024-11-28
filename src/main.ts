import "./style.css";

import { CanvasCamera } from "./camera";
import { setupClockAdjuster } from "./clockAdjuster";

// const app = document.querySelector<HTMLDivElement>("#app")!;
const video = document.getElementById("video") as HTMLVideoElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

(async () => {
  const canvasCamera = new CanvasCamera(video, canvas);
  await canvasCamera.startup();
  await new Promise<void>((resolve) => setTimeout(resolve, 2500));
  setupClockAdjuster(canvas);
})();
