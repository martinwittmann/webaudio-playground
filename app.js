import React from 'react';
import ReactDOM from 'react-dom';
import ColumnLayout from './react-components/ColumnLayout.js';

import componentsRegistry from './components-registry.js';

require('./scss/midi.scss');

export default class App {
  constructor() {
    this.debug = true;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.components = new componentsRegistry(this.audioContext);
    this.render();
  }

  handleEvent(type, ...args) {
    switch (type) {
      case 'add-component':
        if (args.length < 1) {
          this.log('add-component event: Trying to add a component without specifying a type.');
          return false;
        }

        this.components.addComponent(args[0]);
        this.render();
        break;

      case 'get-available-component-by-id':
        return this.components.getAvailableComponentById(args[0]);
        break;

      case 'get-canvas-component-by-id':
        return this.components.getCanvasComponentById(args[0]);
        break;
    }
  }

  log(msg) {
    if (this.debug && 'undefined' != typeof console.log) {
      console.log(msg);
    }
  }

  render() {
    let appSettings = {
      components: this.components.components,
      componentsAvailable: this.components.getAvailableComponents(),
      emitEvent: this.handleEvent.bind(this)
    };

    let outputs = [];

    ReactDOM.render(
      <ColumnLayout settings={appSettings} />,
      document.querySelector('.app')
    );
  }
};

let app = new App();
