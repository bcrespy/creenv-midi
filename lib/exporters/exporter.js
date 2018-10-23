/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * This class describes how should an exporter be defined, when its methods are going to be
 * called and what they should be doing, in the idea.
 * If you are trying to build a custom exporter, it is advised to take a look at the 
 * WebmExporter.
 */

/**
 * @abstract
 */
class Exporter {
  /**
   * @param {HTMLCanvasElement} canvas the canvas in which render takes place 
   * @param {Object} options the options, depends on the exporter you're building
   */
  constructor (canvas, options) {
    /** 
     * @type {HTMLCanvasElement} 
     **/
    this.canvas = canvas;
    this.options = options;
  }

  /**
   * this method will be called by Capture before going into any render logic. this is were 
   * everything required for the exporter to be working as described below is required.
   * 
   * @abstract
   */
  init () {

  }

  /**
   * can be called whenever the user decides, after init() was called. it might not be 
   * necessary to implement this method, depending on the logic of the record. for instance,
   * WebmExporter doesn't do anything here because it only adds frames to the export at each
   * frame update, and doesn't require a specific behavior on the beggining at the record
   * 
   * @abstract
   */
  start () {

  }

  /**
   * once a frame has been rendered, this method will be called. the program won't do anything 
   * until the promise within this method isn't resolved. it can take 1 day for your algorithm 
   * to process the frame, this won't impact the render since timings are "emulated". You MUST
   * resolve the Promise to keep going with the rendering logic.
   * 
   * @return {Promise}
   * @abstract
   */
  frameRendered () {
    
  }

  /**
   * this method will be called once the record is finished. this is where you can save the file,
   * or process the different frames... etc. you must return a Promise which resolves when 
   * data processing is done 
   * 
   * @return {Promise}
   * @abstract
   */
  stop () {

  }
};

/**
 * this static variable will be tested by the Exporter Factory to see if the string passed as "exporter"
 * matches the given exporter
 */
Exporter.ID = "none";

export default Exporter;