export default class AudioComponent {
  constructor(audioContext, componentId, userTitle) {
    this.id = componentId;

    // Dirty hack to generate a unique title out of the id.
    this.title = userTitle + ' ' + (parseInt(componentId.match(/\d+$/), 10) + 1);

    // This tells us that this component is shown in the sidebar and not (yet)
    // on the canvas. Since the only way to add a component to the canvas is via
    // the sidebar this should not have any sideeffects.
    // Once the component is dropped on the canvas this value gets overwritten.
    this.inSidebar = true;

    this.audioContext = audioContext;
    this.audioNodes = {};
    this.inputs = [];
    this.output = [];

    if (!this.audioContext) {
      this.debug('A valid audioContext is needed to create this AudioComponent.');
    }

    this.canvasSelector = '.components-container';
  }

  // NOTE: This is *not* automatically called when the object is garbage collected.
  //       So we need to call this method when removing/deleting audio components.
  destruct() {
    this.stop();
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

  midiNoteToFrequency(note) {
    return Math.pow(2, (note - 69) / 12) * 440;
  }

  midiEvent(data) {
    let status = this.getStatusByte(data);
    if (this.isNoteOn(status) && this.handleNoteOn) {
      this.handleNoteOn(data[1], data[2]);
    }
    else if (this.isNoteOff(status) && this.handleNoteOff) {
      this.handleNoteOff(data[1]);
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

    if (this.state.midiInput) {
      // Unset existing midi event handler.
      this.midiAccess.inputs.get(this.state.midiInput).onmidimessage = undefined;
      this.unregisterInput('midi-in-' + this.state.midiInput);
    }

    // 
    this.state.midiInput = id;
    let input = this.midiAccess.inputs.get(id);
    if (input && 'undefined'!= input.onmidimessage) {
      input.onmidimessage = this.onMidiMessage.bind(this);
    }

    this.registerInput({
      type: 'midi',
      id: 'midi-in-' + id
    });
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

  registerInput(input) {
    this.inputs.push(input);
    if (this.reactComponent) {
      this.reactComponent.setState({
        inputs: this.inputs
      });
    }
  }

  unregisterInput(inputId) {
    for (let i=0;i<this.inputs.length;i++) {
      if (this.inputs[i].id == inputId) {
        this.inputs.splice(i, 1);
        break;
      }
    }

    if (this.reactComponent) {
      this.reactComponent.setState({
        inputs: this.inputs
      });
    }
  }

  registerOutput(output) {
    this.outputs.push(output);
  }

  log(msg) {
    console.log(msg);
  }
}