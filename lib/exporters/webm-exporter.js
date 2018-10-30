/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * The Webm exporter uses webm-writer, a library from @author thenickdude 
 * <https://github.com/thenickdude/webm-writer-js>
 * 
 * This exporter acts as a great example to describe how should an Exporter be implemented
 */

import WebmWriter from "webm-writer";
import Exporter from "./exporter";
import BlobDownload from "../blob-download";


const DEFAULT_OPTIONS = {
  // webm image quality, from 0.0 to 1.0
  quality: 0.95,

  // the framerate of the output video
  framerate: 60,

  // the filename of the export 
  filename: "render.webm"
};

class WebmExporter extends Exporter {
  /**
   * @param {HTMLCanvasElement} canvas the canvas within the render takes place
   * @param {Object} options an object of options for the .webm export
   */
  constructor (canvas, options) {
    super(canvas, {...DEFAULT_OPTIONS, ...options});

    /**
     * the webm writter
     * @type {WebmWriter}
     */
    this.writer = null;
  }

  /**
   * before 
   */
  init () {
    return new Promise((resolve, reject) => {
      // we check if filename has extension webm, and warn if it doesnt 
      if (!/\.webm$/.test(this.options.filename)) {
        console.warn(`the filename ${this.options.filename} does not have a .webm extension. this is just a warning, export works as usual`);
      }

      this.writer = new WebmWriter({
        quality: this.options.quality,
        frameRate: this.options.framerate
      });

      resolve();
    });
  }

  frameRendered () {
    return new Promise((resolve, reject) => {
      this.writer.addFrame(this.canvas);
      resolve();
    });
  }

  stop () {
    return new Promise((resolve, reject) => {
      this.writer.complete().then(blob => {
        new BlobDownload(blob, this.options.filename);
        resolve();
      });
    });
  }
}

WebmExporter.ID = "webm";

export default WebmExporter;