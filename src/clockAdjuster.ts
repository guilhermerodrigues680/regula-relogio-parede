import styles from "./clockAdjuster.module.css";

export function setupClockAdjuster(element: HTMLDivElement) {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = 400;
  canvasElement.height = 400;
  canvasElement.classList.add(styles["canvas"]);
  element.appendChild(canvasElement);
}
