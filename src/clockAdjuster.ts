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

  private update(_time: DOMHighResTimeStamp) {
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

  /**
   * Dada uma distancia e um angulo em radianos, retorna um ponto calculado
   * a partir do centro do relogio.
   */
  private pointFromCenter(dist: number, angle: number) {
    const distX = dist * Math.cos(angle);
    const distY = dist * Math.sin(angle);

    return {
      x: this.center.x + distX,
      y: this.center.y + distY,
    };
  }

  /**
   * Retorna o angulo em radianos a partir do 12 horas.
   */
  private calcAngleFrom12(angle: number) {
    const angle12 = Math.PI / 2;
    return angle12 + angle;
  }

  /**
   * Divide a circunferencia em `steps` partes iguais.
   */
  private divideCircle(steps: number) {
    return (Math.PI * 2) / steps;
  }

  /**
   * Calcula o angulo em radianos para um passo `step` de `steps` passos.
   */
  private calcStepAngle(step: number, steps: number) {
    const partAngle = this.divideCircle(steps);
    return partAngle * step;
  }

  /**
   * Calcula o angulo em radianos para um passo `step` de `steps` passos
   * a partir do 12 horas.
   */
  private calcStepAngleFrom12(step: number, steps: number) {
    const angle = this.calcStepAngle(step, steps);
    return this.calcAngleFrom12(angle);
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

    const pad = 10;
    const dist = this.center.maxRadius - pad;
    for (let i = 1; i <= 12; i++) {
      const angle = this.calcStepAngleFrom12(i, 12);
      const p = this.pointFromCenter(dist, angle);
      this.ctx.fillText(i.toString(), p.x, p.y);
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

    const hourAngle = this.calcStepAngleFrom12(hours % 12, 12);
    const minuteAngle = this.calcStepAngleFrom12(minutes, 60);
    const secondAngle = this.calcStepAngleFrom12(seconds, 60);

    this.drawHand(hourHandLength, hourAngle);
    this.drawHand(minuteHandLength, minuteAngle);
    this.drawHand(secondHandLength, secondAngle, true);
  }

  private drawHand(length: number, angle: number, isSecs: boolean = false) {
    this.ctx.beginPath();

    if (isSecs) {
      const sp = this.pointFromCenter(-length * 0.25, angle);
      this.ctx.moveTo(sp.x, sp.y);
    } else {
      this.ctx.moveTo(this.center.x, this.center.y);
    }

    const ep = this.pointFromCenter(length, angle);
    this.ctx.lineTo(ep.x, ep.y);
    this.ctx.stroke();
  }

  public drawTimeText() {
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const now = this.timeProvider.getNow();
    const timeText = now.toLocaleTimeString();
    const p = this.pointFromCenter(this.center.maxRadius * 0.75, Math.PI / 2);
    this.ctx.fillText(timeText, p.x, p.y);

    this.ctx.restore();
  }
}

export function setupClockAdjuster(element: HTMLDivElement) {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = 400;
  canvasElement.height = 400;
  canvasElement.classList.add(styles["canvas"]);
  element.appendChild(canvasElement);

  const canvasClock = new CanvasClock(
    canvasElement /*, new AcceleratedClock()*/
  );
  canvasClock.start();
}
