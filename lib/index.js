/**
 * @license MIT
 * @author Baptiste Crespy <baptiste.crespy@gmail.com>
 * 
 * This class provides an interface to interract easily with midi controllers plugged to your conmputer
 * 
 * For now, @creenv/midi only supports 1 midi controler. It was initialy designed to allow control over properties using a more
 * convenient source that sliders controllable with a mouse, to ease live performances. It will maybe evolve in the future, who
 * knows.
 * 
 * ________
 * 
 * Resources 
 * 
 * Essentials of the MIDI protocol
 * @author Craig Stuart Sapp <https://ccrma.stanford.edu/~craig/>
 * <https://ccrma.stanford.edu/~craig/articles/linuxmidi/misc/essenmidi.html>
 * 
 * Web MIDI API, W3C Editor's Draft 18 October 2018
 * @author Chris Wilson (Google), Jussi Kalliokoski
 * <https://webaudio.github.io/web-midi-api>
 * 
 * Getting Started With The Web MIDI API
 * @author Peter Anglea
 * <https://www.smashingmagazine.com/2018/03/web-midi-api/>
 **/

import ControllersMap from "./controllers-map.js";
import ButtonsMap from "./buttons-map.js";


const NOTES = [ 1, 4, 7, 10, 13, 16, 19, 22, 
                3, 6, 9, 12, 15, 18, 21, 24 ];

// time required for instant buttons blink 
const UNIQUE_DURATION = 300;


class MIDI {
  /**
   * Doc coming soon on how to use this, said every developer once
   * 
   * @param {object} controllersMap the map of the knot controllers
   * @param {object} buttonsMap the map of the buttons
   */
  constructor (controllersMap = ControllersMap, buttonsMap = ButtonsMap) {
    /**
     * the input of concern, first of the inputs list 
     * @type {Input}
     */
    this.input = null;

    /**
     * the output, same as the input in this case
     * @type {Output}
     */
    this.output = null;

    this.controllersMap = controllersMap;
    this.buttonsMap = buttonsMap;

    this.noteMap = [];

    this._handleMidiMessage = this._handleMidiMessage.bind(this);
  }

  /**
   * initialize the web midi api, returns a promise which resolves if the initialization was a success, reject in the other case
   * 
   * @return {Promise}
   */
  init () {
    return new Promise((resolve, reject) => {
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then((access) => {
          // getting the first input from the list as main input 
          for (let input of access.inputs.values()) {
            this.input = input;
            break;
          }

          // getting first output (can also be considered as the input) as main output 
          for (let output of access.outputs.values()) {
            this.output = output;
            break;
          }

          if (!this.input || !this.output) {
            reject("Could not find any MIDI controller");
            return;
          }

          this.input.onmidimessage = this._handleMidiMessage;

          this.initButtons();

          resolve();

        }).catch(reject);
      } else {
        reject("Your navigator does not support the web MIDI API");
      }
    });
  }

  /**
   * Sets the buttons of the midi controller to the value corresponding in the button-map file
   */
  initButtons () {
    this.buttonsMap.forEach(map => {
      this.output.send([0x90, map.id, map.active ? 0x01 : 0x00]);
    });
  }

  /**
   * Process the message sent by the midi input
   * 
   * @param {MIDIMessageEvent} message message sent by the midi input
   */
  _handleMidiMessage (message) {
    let data = message.data;
    // < 0xF0 : music command, we're not interested by non-music commands here
    if (data[0] < 240) {
      switch (data[0]) {
        // controller message
        case 0xb0:
          this._handleControllerData(message.data);
        break;

        // 0x90 : note on message 
        case 0x90: 
          this._handleNoteonData(message.data);
        break;

        // 0x80 : note off message
        case 0x80:
          this._handleNoteoffData(message.data);
        break;
      }
    }
  }

  /**
   * process the data sent but the input device
   * 
   * @param {Array.<number>} data message.data, where data[0] = 176
   * 
   * @private
   */
  _handleControllerData (data) {
    // we look over the controllers maps to see if an action is defined for such an id 
    for (let i in this.controllersMap) {
      if (this.controllersMap[i].id === data[1]) {
        this.controllersMap[i].onChange(data[2]/127);
      }
    }
  }

  /**
   * process the data sent but the input device
   * 
   * @param {Array.<number>} data message.data, where data[0] = 144
   * 
   * @private
   */
  _handleNoteonData (data) {
    // we look over the buttons map to apply the correspondign behavior 
    for (let i in this.buttonsMap) {
      if (this.buttonsMap[i].id === data[1]) {
        this.buttonsMap[i].onPress();
        this.output.send([0x90, data[1], this.buttonsMap[i].active ? 0x00 : 0x01]);
        this.buttonsMap[i].active = !this.buttonsMap[i].active;
      }
    }
  }

  _handleNoteoffData (data) {
     // we look over the buttons map to apply the correspondign behavior 
     for (let i in this.buttonsMap) {
      if (this.buttonsMap[i].id === data[1]) {
        if (this.buttonsMap[i].unique) {
          this.buttonsMap[i].active = !this.buttonsMap[i].active;
          this.output.send([0x90, data[1], this.buttonsMap[i].active ? 0x01 : 0x00]);
        }
      }
    }
  }

  /**
   * @return {Array.<Input>} an array of all the inputs connected to the computer and accessible through the web API
   */
  getInputs () {
  }
};

export default MIDI;