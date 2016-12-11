import React from 'react';
import ReactDOM from 'react-dom';
import ColumnLayout from './components/ColumnLayout.js';

import componentsRegistry from './components-registry.js';

require('./scss/midi.scss');

export default class App {
  constructor() {
    this.debug = true;
    this.components = new componentsRegistry();

    this.render();
  }

  handleEvent(type, ...args) {
    if ('add-component' == type) {
      if (args.length < 1) {
        this.log('add-component event: Trying to add a component without specifying a type.');
        return false;
      }

      this.components.addComponent(args[0]);
      this.render();
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
      componentsAvailable: this.components.getAvailableComponents().map(c => { return c.create(); }),
      emitEvent: this.handleEvent.bind(this)
    };

    ReactDOM.render(
      <ColumnLayout settings={appSettings} />,
      document.querySelector('.app')
    );
  }
};

let app = new App();
