import OscillatorComponent from './audio-components/oscillator-component.js';
import MidInComponent from './audio-components/midi-in-component.js';


export default class componentsRegistry {

  constructor() {
    this.registeredComponentTypes = {};
    this.components = [];

    // We use this only to create component ids which inlcude the type.
    // See createComponentId().
    this.addedComponentTypes = {};

    // Register components:
    
    // 1. Create and import the audio-component derived class
    // 2. Call this.registerComponentType for the new type
    // 3. Create the corresponding react component
    // 4. Import the react component in the AudioComponent.js react component.
    // 5. Add render code in AudioComponent.js::render()

    this.registerComponentType('oscillator', {
      create: function() {
        return new OscillatorComponent(this.createComponentId('oscillator'));
      }
    });
    this.registerComponentType('midi-in', {
      create: function() {
        return new MidInComponent(this.createComponentId('midi-in'));
      }
    });
  }

  registerComponentType(componentName, componentData) {
    this.registeredComponentTypes[componentName] = componentData;

    if ('undefined' != this.addedComponentTypes[componentName]) {
      this.addedComponentTypes[componentName] = 0;
    }
  }

  getAvailableComponents() {
    let result = [];
    for (var componentType in this.registeredComponentTypes) {
      if (!this.registeredComponentTypes.hasOwnProperty(componentType)) {
        continue;
      }
      result.push(this.registeredComponentTypes[componentType]);
    }
    return result;
  }

  addComponent(type) {
    let component;
    if ('String' == typeof type) {
      // If we're given a component type string, add a component of that type.
      if ('undefined' == typeof this.registeredComponentTypes[type]) {
        this.log('addComponent: Trying to add a component for an unregistered type "' + type + '".');
        return false;
      }

      component = this.registeredComponentTypes[type].create.apply(this, []);
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

  createComponentId(type) {
    let id = type + '-' + this.addedComponentTypes[type];
    this.addedComponentTypes[type]++;
    return id;
  }
}