import OscillatorComponent from './audio-components/oscillator-component.js';
import MidInComponent from './audio-components/midi-in-component.js';
import Midi2FrequencyComponent from './audio-components/midi-2-frequency-component.js';
import MidiKeyboardComponent from './audio-components/midi-keyboard-component.js';
import AudioOutComponent from './audio-components/audio-out-component.js';

export default class componentsRegistry {

  constructor(app) {
    this.registeredComponentTypes = {};
    this.components = [];

    // This gets populated when calling getAvailableComponents() and is used as
    // a cache to prevent recreating audiocomponents everytime we render the
    // available compoents.
    this.availableComponents = {};

    // We use this only to create component ids which inlcude the type.
    // See createComponentId().
    this.addedComponentTypes = {};

    // Register components:
    
    // 1. Create and import the audio-component derived class
    // 2. Call this.registerComponentType for the new type
    // 3. Create the corresponding react component
    // 4. Import the react component in the ReactAudioComponent.jsx component.
    // 5. Add render code in ReactAudioComponent.jsx::render()

    this.registerComponentType('oscillator', {
      create: function() {
        return new OscillatorComponent(app, this.createComponentId('oscillator'));
      }
    });
    this.registerComponentType('midi-in', {
      create: function() {
        return new MidInComponent(app, this.createComponentId('midi-in'));
      }
    });
    this.registerComponentType('midi-2-frequency', {
      create: function() {
        return new Midi2FrequencyComponent(app, this.createComponentId('midi-2-frequency'));
      }
    });
    this.registerComponentType('midi-keyboard', {
      create: function() {
        return new MidiKeyboardComponent(app, this.createComponentId('midi-keyboard'));
      }
    });
    this.registerComponentType('audio-cout', {
      create: function() {
        return new AudioOutComponent(app, this.createComponentId('audio-out'));
      }
    });
  }

  registerComponentType(componentName, componentData) {
    this.registeredComponentTypes[componentName] = componentData;

    if ('undefined' != this.addedComponentTypes[componentName]) {
      this.addedComponentTypes[componentName] = 0;
    }
  }

  getAvailableComponentTypes() {
    let result = [];
    for (var componentType in this.registeredComponentTypes) {
      if (!this.registeredComponentTypes.hasOwnProperty(componentType)) {
        continue;
      }
      result.push(componentType);
    }
    return result;
  }

  getAvailableComponents() {
    let componentTypes = this.getAvailableComponentTypes();
    let result = [];

    return componentTypes.map(type => {
      if ('undefined' == typeof this.availableComponents[type]) {
        this.availableComponents[type] = this.registeredComponentTypes[type].create.apply(this, []);
      }

      return this.availableComponents[type];
    });
  }

  getAvailableComponentById(id) {
    for (let key in this.availableComponents) {
      let c = this.availableComponents[key];
      if (c.id === id) {
        return c;
      }
    }

    return false;
  }

  getCanvasComponentById(id) {
    for (let key in this.components) {
      let c = this.components[key];
      if (c.id === id) {
        return c;
      }
    }
    return false;
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

    // We need to remove this component from the available components so that a
    // new one will be created.
    delete this.availableComponents[component.type];
    this.addedComponentTypes[component.type]++;
    this.components.push(component);
  }

  createComponentId(type) {
    let id = type + '-' + this.addedComponentTypes[type];
    return id;
  }

  log(msg) {
    if (console && 'undefined' != console.log) {
      console.log(msg);
    }
  }
}