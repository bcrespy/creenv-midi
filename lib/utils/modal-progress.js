/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * Display a modal with a progress bar to inform the user about a progress going on 
 */

class ProgressModal {
  constructor (title) {
    this.title = title;
    
    this.dom = null;
    this.progressDOM = null;
    this.progressPercentDOM = null;

    this.createDOM();
    this.updateProgress(0);
    document.body.appendChild(this.dom);
  }

  createDOM () {
    let modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
      <div class="modal-cover"></div>
      <div class="modal-container">
        <span class="title">${this.title}</span>
        <div class="modal-content">
          <div class="progress-bar">
            <div class="progress-inner"></div>
            <div class="progress-percent">22%</div>
          </div>
        </div>
      </div>`;
    
    this.dom = modal;
    this.progressDOM = modal.querySelector(".progress-inner");
    this.progressPercentDOM = modal.querySelector(".progress-percent");
  }

  updateProgress (percent) {
    this.progressDOM.style.width = percent+"%";
    this.progressPercentDOM.innerHTML = percent+"%";
  }

  setTitle (title) {
    this.dom.querySelector(".title").innerHTML = title;
  }

  kill () {
    this.dom.remove();
  }
};

export default ProgressModal;