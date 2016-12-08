import React from 'react';
import ReactDOM from 'react-dom';
import ColumnLayout from './components/ColumnLayout.js';
require('./scss/midi.scss');

let MidiApp = function() {
  this.state = {
    midiAccess: false,
    midiInputs: [],
    selectedMidiInput: -1,
    column2: [],
    column3: [],
    column4: []
  };

  this.audio = {
    context: false
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
    this.audio.context = new (window.AudioContext || window.webkitAudioContext)();
  };

  this.handleComponentEvent = function(type) {
    console.log('component event ' + type);
    this.
  };

  this.showApp = function() {
    let appSettings = {
      midiInputs: this.state.midiInputs,
      onMidiInputSelected: this.onMidiInputSelected.bind(this)
    };
    ReactDOM.render(
      <ColumnLayout handleChildEvent={this.handleComponentEvent.bind(this)} settings={appSettings} />,
      document.querySelector('.app')
    );
  };

  this.init();
};

let midi = new MidiApp();


