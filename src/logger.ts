export type ILogger = {
  log: (message: string) => void;
};

export class ElementLogger implements ILogger {
  constructor(private elem: HTMLElement) {}

  log(message: string) {
    const dtText = new Date().toLocaleTimeString();
    const m = `${dtText} [LOG] ${message}`;
    console.log(m);
    const data = m + "\n";
    this.elem.textContent += data;
  }
}
