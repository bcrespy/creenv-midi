import Canvas from "@creenv/canvas";
import Capture from "../lib/index";




let cvs = new Canvas();
let capture = new Capture();
let i = 0;

function draw () {
  if (i == 50 ) {
    capture.ccapture.start();
  }
  if (i >= 50 && i < 4000) {
    capture.ccapture(cvs.canvas);
  }
  if (i == 4000) {
    console.log("we save");
    capture.ccapture.stop();
    capture.ccapture.save();
  }
  else 
    window.requestAnimationFrame(draw);

  cvs.background("#0000ff");

  ++i;
  cvs.fillStyle("#ff0000");
  cvs.rect(Math.cos(i/10)*50+window.innerWidth/2-30, window.innerHeight/2-30, 60, 60);
}


draw();