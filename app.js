import React from 'react';
import ReactDOM from 'react-dom';
import ColumnLayout from './components/ColumnLayout.js';

import OscillatorComponent from './audio-components/oscillator.js';

require('./scss/midi.scss');

export default class App {
  constructor() {
    this.debug = true;
    this.components = [];
    this.registeredComponents = [];
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.render();
  }

  handleComponentEvent(type, ...args) {
    if ('add-component' == type) {
      if (args.length < 1) {
        this.debug('add-component event: Trying to add a component without specifying a type.');
        return false;
      }

      this.addComponent(args[0]);

      //this.components.push(new OscillatorComponent(this.audioContext));
      this.render();
    }
  }

  addComponent(type) {

  }

  registerComponents(components) {
    components.map(registerCallback => {
      console.log(this);
      this.registerComponent(registerCallback);
    });
  }

  registerComponent(registerCallback) {
    registerCallback.apply(this, []);
  }

  getAvailableComponents() {
    return [];
  }

  debug(msg) {
    if (this.debug && 'undefined' != typeof console.log) {
      console.log(msg);
    }
  }

  render() {
    let appSettings = {
      column2: this.state.column2,
      componentsAvailable: this.getAvailableComponents()
    };
    ReactDOM.render(
      <ColumnLayout handleChildEvent={this.handleComponentEvent.bind(this)} settings={appSettings} />,
      document.querySelector('.app')
    );
  }
};

let app = new App();
