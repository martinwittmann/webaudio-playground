import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';

let MidiApp = function() {
  var that = this;

  this.start = function() {
    // This gets called when mid is available.
    for (let input of this.midiAccess.inputs) {
      this.midiInputs.push({
        id: input[1].id,
        name: input[1].name,
        manufacturer: input[1].manufacturer,
      });
    }


    ReactDOM.render(
      <MidiSettings inputs={this.midiInputs}/>,
      document.querySelector('.midi-inputs')
    );
  };

  this.init = function() {
    navigator.requestMIDIAccess().then(this.onMidiAvailable, this.onNoMidi);

    ReactDOM.render(
      <App/>,
      document.querySelector('.app')
    );
  };

  this.init();
};

let midi = new MidiApp();


