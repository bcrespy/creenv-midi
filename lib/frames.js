/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * The Frames class handle the timers, the render given the data sent by Capture, from
 * the Controls 
 */

import Creenv from "@creenv/core";


class Frames {
  
  constructor (project, framerate, onRendered) {
    /**
     * the project that will be renderer. its update method will be called at a correct framerate
     * @type {Creenv}
     * @private 
     */
    this.project = project;

    /**
     * the timestamp at which the capture has started
     * @type {number}
     * @private
     */
    this.startTimer = 0;

    /**
     * this stores the "eslapsed time" since the beginning of the render. this will be incremented by inbetweenFrames
     * at each new frame render 
     * @type {number}
     * @private
     */
    this.fakeElapsedTime = 0;

    /**
     * weither the render is playing or not 
     */
    this.playing = false;

    /**
     * if Capture is currently recoding. logic is a bit different if that is the case
     */
    this.recording = false;

    /**
     * this method will be called when a frame has been rendered. it's used by Capture to compute the duration of 
     * the record 
     * @type {function}
     * @private
     */
    this._onRendered = onRendered;
    
    /**
     * the time between each frame
     * @type {number}
     * @public
     */
    this.inbetweenFrames = 1 / framerate;

    this.renderLoop = this.renderLoop.bind(this);
  }

  prevFrame () {
    this.fakeElapsedTime-= this.inbetweenFrames;
    this.renderNewFrame();
  }

  nextFrame () {
    this.fakeElapsedTime+= this.inbetweenFrames;
    this.renderNewFrame();
  }

  play () {
    this.playing = true;
    this.renderLoop();
  }

  stop () {
    this.playing = false;
  }

  renderLoop () {
    if (this.playing) {
      this.nextFrame();
      if (!this.recording) {
        setTimeout(()=>{
          this.renderLoop();
        }, 10);
      }
    }
  }

  /**
   * force the timing value of the project to be those required for the render, and run the render method
   */
  renderNewFrame () {
    this.project.elapsedTime = this.fakeElapsedTime;
    this.project.deltaT = this.inbetweenFrames;
    this.project.render();
    this._onRendered(this.renderLoop);
  }
}

export default Frames;