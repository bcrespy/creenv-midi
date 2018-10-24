import Canvas from "@creenv/canvas";
import Creenv from "@creenv/core";
import HUD from "@creenv/hud";
import Stats from "@creenv/stats";
import Capture from "../lib/index";


let hud = new HUD();
let stats = new Stats();
hud.add(stats);

let cvs = new Canvas();


class project extends Creenv {
  render () {
    stats.begin();
    //cvs.background("#0000ff");
    cvs.background("#ffffff");
    cvs.fillStyle("#efefef");
    //cvs.fillStyle("#ff00ff");
    cvs.rect(Math.cos(this.elapsedTime/500)*50+window.innerWidth/2-30, window.innerHeight/2-30, 60, 60);
    stats.end();
  }
}

let proj = new project();
//proj.bootstrap();

let opt = {
  canvas: cvs
}

let capture = new Capture(proj, opt);
