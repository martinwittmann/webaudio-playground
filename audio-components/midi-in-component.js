import AudioComponent from './audio-component.js';

export default class MidiInComponent extends AudioComponent {
  constructor(audioContext, id) {
    super(audioContext, id, 'Midi In');

    // Initialized webaudio midi and add all midi inputs as component inputs.
    this.initMidiAccess();

    this.type = 'midi-in';
    this.reactComponentType = 'MidiIn';

    // Initialize state for this component type.
    this.state.midiInput = false;
  }

  handleMidiEvent(data) {
    let outputIndex = this.getOutputIndex('midi-in-' + this.state.midiIn);
    if (outputIndex > -1) {
      this.transmitToOutput(outputIndex, data);
    }
  }
}
