import AudioComponent from './audio-component.js';

export default class MidiInComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Midi In');

    // Initialized webaudio midi and add all midi inputs as component inputs.
    this.initMidiAccess();

    this.type = 'midi-in';
    this.reactComponentType = 'MidiIn';

    // Initialize state for this component type.
    this.state.midiInput = false;
  }

  handleMidiEvent(data) {
    console.log('handleMidiEvent', data);
    if (this.outputs.length > 0) {
      // This component only supports 1 output. This output is only available if
      // a valid midi input was selected, which is handled by sendToOutput.
      this.sendToOutput(0, data);
    }
  }
}
