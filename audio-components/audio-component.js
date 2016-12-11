export default class AudioComponent {
  constructor(componentId) {
    this.id = componentId;
    // This tells us that this component is shown in the sidebar and not (yet)
    // on the canvas. Since the only way to add a component to the canvas is via
    // the sidebar this should not have any sideeffects.
    // Once the component is dropped on the canvas this value gets overwritten.
    this.inSidebar = true;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    if (!this.audioContext) {
      this.debug('A valid audioContext is needed to create this AudioComponent.');
    }

    this.initMidiAccess();
    this.canvasSelector = '.components-container';
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

  initMidiAccess() {
    if ('undefined' != typeof navigator['requestMIDIAccess']) {
      navigator.requestMIDIAccess().then(this.onMidiAvailable.bind(this), this.onNoMidi.bind(this));
    }
    else {
      this.onNoMidi('The navigator does not supply requestMIDIAccess().');
    }
  }

  onMidiInputChanged(id) {
    this.stop();
    if (this.state.midiInput) {
      this.midiAccess.inputs.get(this.state.midiInput).onmidimessage = undefined;
    }
    this.state.midiInput = id;
    this.midiAccess.inputs.get(id).onmidimessage = this.onMidiMessage.bind(this);
  }

  onMidiMessage(ev) {
    let message = ev.data;
    this.midiEvent(message);
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
  }

  onNoMidi(msg) {
    console.log('No midi available: ' + msg);
  };


  log(msg) {
    console.log(msg);
  }
}