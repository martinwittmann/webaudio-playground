import AudioComponent from './audio-component.js';

export default class Midi2FrequencyComponent extends AudioComponent {
  constructor(audioContext, id) {
    super(audioContext, id, 'Midi to Frequency');

    this.type = 'midi-2-frequency';
    this.reactComponentType = 'Midi2Frequency';

    this.registerInput({
      type: 'midi',
      name: 'Midi In',
    });

    this.registerOutput({
      type: 'frequency',
      name: 'Frequency out',
    });
  }
}
