/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * This exporter uses Chrome's FileSystem API to store data on the disk, therefore allowing greater ammounts of data 
 * stored for a capture. However, if such an API is not available for known or unknown reasons, it fallsbacks to 
 * saving the frames in the memory.
 * 
 * Once the capture is done, the frames are compressed within an archive.
 * 
 * Useful ressources: 
 * 
 * - Exploring the FileSystem APIs
 *   @author Eric Bidelman 
 *   <https://www.html5rocks.com/en/tutorials/file/filesystem/>
 * 
 * - MDN FileSystem API page
 *   <https://developer.mozilla.org/en-US/docs/Web/API/FileSystem>
 */

import Exporter from "./exporter";
import BlobDownload from "../blob-download";
import JSZip from "jszip";


const DEFAULT_OPTIONS = {

}

// the sandbox working directory 
const WD = "/capture-sequence-png";


/**
 * better than importing moment-js 
 * 
 * @return {string} date, format : H:i_d-m-Y
 */
const convertDate = () => {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date();
  return pad(d.getHours())+":"+pad(d.getMinutes())+"_"+[pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('-');
}

/**
 * @param {string} prefix the string prepended to the filename
 * @param {number} index current captured frame, appended to the index
 * 
 * @return {string} the filename that will be written
 */
const getFilename = (prefix, index) => {
  let suffix = "0000"+index;
  return prefix+suffix.substr(suffix.length-4, 4)+".png";
}


class PNGSequenceExporter extends Exporter {
  /**
   * @param {HTMLCanvasElement} canvas the canvas within the render takes place
   * @param {Object} options an object of options for the .webm export
   */
  constructor (canvas, options) {
    super(canvas, {...DEFAULT_OPTIONS, ...options});

    /**
     * weither the filesystem api is used during this export or not 
     * @type {false|FileSystem}
     * @public
     */
    this.filesystem = false;

    /**
     * the current working directory 
     * @type {FileSystemDirectoryEntry}
     */
    this.directory = null;

    /**
     * the prefix appended to all files stored within the sandbox
     * @type {string}
     */
    this.prefix = ""; // mm:ss_DD-MM-YYYY_

    /**
     * the number of frames saved to the sandbox, is set to 0 at start
     * @type {number}
     */
    this.framesSaved = 0;

    /**
     * the saved files, by filename 
     * @type {Array.<string>}
     */
    this.filesSaved = [];

    /**
     * the zip api used to save the zip 
     * @type {JSZip}
     */
    this.jzip = null;

    this.handleError = this.handleError.bind(this);
  }

  /**
   * calls reqFs() to ask for disk allocation, if none is available fallbacks to storing t
   */
  init () {
    return new Promise((resolve, reject) => {
      this.reqFs().then(resolve).catch(() => {
        console.error("currently PNG sequence export is only available within Chrome. please upgrade your brownser or switch to chrome for the record");
      });
    });
  }

  /**
   * tries to allocate space using the Chrome FileSystem API, unfortunatly only available within Chrome. Throw an 
   * exception if such an allocation is not possible so that the exporter can fallback to a method using cache 
   * a very good article presents this technology <https://www.html5rocks.com/en/tutorials/file/filesystem/>
   * 
   * @return {Promise} resolve if requestFileSystem is available and successful
   */
  reqFs () {
    return new Promise((resolve, reject) => {
      if (!window.webkitRequestFileSystem) {
        console.error("capturing a png sequence is only available within chrome. update your version if you're already using chrome");
        reject();
      } else {
        // we request for 500Mb
        window.webkitRequestFileSystem(window.TEMPORARY, 500*1024*1024, (fs) => {
          console.info("capture is ready");
          this.filesystem = fs;
          resolve();
        }, (error) => {
          reject(error);
        });
      }
    });
  }

  /**
   * clear the files of the last export in case they are still alive 
   */
  start () {
    return new Promise((resolve, reject) => {
      this.cleanDirectory().then(() => {
        this.createDirectory().then(dir => {
          this.framesSaved = 0;
          this.prefix = "image-";
          this.directory = dir;
          this.filesSaved = [];
          this.jzip = JSZip();
          resolve();
        })
      });
    });
  }

  /**
   * saved the canvas frame to a png file, in the sandbox WD directory
   */
  frameRendered () {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(blob => {
        let filename = getFilename(this.prefix, this.framesSaved);
        this.directory.getFile(filename, {create: true}, fileEntry => {
          fileEntry.createWriter(fileWriter => {
            fileWriter.onwriteend = e => {
              this.filesSaved.push(filename);
              this.framesSaved++;
              resolve();
            }
            fileWriter.onerror = this.handleError;
            fileWriter.write(blob);
          }, this.handleError);
        }, this.handleError);
      });
    })
  }

  /**
   * when all desired frames are captured, puts all the images into a zip, compress it and then generates a download to the
   * resulting archive
   */
  stop () {
    return new Promise((resolve, reject) => {
      this.filesToZip().then(() => {
        this.jzip.generateAsync({type: "blob"}).then(content => {
          new BlobDownload(content, this.options.filename);
          this.cleanDirectory().then(resolve).catch(reject);
        }).catch(reject);
      });
    });
  }

  /**
   * parse the working directory within the sandbox as long as there are files left. the files are then added to the zip which
   * which will be ready to be compressed and then downloaded
   */
  filesToZip () {
    return new Promise((resolve, reject) => {
      let toZip = this.framesSaved;
      let reader = this.directory.createReader();
      
      // called recursively as long as there are files within the working directory 
      const readEntries = () => {
        reader.readEntries(results => {
          results.forEach(result => {
            this.readFile(result).then(content => {
              toZip--;
              this.fileContentToZip(result.name, content);
              if (toZip <= 0) {
                resolve();
              }
            }).catch(error => {
              console.error(error);
              reject();
            });
          });
          if (results.length) {
            readEntries();
          }
        });
      };

      readEntries();
    });
  }

  /**
   * adds the binary content to a file named @param name within the archive
   * 
   * @param {string} name the name of the file to be added to the archive 
   * @param {string} content the binary content of the image to be added to the archive 
   */
  fileContentToZip (name, content) {
    this.jzip.file(name, content, { binary: true });
  }

  /**
   * reads the file @param entry and resolve its content, if such a thing is impossible, reject
   * 
   * @param {FileEntry} entry to be read
   */
  readFile (entry) {
    return new Promise((resolve, reject) => {
      entry.file(file => {
        let reader = new FileReader();
        reader.onload = e => {
          resolve(e.currentTarget.result);
        }
        reader.onerror = reject;
        reader.readAsBinaryString(file);
      });
    });
  }

  /**
   * handles the possible errors returned by the file system api
   * 
   * @param {DOMError} error the error returned by the filesystem api
   */
  handleError (error) {
    console.error(`an error has occured while writing files to your disk. CODE: ${error.code} MESSAGE: ${error.message}`);
  }

  /**
   * cleans the working directory and returns a promise when such a task is performed
   * 
   * @return {Promise}
   */
  cleanDirectory () {
    return new Promise((resolve) => {
      this.filesystem.root.getDirectory(WD, {}, (directory) => {
        directory.removeRecursively(() => {
          console.log("removed");
          resolve();
        });
      }, (error) => {
        resolve();
      });
    });
  }

  /**
   * creates the working directory and resolve it 
   */
  createDirectory () {
    return new Promise((resolve, reject) => {
      this.filesystem.root.getDirectory(WD, {create: true}, resolve, this.handleError);
    });
  }
}

PNGSequenceExporter.ID = "png-sequence";

export default PNGSequenceExporter;