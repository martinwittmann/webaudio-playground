import AudioComponent from './audio-component.js';

export default class Oscillator extends AudioComponent {
  constructor(audioContext, frequency = 440, waveform = 'sine', gain = 1) {
    super(audioContext);

    this.type = 'oscillator';
    this.reactComponent = 'Oscillator';

    this.maxGainPerNote = 0.2;
    this.audioNodes = {};

    this.state = {
      frequency,
      waveform,
      gain
    };

    this.totalGain = this.createGainNode();
    this.totalGain.connect(this.audioContext.destination);

    this.waveforms = ['sine', 'square', 'sawtooth', 'triangle']; // We leave the custom waveform out for now.
  }

  handleNoteOn(note) {
    if ('undefined' != typeof this.audioNodes[note]) {
      let nodes = this.audioNodes[note];
      nodes.gain.gain.value = 0.8;
      clearTimeout(nodes.clearNodesTimeout);
      return;
    }

    let nodes = {
      osc: this.createOscillatorNode(this.state.waveform, this.midiNoteToFrequency(note)),
      gain: this.createGainNode(0.8),
    };

    nodes.osc.connect(nodes.gain);
    nodes.gain.connect(this.totalGain);
    nodes.osc.start();

    this.audioNodes[note] = nodes;
  }

  handleNoteOff(note) {
    //console.log('note off ' + note);
    if ('undefined' == this.audioNodes[note]) {
      // This note is not playing right now.
      return false;
    }

    var nodes = this.audioNodes[note];
    nodes.gain.gain.value = 0;
    var that = this;
    nodes.clearNodesTimeout = setTimeout(() => {
      nodes.osc.stop();
      delete that.audioNodes[note];
    }, 100);
  }
}
