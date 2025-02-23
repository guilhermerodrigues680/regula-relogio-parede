// https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback

import type { ILogger } from "./logger";

export class CanvasCamera {
  private readonly logger: ILogger;

  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.
  private readonly width = 320; // We will scale the photo width to this
  private height = 0; // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.
  private streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.
  private readonly video: HTMLVideoElement;
  private readonly canvas: HTMLCanvasElement;

  private readonly ctx: CanvasRenderingContext2D;

  public constructor(
    logger: ILogger,
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Falha ao obter contexto 2D do canvas");
    }

    this.logger = logger;
    this.video = video;
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public async startup() {
    console.debug(this);
    const stream = await this.getStream();

    return new Promise<void>((resolve, reject) => {
      this.video.addEventListener(
        "canplay",
        (_ev) => {
          this.logger.log("Video canplay");

          if (!this.streaming) {
            // this.height =
            //   this.video.videoHeight / (this.video.videoWidth / this.width);

            // // Firefox currently has a bug where the height can't be read from
            // // the video, so we will make assumptions if this happens.
            // if (isNaN(this.height)) {
            //   this.height = this.width / (4 / 3);
            // }

            // this.video.setAttribute("width", this.width.toString());
            // this.video.setAttribute("height", this.height.toString());
            // this.canvas.setAttribute("width", this.width.toString());
            // this.canvas.setAttribute("height", this.height.toString());
            this.streaming = true;
          }
        },
        false
      );

      this.video.addEventListener("playing", () => {
        this.logger.log("Video playing");
        resolve();
      });

      this.video.addEventListener("error", (ev) => {
        this.logger.log(`Error: ${ev}`);
        reject(new Error(`Error: ${ev}`));
      });

      this.video.srcObject = stream;
    });
  }

  private async getStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // video: true,
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
        audio: false,
      });

      // this.video.style.opacity = "0";

      // this.video.play();
      // this.update(0);
      return stream;
    } catch (err) {
      console.error(`An error occurred: ${err}`, { err });
      throw new Error(`An error occurred: ${err}`);
    }
  }

  private update(_time: DOMHighResTimeStamp) {
    // this.clear();
    this.drawVideo();
    requestAnimationFrame((time) => this.update(time));
  }

  private drawVideo() {
    this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
  }
}
