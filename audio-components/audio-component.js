import componentIo from '../component-io.js';
import audioComponentOption from '../component-option.js';

export default class AudioComponent {
  constructor(app, componentId, userTitle) {
    this.app = app;
    this.id = componentId;

    // Dirty hack to generate a unique title out of the id.
    this.title = userTitle + ' ' + (parseInt(componentId.match(/\d+$/), 10) + 1);

    // This tells us that this component is shown in the sidebar and not (yet)
    // on the canvas. Since the only way to add a component to the canvas is via
    // the sidebar this should not have any sideeffects.
    // Once the component is dropped on the canvas this value gets overwritten.
    this.inSidebar = true;

    this.audioContext = app.audioContext;
    this.audioNodes = {};
    this.inputs = [];
    this.outputs = [];

    // In callbacks we store all functions that need to call another function at
    // some point. For example the Midi in component adds handleMidiEvent to
    // this.callbacks when connectect to another midi input and everytime
    // handleMidiEvent gets called it calls the corresponding callback stored here.
    this.callbacks = {}

    this.canvasPos = {
      x: 0,
      y: 0
    };
    this.connections = [];
    this.options = [];

    if (!this.audioContext) {
      this.debug('A valid audioContext is needed to create this AudioComponent.');
    }
  }

  // NOTE: This is *not* automatically called when the object is garbage collected.
  //       So we need to call this method when removing/deleting audio components.
  destructor() {
    // Stop all playing notes and free the audio nodes.
    this.stop();

    // Unset existing midi event handler, if available.
    if (this.midiIn) {
      this.midiAccess.inputs.get(this.midiIn).onmidimessage = undefined;
    }

    this.inputs.map(input => {
      input.removeAllConnections();
    });

    this.outputs.map(output => {
      output.removeAllConnections();
    });

    this.options.map(option => {
      option.destructor();
    });
  }

  initState() {
    let state = {
      inputs: this.getInputs(),
      outputs: this.getOutputs(),
      canvasPos: {
        x: this.canvasPos.x,
        y: this.canvasPos.y
      },
      canBeDragged: true,
      options: this.options,
      midiIn: false,
      midiInputs: []
    };

    return state;
  }

  createGainNode(volume) {
    let gain = this.audioContext.createGain();
    gain.gain.value = volume;
    return gain;
  }

  createOscillatorNode(waveform, frequency) {
    let osc = this.audioContext.createOscillator();
    osc.type = waveform;
    osc.frequency.value = frequency; 
    return osc;
  }

  createFilterNode(type) {
    let filter = this.audioContext.createBiquadFilter();
    if (type) {
      filter.type = type;
    }
    
    return filter;
  }

  isNoteOff(status, data2) {
    return ((status & 0xF0) == 0x80) || ((status & 0xF0) == 0x90 && data2 == 0);
  }

  isNoteOn(status) {
    return (status & 0xF0) == 0x90;
  }

  getStatusByte(data) {
    let statusByte;

    if (data[0] & 0b10000000) {
      // This is a status byte.

      // We store the status byte because some midi devices might send the
      // status byte only if it it different from the last one.
      this.lastStatusByte = statusByte;

      return data[0];
    }
    else {
      // Retrieve the last status byte if this messages did not include one.
      // See Midi spec.
      return this.lastStatusByte;
    }
  }

  initMidiAccess(succesaCallback, failureCallback) {
    // Initialized with no inputs to prevent errors since requestMIDIAccess is
    // asynchronous.
    this.midiInputs = [];

    if ('undefined' != typeof navigator['requestMIDIAccess']) {
      navigator.requestMIDIAccess().then(succesaCallback, failureCallback);
    }
    else {
      this.onNoMidi('The navigator does not supply requestMIDIAccess().');
    }
  }


  stop() {
    // Stop and destruct all audio nodes.

    Object.keys(this.audioNodes).map(key => {
      let nodes = this.audioNodes[key];
      Object.keys(nodes).map(nodeKey => {
        let node = nodes[nodeKey];
        if ('OscillatorNode' == node.constructor.name) {
          node.stop();
          node.disconnect();
        }
      });
    });

    this.audioNodes = {};
  }

  getIoIndex(type, query) {
    // Query is an object whose properties are being use to find an io which has
    // the same values on all given properties as query.

    if ('undefined' == typeof this[type]) {
      this.log('getIoIndex: Trying to get IO for unknown type ' + type + '.');
      return -1;
    }

    ioLoop: for (let i=0;i<this[type].length;i++) {
      let io = this[type][i];
      queryLoop: for (let key in query) {
        if (query[key] != io[key]) {
          continue ioLoop;
        }
      }

      return i;
    }

    return -1;
  }

