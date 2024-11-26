import "./style.css";
import { setupClockAdjuster } from "./clockAdjuster";

setupClockAdjuster(document.querySelector<HTMLDivElement>("#app")!);
