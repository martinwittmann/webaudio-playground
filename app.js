import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';

let MidiApp = function() {
  this.state = {
    midiAccess: false,
    midiInputs: [],
    selectedMidiInput: -1
  };


  this.onMidiMessage = function(ev) {
    console.log(ev.data);
  };


  this.onMidiAvailable = function (midiAccess) {
    this.state.midiAccess = midiAccess;

    for (let input of midiAccess.inputs) {
      this.state.midiInputs.push({
        id: input[1].id,
        name: input[1].name,
        manufacturer: input[1].manufacturer,
      });
    }

    this.showApp();
  };

  this.onNoMidi = function(msg) {
    console.log('No midi available: ' + msg);
  };

  this.onMidiInputSelected = function(id) {
    this.state.selectedMidiInput = id;
    this.state.midiAccess.inputs.get(id).onmidimessage = this.onMidiMessage;
  };

  this.init = function() {
    navigator.requestMIDIAccess().then(this.onMidiAvailable.bind(this), this.onNoMidi.bind(this));
  };

  this.showApp = function() {
    ReactDOM.render(
      <App midiInputs={this.state.midiInputs} onMidiInputSelected={this.onMidiInputSelected.bind(this)} />,
      document.querySelector('.app')
    );
  };

  this.init();
};

let midi = new MidiApp();


