/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * This class was created to ease the capturing process within the browser and the Creative Environment. As it 
 * is right now, I think it can be improved, so if you have any ideas feel free to contribute to the project :)
 * 
 * 
 * Resources: 
 * <https://zhirzh.github.io/2017/09/02/mediarecorder/>
 * <https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder>
 * <https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream>
 * 
 * 
 * The behavior:
 * To have a perfect render, we are going to emulate how the render method should behave under circumstances 
 * where framerate provided as an options is the framerate at which it's rendered. To do so, we will emulate the 
 * rendering conditions using a fake delta time sent to the rendering method, the .inbetweenFrames variable.
 * 
 * This is how the rendering cycle will work through Capture:
 * - render method is called, with a custom delta time / elapsed time that matches the capture timing
 * - render has all the time in the world to process - Capture will wait for the render to be finished before 
 *   calling for the next frame 
 * - render is done -> frame is sent to the writer, that will add it to the pile
 * - new frame render is called, with the same custom delta time 
 * - repeat.
 **/

import Creenv from "@creenv/core";
import Canvas from "@creenv/canvas";
import WebmWriter from "webm-writer";
import CaptureControls from "./controls";
import FramesManager from "./frames";
import Exporter from "./exporters/exporter";
import ExporterFactory from "./exporters/factory";
import Screenshot from "./screenshot";


const OPTIONS = {
  
  // the framerate of the capture
  framerate: 60,

  export: {
    type: "png-sequence",
    options: {
      quality: 0.95,
      framerate: 60, 
      filename: "sequence.zip"
    }
  },

  canvas: null,
  infobox: true,
  buttonInfos: true
};

class Capture {
  /**
   * The capture object allows you to render your project without a fastidious settup. Instead of calling
   * the bootstrap method to start the rendering process, you will instead pass your project class as a parameter
   * of Capture and let him do the job. If this is the first time you are rendering your project, it is strongly
   * advised that you take a look at the tutorial provided below. [will hopefully be added soon].
   * 
   * @param {Creenv} project the main class of the project
   * @param {Object} options the rendering options
   */
  constructor (project, options) {
    // checks for compatibility
    this.compatibility();

    // bindings 
    this.onFrameRendered = this.onFrameRendered.bind(this);
    this.onNext = this.onNext.bind(this);
    this.onPrev = this.onPrev.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onRecord = this.onRecord.bind(this);
    this.onStop = this.onStop.bind(this);
    this.onCapture = this.onCapture.bind(this);

    /**
     * the project that will be renderer. its update method will be called at a correct framerate
     * @type {Creenv}
     * @private 
     */
    this.project = project;

    /**
     * the options, used to configure the export
     * @type {Object}
     * @private
     */
    this.options = { ...OPTIONS, ...options };

    /**
     * @type {CaptureControls}
     */
    this.controls = new CaptureControls(this.onPlay, this.onPause, this.onRecord, this.onStop, this.onPrev, this.onNext, this.onCapture, this.options.framerate, this.options.infobox, this.options.buttonInfos);

    /**
     * weither the record is active or not. if a keyStart is specified, the record won't start as long as the key
     * isn't pressed.
     */
    this.active = false;

    /**
     * if a canvas source is not specified, Capture will look for a canvas element within the DOM and assign it 
     * as the source for rendering.
     * @type {HTMLCanvasElement}
     * @private
     */
    this.canvas = null;

    /**
     * the frames manager handles the render of the frames from the project
     * @type {FramesManager}
     * @private
     */
    this.frames = new FramesManager(this.project, this.options.framerate, this.onFrameRendered);

    /**
     * the timestamp at which the capture has started
     * @type {number}
     * @private
     */
    this.startTimer = 0;

    /**
     * the media recorder will be plugged to the canvas stream to generate exportable data 
     * @type {MediaRecorder}
     * @private
     */
    this.recorder = null;

    /**
     * will be set to true once the record is done
     * @type {boolean}
     * @public
     */
    this.done = false;

    /**
     * this data will be populated by the capture 
     * @type {Object}
     * @private
     */
    this.recordData = {
      started: 0,
      ended: 0,
      duration: 0
    };

    /**
     * the exporter
     * @type {Exporter}
     * @private
     */
    this.exporter = null;
    
    // those variables are used to fasten later computations 
    this.inbetweenFrames = 1 / this.options.framerate;

    // setting up
    let initialization = this.project.init();
    if (initialization instanceof Promise) {
      initialization.then(() => { 
        this.init();
      });
    } else {
      this.init();
    }
  }
  
