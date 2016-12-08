import React from 'react';
import ReactDOM from 'react-dom';
import ColumnLayout from './components/ColumnLayout.js';

import OscillatorComponent from './audio-components/oscillator.js';

require('./scss/midi.scss');

let MidiApp = function() {
  this.state = {
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

  this.handleComponentEvent = function(type) {
    if ('add-oscillator' == type) {
      this.state.column2.components.push(new OscillatorComponent(this.audio.context));
      this.render();
    }
  };

  this.init = function() {
    this.audio.context = new (window.AudioContext || window.webkitAudioContext)();
    this.render();
  };

  this.render = function() {
    let appSettings = {
      column2: this.state.column2,
      column3: this.state.column3,
      column4: this.state.column4
    };
    ReactDOM.render(
      <ColumnLayout handleChildEvent={this.handleComponentEvent.bind(this)} settings={appSettings} />,
      document.querySelector('.app')
    );
  }

  this.init();
};

let midi = new MidiApp();
