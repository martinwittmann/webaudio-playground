import AudioComponent from './audio-component.js';

export default class Oscillator extends AudioComponent {
  constructor(audioContext, frequency = 440, waveform = 'sine', gain = 1) {
    super(audioContext);

    this.state = {
      frequency,
      waveform,
      gain
    };

    this.wavesforms = ['sine', 'square', 'sawtooth', 'triangle']; // We leave the custom waveform out for now.

    this.gainNode = this.createGainNode(gain);
    this.debug(this.gainNode.gain.value);
  }
}