  /**
   * Initialize the different modules in the right order
   */
  init () {
    this.findActiveCanvas();
    this.exporter = new (ExporterFactory(this.options.export.type))(this.canvas, this.options.export.options);
    this.exporter.init().then(() => {
      this.setupControls(); 
    });
  }
  
  /**
   * sets up the events (cf: controls) to control the record
   */
  setupControls () {
    document.addEventListener("keydown", (e) => {
      if (e.key === this.options.keyStop) {
        this.stopRecord();
      } else if (this.options.keyStart && this.options.keyStart.toLowerCase() === e.key) {
        this.startRecord();
      }
    });
  }

  /**
   * this method will be called when a frame has been rendered
   */
  onFrameRendered (renderCallback) {
    if (this.active) {     
      this.exporter.frameRendered().then(() => {
        this.controls.updateFramesRecorded();
        if (this.frames.playing) {
          // timeout is required if we don't want to see the browser ending up in an ending loop
          setTimeout(() => {
            renderCallback();
          }, 10);
        }
      });
    }
  }

  /**
   * called by the controls by clicking on the "play" button
   */
  onPlay () {
    this.frames.play();
  }

  /**
   * called by the controls by clicking on the "pause" button
   */
  onPause () {
    this.frames.stop();
  }

  /**
   * called by the controls by clicking on the "previous frame" button
   */
  onPrev () {
    if (this.frames.playing) {
      console.warn("it is not advised to navigate between frames while render is in play mode");
    }
    this.frames.prevFrame();
  }

  /**
   * called by the controls by clicking on the "next frame" button
   */
  onNext () {
    if (this.frames.playing) {
      console.warn("it is not advised to navigate between frames while render is in play mode");
    }
    this.frames.nextFrame();
  }

  /**
   * called by the controls by clicking on the "record" button
   */
  onRecord () {
    this.startRecord();
    this.controls.updateFramesRecorded(0);
  }

  /**
   * called by the controls by clicking on the "stop" button
   */
  onStop () {
    this.stopRecord();
  }

  onCapture () {
    this.frames.stop();
    this.controls.pause();
    new Screenshot(this.canvas);
  }

  /**
   * this function will set the required variables as they are supposed to be so that the render loop 
   * records the 
   */
  startRecord () {
    this.exporter.start().then(() => {
      this.active = true;
      this.recordData.started = performance.now();
      this.frames.recording = true;
    });
  }

  /**
   * stops the record and set the required to the required state when capture is done
   */
  stopRecord () {
    this.exporter.stop().then(() => {
      this.active = false;
      this.recordData.ended = performance.now();
      this.frames.recording = false;
      this.controls.updateFramesRecorded(0);
      this.done = true;
    });
  }

  /**
   * can be called to start the capture, after everything was set up
   */
  start () {
    this.startTimer = performance.now();
    this.frames.play();
  }

  /**
   * checks for browser compatiblity, if an error is noticed, it is only logged to the console, but script execution 
   * continues. this behavior could be changed 
   */
  compatibility () {
    if (typeof performance === "undefined" || typeof MediaStream === "undefined" || typeof MediaRecorder === "undefined") {
      console.error("your browser is not modern enough to handle the capture. please upgrade it or switch to chromium/chrome");
    }
  }

  /**
   * first look into the options to see if a canvas property was provided, if not tries to look within the DOM if
   * such a <canvas> exists
   */
  findActiveCanvas () {
    if (this.options.canvas) {
      if (this.options.canvas instanceof Canvas) {
        this.canvas = this.options.canvas.canvas;
      } else {
        if (!(this.options.canvas instanceof HTMLCanvasElement)) {
          console.warn("the canvas property you provided to the Capture is not an html canvas element. Capture will still proceed");
        }
        this.canvas = this.options.canvas;
      }
    } else {
      // canvas was not provided as an option, we'll look for it wihtin the dom
      let captureClass = document.querySelector("canvas.creenv");
      if (captureClass) {
        this.canvas = captureClass;
      } else {
        let canvas = document.querySelector("canvas");
        if (!canvas) {
          console.error("Capture was not able find a canvas within the dom. You can specify one by adding a canvas property to the options");
        }
        this.canvas = canvas;
      }
    }
  }
}

export default Capture;