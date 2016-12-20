import AudioComponent from './audio-component.js';

export default class AudioOutComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Audio Out');
    this.type = 'audio-out';

    this.registerInput({
      type: 'audio',
      name: 'Audio Out',
      destination: this.audioContext.destination
    });
  }
}
