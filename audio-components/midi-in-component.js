import AudioComponent from './audio-component.js';

export default class MidiInComponent extends AudioComponent {
  constructor(id) {
    super(id);

    this.type = 'midi-in';
    this.reactComponent = 'MidiIn';
  }
}
