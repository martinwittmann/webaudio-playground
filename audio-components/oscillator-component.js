import AudioComponent from './audio-component.js';

export default class OscillatorComponent extends AudioComponent {
  constructor(audioContext, frequency = 440, waveform = 'sine', gain = .2) {
    super(audioContext);

    this.type = 'oscillator';
    this.reactComponent = 'Oscillator';

    this.maxGainPerNote = 0.4;
    this.audioNodes = {};

    this.state = {
      input: 'fixed',
      active: false,
      frequency,
      waveform,
      gain
    };

    this.totalGain = this.createGainNode(0.8);
    this.totalGain.connect(this.audioContext.destination);

    this.waveforms = ['sine', 'square', 'sawtooth', 'triangle']; // We leave the custom waveform out for now.
  }

  getWaveforms() {
    let result = [];
    this.waveforms.map(waveform => {
      result.push({
        name: waveform.substr(0, 1).toUpperCase() + waveform.substr(1),
        value: waveform
      });
    });

    return result;
  }

  getInputTypes() {
    return [
      {
        name: 'Fixed',
        value: 'fixed'
      },
      {
        name: 'Midi',
        value: 'midi'
      }
    ];
  }

  mapVeloctiyToGain(velocity) {
    return velocity / (127 / this.maxGainPerNote)
  }

  onWaveformChanged(newWaveform) {
    this.state.waveform = newWaveform;
    Object.keys(this.audioNodes).map(key => {
      let nodes = this.audioNodes[key];
      Object.keys(nodes).map(nodeKey => {
        let node = nodes[nodeKey];
        if ('OscillatorNode' == node.constructor.name) {
          node.type = newWaveform;
        }
      });
    });
  }

  onInputChanged(input) {
    this.state.input = input;
    this.stop();
  }

  onFrequencyChanged(frequency) {
    this.state.frequency = frequency;
    if (this.state.active) {
      this.audioNodes.fixed.osc.frequency.value = frequency;
    }
  }

  onActiveChanged(active) {
    this.state.active = active;

    if (active) {
      if (this.audioNodes.fixed) {
        this.audioNodes.fixed.gain.gain.value = this.state.gain;
        clearTimeout(this.audioNodes.fixed.clearNodesTimeout);
        return;
      }

      let nodes = {
        osc: this.createOscillatorNode(this.state.waveform, this.state.frequency),
        gain: this.createGainNode(this.state.gain),
      };

      nodes.osc.connect(nodes.gain);
      nodes.gain.connect(this.totalGain);
      nodes.osc.start();

      this.audioNodes.fixed = nodes;
    }
    else {
      let nodes = this.audioNodes.fixed;
      nodes.gain.gain.value = 0;
      var that = this;
      nodes.clearNodesTimeout = setTimeout(() => {
        nodes.osc.stop();
        nodes.osc.disconnect();
        delete that.audioNodes.fixed;
      }, 100);
    }
  }

  stop() {
    // Stop all playing oscillators.
    Object.keys(this.audioNodes).map(key => {
      let nodes = this.audioNodes[key];
      Object.keys(nodes).map(nodeKey => {
        let node = nodes[nodeKey];
        if ('OscillatorNode' == node.constructor.name) {
          node.stop();
          node.disconnect();
        }
      });
    });
    this.audioNodes = {};
  }

  handleNoteOn(note, velocity = 127) {
    let gain = this.mapVeloctiyToGain(velocity);

    if ('undefined' != typeof this.audioNodes[note]) {
      let nodes = this.audioNodes[note];
      nodes.gain.gain.value = gain;
      clearTimeout(nodes.clearNodesTimeout);
      return;
    }

    let nodes = {
      osc: this.createOscillatorNode(this.state.waveform, this.midiNoteToFrequency(note)),
      gain: this.createGainNode(gain),
    };

    nodes.osc.connect(nodes.gain);
    nodes.gain.connect(this.totalGain);
    nodes.osc.start();

    this.audioNodes[note] = nodes;
  }

  handleNoteOff(note) {
    //console.log('note off ' + note);
    if (!this.audioNodes[note]) {
      // This note is not playing right now.
      return false;
    }

    var nodes = this.audioNodes[note];
    nodes.gain.gain.value = 0;
    var that = this;
    nodes.clearNodesTimeout = setTimeout(() => {
      nodes.osc.stop();
      nodes.osc.disconnect();
      delete that.audioNodes[note];
    }, 100);
  }
}