import React from 'react';
import ReactDOM from 'react-dom';
import ColumnLayout from './components/ColumnLayout.js';

import OscillatorComponent from './audio-components/oscillator-component.js';

require('./scss/midi.scss');

export default class App {
  constructor() {
    this.debug = true;
    this.components = [];
    this.registeredComponents = {};

    // Register components.
    this.registerComponent( 'oscillator', {
      create: function() {
        return new OscillatorComponent();
      }
    });

    this.render();
  }

  handleComponentEvent(type, ...args) {
    if ('add-component' == type) {
      if (args.length < 1) {
        this.debug('add-component event: Trying to add a component without specifying a type.');
        return false;
      }

      this.addComponent(args[0]);
      this.render();
    }
  }

  addComponent(type) {
    if ('undefined' == typeof this.registeredComponents[type]) {
      this.debug('addComponent: Trying to add a component for an unregistered type "' + type + '".');
      return false;
    }

    this.components.push(this.registeredComponents[type].create());
  }

  registerComponent(componentName, componentData) {
    this.registeredComponents[componentName] = componentData;
  }

  getAvailableComponents() {
    let result = [];
    for (var componentType in this.registeredComponents) {
      if (!this.registeredComponents.hasOwnProperty(componentType)) {
        continue;
      }
      result.push(this.registeredComponents[componentType]);
    }
    return result;
  }

  debug(msg) {
    if (this.debug && 'undefined' != typeof console.log) {
      console.log(msg);
    }
  }

  render() {
    let appSettings = {
      components: this.components,
      componentsAvailable: this.getAvailableComponents().map(c => { return c.create(); })
    };
    ReactDOM.render(
      <ColumnLayout handleChildEvent={this.handleComponentEvent.bind(this)} settings={appSettings} />,
      document.querySelector('.app')
    );
  }
};

let app = new App();
