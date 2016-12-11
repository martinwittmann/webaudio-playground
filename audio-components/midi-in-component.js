import AudioComponent from './audio-component.js';

export default class MidiInComponent extends AudioComponent {
  constructor(audioContext, id) {
    super(audioContext, id, 'Midi In');

    this.initMidiAccess();

    this.type = 'midi-in';
    this.reactComponent = 'MidiIn';

    this.state = {
      midiInput: false
    };
  }
}
