import AudioComponent from './audio-component.js';

export default class AudioOutComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Audio Out');

    this.type = 'audio-out';
    this.reactComponentType = 'AudioOut';

    this.registerOutput({
      type: 'audio',
      name: 'Audio Out'
    });
  }
}
