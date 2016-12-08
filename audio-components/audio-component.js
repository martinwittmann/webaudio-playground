export default class AudioComponent {
  constructor(audioContext) {
    this.audioContext = audioContext;

    if (!this.audioContext) {
      this.debug('A valid audioContext is needed to create this AudioComponent.');
    }
  }

  createGainNode(volume) {
    let gain = this.audioContext.createGain();
    gain.gain.value = volume;
    return gain;
  }

  debug(msg) {
    console.log(msg);
  }
}