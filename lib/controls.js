/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * This class handlse the graphical controls used by Capture
 **/

import "./style.scss";

class CaptureControls {
  constructor () {
    this.createDOM();
  }

  createDOM () {
    let dom = document.createElement("div");
    dom.classList.add("controls");
    dom.innerHTML = `
      <div class="info-frames"><span class="frames-nb">0</span> / <span class="frames-total">300</span> frames</div>
      <div class="info-time"><span class="time-nb">0</span> / <span class="time-total">5.5</span> sec</div>
      <div class="play-buttons">
        <div class="button change-frame previous"></div>
        <div class="button play paused"></div>
        <div class="button change-frame next"></div>
      </div>
      <div class="record-buttons">
        <div class="button record"></div>
      </div>`;
    document.body.appendChild(dom);
  }
}

export default CaptureControls;