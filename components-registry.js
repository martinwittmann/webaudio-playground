import OscillatorComponent from './audio-components/oscillator-component.js';


export default class componentsRegistry {

  constructor() {
    this.registeredComponents = {};
    this.components = [];

    // Register components.
    this.registerComponent( 'oscillator', {
      create: function() {
        return new OscillatorComponent();
      }
    });
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

  addComponent(type) {
    let component;
    if ('String' == typeof type) {
      // If we're given a component type string, add a component of that type.
      if ('undefined' == typeof this.registeredComponents[type]) {
        this.log('addComponent: Trying to add a component for an unregistered type "' + type + '".');
        return false;
      }

      component = this.registeredComponents[type].create();
    }
    else if ('object' == typeof type) {
      // We're given an existing component object, that we can add directly.
      component = type;
    }
    else {
      this.log('addComponent: Called with invalid argument type ' + typeof type);
      return false;
    }

    this.components.push(component);
  }
}