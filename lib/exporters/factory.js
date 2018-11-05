/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * The factory returns the correct Exporter class given the string passed as argument 
 * Available exporters must be added to this directory to be available within Creenv Capture.
 * However, it is possible to use a custom exporter and specify it as an option instead of 
 * a string 
 */

import Export from "./exporter";
import WebmExporter from "./webm-exporter";
import PNGSequenceExporter from "./png-sequence-exporter";
import JPEGSequenceExporter from "./jpeg-sequence-exporter";


const SUPPORTED = [ WebmExporter, PNGSequenceExporter, JPEGSequenceExporter ];
const FALLBACK = WebmExporter;

/**
 * @param {string} identifier the exporter ID
 * 
 * @return {Exporter} the exporter that matches the identifier
 */
function ExporterFactory (identifier) {
  for (let idx in SUPPORTED) {
    let exporter = SUPPORTED[idx];
    if (exporter.ID === identifier) {
      return exporter;
    }
  }
  return FALLBACK;
}

export default ExporterFactory;