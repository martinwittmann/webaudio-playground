import AudioComponent from './audio-component.js';

export default class MidiInComponent extends AudioComponent {
  constructor(audioContext, id) {
    super(audioContext, id, 'Midi In');

    // Initialized webaudio midi and add all midi inputs as component inputs.
    this.initMidiAccess();

    this.type = 'midi-in';
    this.reactComponentType = 'MidiIn';

    this.state = {
      midiInput: false
    };
  }
}
