import Canvas from "@creenv/canvas";
import Creenv from "@creenv/core";
import Capture from "../lib/index";



let cvs = new Canvas();


class project extends Creenv {
  render () {
    //cvs.background("#0000ff");
    cvs.background("#ffffff");
    cvs.fillStyle("#efefef");
    cvs.rect(Math.cos(this.elapsedTime/500)*50+window.innerWidth/2-30, window.innerHeight/2-30, 60, 60);
  }
}

let proj = new project();
proj.bootstrap();

let opt = {
  canvas: cvs
}

let capture = new Capture(proj, opt);
