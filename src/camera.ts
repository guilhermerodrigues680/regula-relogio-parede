// https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas

export class CanvasCamera {
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
  public constructor(
    private readonly video: HTMLVideoElement,
    private readonly canvas: HTMLCanvasElement
  ) {}

  public async startup() {
    console.debug(this);

    this.video.addEventListener(
      "canplay",
      (_ev) => {
        if (!this.streaming) {
          this.height =
            this.video.videoHeight / (this.video.videoWidth / this.width);

          // Firefox currently has a bug where the height can't be read from
          // the video, so we will make assumptions if this happens.
          if (isNaN(this.height)) {
            this.height = this.width / (4 / 3);
          }

          this.video.setAttribute("width", this.width.toString());
          this.video.setAttribute("height", this.height.toString());
          this.canvas.setAttribute("width", this.width.toString());
          this.canvas.setAttribute("height", this.height.toString());
          this.streaming = true;
        }
      },
      false
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      this.video.srcObject = stream;
      this.video.play();
    } catch (err) {
      console.error(`An error occurred: ${err}`, { err });
      throw new Error(`An error occurred: ${err}`);
    }
  }
}
