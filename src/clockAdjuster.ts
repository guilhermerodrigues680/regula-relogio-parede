import styles from "./clockAdjuster.module.css";

interface ITimeProvider {
  getNow(): Date;
}

class SystemClock implements ITimeProvider {
  private static readonly instance = new SystemClock();

  private constructor() {}

  public static getInstance() {
    return this.instance;
  }

  public getNow(): Date {
    return new Date();
  }
}

class AcceleratedClock implements ITimeProvider {
  private readonly next: Date;
  private readonly factor: number;
  private lastCall: Date;

  public constructor(
    startDate: Date | null = null,
    factor: number | null = null
  ) {
    this.next = startDate ?? new Date();
    this.factor = factor ?? 100;
    this.lastCall = new Date();
  }

  public getNow(): Date {
    const d = new Date(this.next);

    const now = new Date();
    const ellapsed = now.getTime() - this.lastCall.getTime();

    this.next.setTime(this.next.getTime() + ellapsed * this.factor);
    this.lastCall = now;

    return d;
  }
}

type Center = {
  x: number;
  y: number;
  maxRadius: number;
};

class CanvasClock {
  private readonly canvasElement: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly center: Center;
  private readonly timeProvider: ITimeProvider;

  public constructor(
    canvasElement: HTMLCanvasElement,
    timeProvider: ITimeProvider | null = null
  ) {
    const ctx = canvasElement.getContext("2d");
    if (!ctx) {
      throw new Error("Falha ao obter contexto 2D do canvas");
    }

    const padding = 0;

    this.canvasElement = canvasElement;
    this.ctx = ctx;
    this.center = {
      x: (canvasElement.width - padding) / 2,
      y: (canvasElement.height - padding) / 2,

      get maxRadius() {
        return Math.min(this.x, this.y) - padding;
      },
    };

    this.timeProvider = timeProvider ?? SystemClock.getInstance();
  }

  public start() {
    this.update(0);
  }

  private update(time: DOMHighResTimeStamp) {
    this.clear();
    this.drawClock();
    requestAnimationFrame((time) => this.update(time));
  }

  private clear() {
    this.ctx.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
  }

  private drawClock() {
    this.drawClockFace();
    this.drawClockNumbers();
    this.drawHands();
    this.drawTimeText();
  }

  private startFromMid(v: number, steps: number) {
    const midAngle = Math.PI / 2;
    return (v * (Math.PI * 2)) / steps - midAngle;
  }

  private drawClockFace() {
    this.ctx.beginPath();
    this.ctx.arc(
      this.center.x,
      this.center.y,
      this.center.maxRadius,
      0,
      2 * Math.PI
    );
    this.ctx.stroke();
  }

  private drawClockNumbers() {
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const p = 10;
    for (let i = 0; i < 12; i++) {
      const angle = this.startFromMid(i, 12);
      const x = this.center.x + (this.center.maxRadius - p) * Math.cos(angle);
      const y = this.center.y + (this.center.maxRadius - p) * Math.sin(angle);
      this.ctx.fillText((i || 12).toString(), x, y);
    }

    this.ctx.restore();
  }

  private drawHands() {
    const hourHandLength = this.center.maxRadius * 0.5;
    const minuteHandLength = this.center.maxRadius * 0.7;
    const secondHandLength = this.center.maxRadius * 0.9;

    const now = this.timeProvider.getNow();
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes() + seconds / 60;
    const hours = now.getHours() + minutes / 60;

    const hourAngle = this.startFromMid(hours % 12, 12);
    const minuteAngle = this.startFromMid(minutes, 60);
    const secondAngle = this.startFromMid(seconds, 60);

    this.drawHand(hourHandLength, hourAngle);
    this.drawHand(minuteHandLength, minuteAngle);
    this.drawHand(secondHandLength, secondAngle);
  }

  private drawHand(length: number, angle: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.center.x, this.center.y);
    this.ctx.lineTo(
      this.center.x + length * Math.cos(angle),
      this.center.y + length * Math.sin(angle)
    );
    this.ctx.stroke();
  }

  public drawTimeText() {
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const now = this.timeProvider.getNow();
    const timeText = now.toLocaleTimeString();
    this.ctx.fillText(timeText, this.center.x, this.center.y * 2 * 0.75);

    this.ctx.restore();
  }
}

export function setupClockAdjuster(element: HTMLDivElement) {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = 400;
  canvasElement.height = 400;
  canvasElement.classList.add(styles["canvas"]);
  element.appendChild(canvasElement);

  const canvasClock = new CanvasClock(canvasElement, new AcceleratedClock());
  canvasClock.start();
}
