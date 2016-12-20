import componentIo from '../component-io.js';
import audioComponentOptions from '../component-options.js';

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
    this.options = new audioComponentOptions();

    if (!this.audioContext) {
      this.debug('A valid audioContext is needed to create this AudioComponent.');
    }
  }

  // NOTE: This is *not* automatically called when the object is garbage collected.
  //       So we need to call this method when removing/deleting audio components.
  destruct() {
    this.stop();
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

  moveReactComponent(pos) {
    this.canvasPos = pos;
    this.reactComponent.setState({
      canvasPos: pos
    });
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

  /*
  onChildEvent(type, ...args) {
    let eventName = 'on' + type.substr(0, 1).toUpperCase() + type.substr(1);
    if ('undefined' != typeof this[eventName]) {
      this[eventName].apply(this, args);
    }
  }
  */

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

  getMidiInputs() {
    let result = [];
    this.midiInputs.map(input => {
      result.push({
        name: input.name,
        value: input.id
      });
    });
    return result;
  }

  midiEvent(data) {
    if (this.handleMidiEvent) {
      this.handleMidiEvent(data);
    }
  }

  initMidiAccess(callback) {
    // Initialized with no inputs to prevent errors since requestMIDIAccess is
    // asynchronous.
    this.midiInputs = [];

    if ('undefined' != typeof navigator['requestMIDIAccess']) {
      navigator.requestMIDIAccess().then(this.onMidiAvailable.bind(this), this.onNoMidi.bind(this));
    }
    else {
      this.onNoMidi('The navigator does not supply requestMIDIAccess().');
    }
  }

  onMidiInChanged(id) {
    this.stop(); // Stop everything that's currently playing.

    if (this.state.midiIn) {
      // Unset existing midi event handler.
      this.midiAccess.inputs.get(this.state.midiIn).onmidimessage = undefined;
    }


    // Determine whether there is an input already.
    // This must be done *before* we set the the midiIn because we need the
    // current/old id to be able to find the input.
    let outputIndex = this.getIoIndex('outputs', {id: 'midi-in-' + this.state.midiIn});

    // Set the midi input.
    this.state.midiIn = id;
    let input = this.midiAccess.inputs.get(id);
    if (input && 'undefined'!= input.onmidimessage) {
      input.onmidimessage = this.onMidiMessage.bind(this);
    }

    // Add / update the component's input.
    if (outputIndex > -1) {
      // Update the input.
      this.updateOutput(outputIndex, {
        type: 'midi',
      });
    }
    else {
      this.registerOutput({
        type: 'midi',
        name: input.name
      });
    }

    if (this.reactComponent) {
      this.reactComponent.setState({
        midiIn: id
      });
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

  onMidiMessage(ev) {
    let message = ev.data;
    this.midiEvent(message);
  }

  onMidiAccessDone() {
    if (this.reactComponent) {
      this.reactComponent.setState({
        midiInputs: this.getMidiInputs()
      });
    }
  }

  onMidiAvailable(midiAccess) {
    this.midiAccess = midiAccess;
    this.midiInputs = [];

    for (let input of midiAccess.inputs) {
      this.midiInputs.push({
        id: input[1].id,
        name: input[1].name,
        manufacturer: input[1].manufacturer,
      });
    }

    this.onMidiAccessDone();
  }

  onNoMidi(msg) {
    this.log('No midi available: ' + msg);
    if ('function' == this.onMidiAccessDone) {
      this.onMidiAccessDone();
    }
  };

  mapVeloctiyToGain(velocity) {
    return velocity / (127 / this.maxGainPerNote)
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

    if (output.sendDataCallback) {
      output.sendDataCallback(args);
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

  log(msg) {
    console.log(msg);
  }
}