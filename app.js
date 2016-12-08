import React from 'react';
import ReactDOM from 'react-dom';
import ColumnLayout from './components/ColumnLayout.js';

import Oscillator from './audio-components/oscillator.js';

require('./scss/midi.scss');

let MidiApp = function() {
  this.state = {
    midiAccess: false,
    midiInputs: [],
    selectedMidiInput: -1,
    column2: {
      components: []
    },
    column3: {
      components: []
    },
    column4: {
      components: []
    }
  };

  this.audio = {
    context: false
  };


  this.onMidiMessage = function(ev) {
    let message = ev.data;
    // Redirect midi messages to all audio components in the first column which
    // are capable of receiving midi events.
    this.state.column2.components.map(component => {
      if (component.midiEvent) {
        component.midiEvent(message);
      }
    });    
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
    this.state.midiAccess.inputs.get(id).onmidimessage = this.onMidiMessage.bind(this);
  };

  this.init = function() {
    navigator.requestMIDIAccess().then(this.onMidiAvailable.bind(this), this.onNoMidi.bind(this));
    this.audio.context = new (window.AudioContext || window.webkitAudioContext)();
  };

  this.handleComponentEvent = function(type) {
    if ('add-oscillator' == type) {
      this.state.column2.components.push(new Oscillator(this.audio.context));
      this.showApp();
    }
  };

  this.showApp = function() {
    let appSettings = {
      midiInputs: this.state.midiInputs,
      onMidiInputSelected: this.onMidiInputSelected.bind(this),
      column2: this.state.column2,
      column3: this.state.column3,
      column4: this.state.column4
    };
    ReactDOM.render(
      <ColumnLayout handleChildEvent={this.handleComponentEvent.bind(this)} settings={appSettings} />,
      document.querySelector('.app')
    );
  };

  this.init();
};

let midi = new MidiApp();


