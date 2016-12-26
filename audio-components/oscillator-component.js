import AudioComponent from './audio-component.js';
import audioComponentOption from '../component-option.js';

export default class OscillatorComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Oscillator');

    this.type = 'oscillator';
    this.maxGainPerNote = 0.4;
    this.audioNodes = {};

    // Initialize state for this component type.
    this.input = 'fixed';
    this.active = false;
    this.frequency = 440;
    this.waveform = 'sine';
    this.gain = .2;

    this.totalGain = this.createGainNode(0.8);
    this.waveforms = ['sine', 'square', 'sawtooth', 'triangle']; // We leave the custom waveform out for now.


    this.registerInput({
      dataType: 'number',
      name: 'Frequency In',
      receiveDataCallback: this.handleFrequencyIn.bind(this)
    });

    this.registerOutput({
      dataType: 'audio',
      name: 'Audio Out',
      audioNode: this.totalGain
    });

    // Set up available options:
    this.addOption({
      id: 'waveform',
      label: 'Waveform',
      type: 'choice',
      choices: this.getWaveforms.bind(this), // Could be an array or a function.
      value: 'sine',
      exposeAsInput: {
        exposable: true,
        value: false
      },
      exposeToCanvasUi: {
        exposable: true,
        value: true,
        inputType: 'Select'
      },
      exposeToUserUi: {
        exposable: true,
        value: false,
        inputType: 'Select'
      },
    }, this.onWaveformChanged, this);

    this.addOption({
      id: 'volume-source',
      label: 'Volume source',
      type: 'choice',
      choices: [
        {
          name: 'From Midi',
          value: 'from-midi'
        },
        {
          name: 'Fixed',
          value: 'fixed'
        }
      ],
      value: 'from-midi',
      exposeAsInput: {
        exposable: false
      },
      exposeToCanvasUi: {
        exposable: true,
        value: false,
        inputType: 'Select'
      },
      exposeToUserUi: {
        exposable: false
      }
    }, this.onVelocitySourceChanged, this);

    this.addOption({
      id: 'fixed-volume',
      label: 'Volume',
      type: 'number',
      range: [0, 1],
      stepSize: 0.01,
      value: 0,
      exposeAsInput: {
        exposable: false
      },
      exposeToCanvasUi: {
        exposable: true,
        value: true,
        inputType: 'Knob',
      },
      exposeToUserUi: {
        exposable: true,
        value: false
      },
      // Conditions of other settings that must be met to make this option available.
      conditions: {
        'volume-source': 'fixed'
      }
    }, this.onFixedVolumeChanged, this);
  }

  handleFrequencyIn(args) {
    let data = args[0];

    if (data.gain > 0) {
      this.playFrequency(data.frequency, data.gain);
    }
    else {
      this.stopFrequency(data.frequency);
    }
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

  onWaveformChanged(newWaveform) {
    if (this.waveforms.indexOf(newWaveform) < 0) {
      this.log('onWaveformChanged(): Invalid waveform ' + newWaveform + '.');
      return false;
    }
    this.waveform = newWaveform;
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
    this.input = input;
    this.stop();
  }

  onFrequencyChanged(frequency) {
    this.frequency = frequency;
    if (this.active) {
      this.audioNodes.fixed.osc.frequency.value = frequency;
    }
  }

  onActiveChanged(active) {
    this.active = active;

    if (active) {
      if (this.audioNodes.fixed) {
        this.audioNodes.fixed.gain.gain.value = this.gain;
        clearTimeout(this.audioNodes.fixed.clearNodesTimeout);
        return;
      }

      let nodes = {
        osc: this.createOscillatorNode(this.waveform, this.frequency),
        gain: this.createGainNode(this.gain),
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

  playFrequency(frequency, gain = .5) {
    if ('undefined' != typeof this.audioNodes[frequency]) {
      let nodes = this.audioNodes[frequency];
      nodes.gain.gain.value = gain;
      clearTimeout(nodes.clearNodesTimeout);
      return;
    }

    let nodes = {
      osc: this.createOscillatorNode(this.waveform, frequency),
      gain: this.createGainNode(gain),
    };

    nodes.osc.connect(nodes.gain);
    nodes.gain.connect(this.totalGain);
    nodes.osc.start();

    this.audioNodes[frequency] = nodes;
  }

  stopFrequency(frequency) {
    if (!this.audioNodes[frequency]) {
      // This note is not playing right now.
      return false;
    }

    var nodes = this.audioNodes[frequency];
    nodes.gain.gain.value = 0;
    var that = this;
    nodes.clearNodesTimeout = setTimeout(() => {
      nodes.osc.stop();
      nodes.osc.disconnect();
      delete that.audioNodes[frequency];
    }, 100);
  }

  onVelocitySourceChanged(velocitySource) {
    // TODO: Implementation.

  }

  onFixedVolumeChanged() {
    // TODO: Implementation.
  }
}