  updateOutput(index, newOutput) {
    newOutput.id = this.id + '--output-' + this.newOutput.length;
    return this.updateIO('outputs', index, newOutput);
  }

  updateInput(index, newInput) {
    return this.updateIO('inputs', index, newInput);
  }

  updateIO(type, index, newIO) {
    if ('undefined' == typeof this[type] || 'undefined' == typeof this[type][index]) {
      this.log('updateIO: Trying to update non-existing ' + type + ' with index ' + index + '.');
      return false;
    }

    if (!newIO) {
      this.log('updateIO: Trying to update output with invalid/empty newIO.');
      return false;
    }

    return this[type][index] = newIO;
  }

  getInputs() {
    return this.inputs;
  }

  getOutputs() {
    return this.outputs;
  }

  registerInput(inputData) {
    inputData.id = this.id + '--input-' + this.inputs.length;
    inputData.ioType = 'input';

    let newInput = new componentIo(inputData);
    this.inputs.push(newInput);
    
    if (this.reactComponent) {
      this.reactComponent.setState({
        inputs: this.inputs
      });
    }

    return newInput;
  }

  registerOutput(outputData) {
    outputData.id = this.id + '--output-' + this.outputs.length;
    outputData.ioType = 'output';

    let newOutput = new componentIo(outputData);
    this.outputs.push(newOutput);

    if (this.reactComponent) {
      this.reactComponent.setState({
        outputs: this.outputs
      });
    }

    return newOutput;
  }

  unregisterIo(query, type) {
    if (type.substr(-1) != 's') {
      // getIoIndex expects 'inputs' or 'outputs' and for unregisterIo 'input'/'output'
      // make more sense, so we simply add an s if necessary and both versions work.
      type = type + 's';
    }

    let index = this.getIoIndex(type, query);
    if (-1 === index) {
      this.log('unregisterIo(): could not find input.');
      return false;
    }

    let io = this[type][index];
    io.removeAllConnections();
    this[type].splice(index, 1);
  }

  sendToOutput(index, ...args) {
    let output;
    if ('number' == typeof index) {
      output = this.outputs[index];
    }
    else if ('object' == index) {
      output = index;
    }
    else {
      this.log('sendToOutput: Called with invalid output variable type ' + typeof index);
      return false;
    }

    if (!output) {
      this.log('sendToOutput: Trying to send data to invalid output.', index, args);
      return false;
    }

    for (let ioId in output.sendDataCallbacks) {
      let callback = output.sendDataCallbacks[ioId];
      if ('function' == typeof callback) {
        callback(args);
      }
    }
  }

  getOptionInputData(option) {
    let result = {
      type: option.inputType,
      name: option.label
    };

    if ('number' == option.inputType || 'string' == option.inputType) {
      result.receiveDataCallback = option.onChange;
    }

    return result;
  }

  optionExposeAsInputChanged(value, option) {
    if ((value && option.input) || (!value && !option.input)) {
      // The input is already created/does not exist anymore. Nothing to do.
      this.log('optionExposeAsInputChanged(): Nothing to do.');
      return false;
    }

    if (value) {
      option.input = this.registerInput(this.getOptionInputData(option));
    }
    else {
      this.unregisterIo({id: option.input.id}, 'input');
      delete option.input;
    }
  }

  getPossibleUiComponentsForOption(option) {
    switch (option.type) {
      case 'choice':
        return [
          {
            // Select looks like a 'Please select' message and is confusing.
            name: 'Dropdown',
            value: 'Select'
          },
          {
            name: 'Radios',
            value: 'Radios'
          }
        ];

      case 'number':
        return [
          {
            name: 'NumberInput',
            value: 'NumberInput'
          }
        ];

      case 'string':
      default:
        return [
          {
            name: 'TextInput',
            value: 'TextInput'
          }
        ];

    }
  }

  addOption(optionData, changeCallback, changeCallbackThis) {
    this.options.push(new audioComponentOption(optionData, (value, option) => {
      if (changeCallback) {
        changeCallback.apply(changeCallbackThis, [value, option]);
      }
    }));
  }

  getOption(id) {
    for (let i=0;i<this.options.length;i++) {
      if (id == this.options[i].id) {
        return this.options[i];
      }
    }
    return false;
  }

  log(msg) {
    console.log(msg);
  }
}