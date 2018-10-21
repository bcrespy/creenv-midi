/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * @credits 
 * 
 * @author Spite <https://github.com/spite>- <http://www.clicktorelease.com>
 * for writing capture.js <https://github.com/spite/ccapture.js>
 * <3
 * 
 * This class is only a wrapper for capture.js. It does not handle any 
 * computations and barely any logic. It was just made so that it's easier to be
 * used within @creenv and that's it.
 **/

let CCapture = require('ccapture.js');



class Capture {
  constructor (type = Capture.TYPE.VIDEO, format = Capture.FORMAT.WEBM, framerate = 60) {
    /**
     * Stores the capture.js instance
     * @type {CCapture}
     * @public
     */
    this.ccapture = new CCapture({
      format: format,
      framerate: framerate,
      verbose: true
    });
  }
};


Capture.TYPE = {
  VIDEO: "video",
  IMAGE: "image"
};

Capture.FORMAT = {
  WEBM: "webm",
  GIF: "gif",
  PNG: "png",
  JPEG: "jpeg"
};

export default Capture;

