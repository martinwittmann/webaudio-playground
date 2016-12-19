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

    this.state = {
      canvasPos: {
        x: 0,
        y: 0
      },
      connections: []
    };

    this.options = []; // Default empty options which can be overwritten.

    if (!this.audioContext) {
      this.debug('A valid audioContext is needed to create this AudioComponent.');
    }
  }

  // NOTE: This is *not* automatically called when the object is garbage collected.
  //       So we need to call this method when removing/deleting audio components.
  destruct() {
    this.stop();
  }

  moveReactContainerComponent(pos) {
    this.state.canvasPos = pos;
    this.reactContainerComponent.setState({
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

  onChildEvent(type, ...args) {
    let eventName = 'on' + type.substr(0, 1).toUpperCase() + type.substr(1);
    if ('undefined' != typeof this[eventName]) {
      this[eventName].apply(this, args);
    }
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

  onMidiInChanged(ev) {
    // The raw onChange event from a select from node.
    let id = ev.target.value;

    this.stop(); // Stop everything that's currently playing.

    if (this.state.midiIn) {
      // Unset existing midi event handler.
      this.midiAccess.inputs.get(this.state.midiIn).onmidimessage = undefined;
    }


    // Determine whether there is an input already.
    // This must be done *before* we set the the midiIn because we need the
    // current/old id to be able to find the input.
    let outputIndex = this.getOutputIndex('midi-in-' + this.state.midiIn);

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
        midiIn: id,
      });
    }
    // NOTE: We don't need to call setState for reactContainerComponent since
    //       registerInput/registerOutput call this already.
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

  getInputIndex(id) {
    return this.getIOIndex('inputs', id);
  }

  getOutputIndex(id) {
    return this.getIOIndex('outputs', id);
  }

  getIOIndex(type, id) {
    if ('undefined' == typeof this[type]) {
      this.log('getIOIndex: Trying to get IO for unknown type ' + type + '.');
      return -1;
    }

    for (let i=0;i<this[type].length;i++) {
      if (this[type][i].id == id) {
        return i;
      }
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

  registerInput(input) {
    input.id = this.id + '--input-' + this.inputs.length;
    input.ioType = 'input';
    this.inputs.push(input);
    
    if (this.reactComponent) {
      this.reactContainerComponent.setState({
        inputs: this.inputs
      });
    }
  }

  registerOutput(output) {
    output.id = this.id + '--output-' + this.outputs.length;
    output.ioType = 'output';
    this.outputs.push(output);

    if (this.reactComponent) {
      this.reactContainerComponent.setState({
        outputs: this.outputs
      });
    }
  }

  unregisterIo(ioId, type) {
    if ('object' == typeof ioId) {
      ioId = ioId.id;
    }
    if (type.substr(-1) != 's') {
      // getIoIndex expects 'inputs' or 'outputs' and for unregisterIo 'input'/'output'
      // make more sense, so we simply add an s if necessary and both versions work.
      type = type + 's';
    }

    let index = this.getIoIndex(type, ioId);
    if (index > -1) {
      let io = this.inputs[ioId];
      io.removeAllConnections();
      this[type].splice(ioId, 1);
    }
  }

  connectOutput(output, toInput) {
    output.addConnection(toInput);
  }

  disconnectOutput(output, input) {
    switch (output.type) {
      case 'midi':
      case 'frequency':
        output.sendDataCallback = false;
        break;

      case 'audio':
        // Disconnect the output node.
        output.audioNode.disconnect(input.destination);
        //output.connectionsI//
        break;
    }
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

  getOptionInput(optionId) {

  }

  optionExposeAsInputChanged(optionId, value) {
    let existingInput = this.getOptionInput(optionId);

    if ((value && existingInput) || (!value && !existingInput)) {
      // The input is already created/does not exist anymore. Nothing to do.
      return false;
    }

    if (value) {

    }
    else {
      this.unregister
    }
  }

  log(msg) {
    console.log(msg);
  }
}