/**
 * @license MIT
 * @author Baptiste Crespy
 * 
 * Intanciation a new class will result in the creation of an image from the canvas passed as argument
 */

import BlobDownload from "./blob-download";

class Screenshot {
  /**
   * saves a PNG of the canvas sent as parameter
   * 
   * @param {HTMLCanvasElement} canvas 
   */
  constructor (canvas) {
    canvas.toBlob(blob => {
      new BlobDownload(blob, "capture.png");
    });
  }
}

export default Screenshot;