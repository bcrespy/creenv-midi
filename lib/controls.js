/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * This class handlse the graphical controls used by Capture
 **/

import "./style.scss";

class CaptureControls {
  constructor (onPlay, onPause, onRecord, onStop, onPrev, onNext, framerate = false, infoBoxRecord = true, duration = false) {
    // the callback methods
    this._onPlay = onPlay;
    this._onPause = onPause;
    this._onRecord = onRecord;
    this._onStop = onStop;
    this._onPrev = onPrev;
    this._onNext = onNext;

    /**
     * @type {HTMLElement}
     */
    this.dom = null;

    this.framerate = framerate;
    this.duration = duration;

    this.framesNb = this.duration ? this.framerate*this.duration : 0;

    /**
     * the number of recorded frames
     * @type {HTMLElement}
     */
    this.framesTotalDom = null;
    this.framesRecorded = 0;

    /**
     * the duration of currently recorded frames
     * @type {HTMLElement}
     */
    this.framesDurationDom = null;
    this.framesDuration = 0;

    this.frameLength = 1 / framerate;

    /**
     * if the box on the top-right, giving informations on the record should appear ot not 
     * @type {boolean}
     */
    this.infoBoxRecord = infoBoxRecord;

    /**
     * @type {HTMLElement}
     */
    this.infoBoxDom = null;

    this.createDOM();
    this.setupEvents();
  }

  /**
   * adds a frame to the number of recorded frames 
   */
  updateFramesRecorded (frames) {
    if (frames) {
      this.framesRecorded = frames;
    } else {
      this.framesRecorded++;
    }
    this.framesTotalDom.innerHTML = this.framesRecorded;
    this.updateFramesDuration();
  }

  /**
   * updates the duration of the record 
   */
  updateFramesDuration () {
    this.framesDuration = this.framesRecorded*this.frameLength;
    this.framesDurationDom.innerHTML = (""+this.framesDuration).substr(0, 5);
  }

  createDOM () {
    if (this.infoBoxRecord) {
      let infoBoxDom = document.createElement("div");
      infoBoxDom.classList.add("info-box-capturing", "hidden");
      infoBoxDom.innerHTML = "Every frame rendered within the canvas will now be added to the capture";
      document.body.appendChild(infoBoxDom);
      this.infoBoxDom = infoBoxDom;
    }

    this.dom = document.createElement("div");
    this.dom.classList.add("controls");
    this.dom.innerHTML = `
      <div class="info-capture">
        <div class="framerate">${this.framerate?`recording at <b>${this.framerate}</b> fps`:`<span class="warn">no framerate was specified</span>`}</div>
        <div class="info-frames"><span class="frames-nb">0</span>${this.duration ? `/ <span class="frames-total">${this.framesNb}</span>` : ``} frames recorded</div>
        <div class="info-time"><span class="time-nb">0</span>${this.duration ? ` / <span class="time-total">${this.duration}</span>` : ``} sec</div>
      </div>
      <div class="play-buttons">
        <div class="button change-frame previous"></div>
        <div class="button play paused"></div>
        <div class="button change-frame next"></div>
      </div>
      <div class="record-buttons">
        <div class="button record"></div>
      </div>`;
    document.body.appendChild(this.dom);

    this.framesTotalDom = this.dom.getElementsByClassName("frames-nb")[0];
    this.framesDurationDom = this.dom.getElementsByClassName("time-nb")[0];
  }

  setupEvents () {
    this.dom.getElementsByClassName("play")[0].addEventListener("click", (event) => {
      if (event.target.classList.contains("paused")) {
        this._onPlay();
        event.target.classList.remove("paused");
      } else {
        this._onPause();
        event.target.classList.add("paused");
      }
    });

    this.dom.getElementsByClassName("previous")[0].addEventListener("click", () => {
      this._onPrev();
    });

    this.dom.getElementsByClassName("next")[0].addEventListener("click", () => {
      this._onNext();
    });

    this.dom.getElementsByClassName("record")[0].addEventListener("click", () => {
      if (event.target.classList.contains("recording")) {
        this._onStop();
        event.target.classList.remove("recording");
        if (this.infoBoxRecord)
          this.infoBoxDom.classList.add("hidden");
      } else {
        this._onRecord();
        event.target.classList.add("recording");
        if (this.infoBoxRecord)
          this.infoBoxDom.classList.remove("hidden");
      }
    });
  }
}

export default CaptureControls;