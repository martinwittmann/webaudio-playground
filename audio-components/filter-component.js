import AudioComponent from './audio-component.js';
import audioComponentOption from '../component-option.js';

export default class FilterComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Filter');
    this.type = 'filter';

    // Initialize state for this component type.
    this.audioNodes = {};
    this.filterTypes = [
      'lowpass',
      'highpass',
      'bandpass',
      'lowshelf',
      'highshelf',
      'peaking',
      'notch',
      'allpass'
    ];
    this.frequency = 440;
    this.q = 1;
    this.minQ = 0.0001;
    this.maxQ = 1000;
    //this.gain = 1;

    this.filterType = this.filterTypes[0];
    this.filterNode = this.createFilterNode(this.filterType);


    this.registerInput({
      dataType: 'audio',
      name: 'Audio In',
      audioNode: this.filterNode
    });

    this.registerOutput({
      dataType: 'audio',
      name: 'Audio Out',
      audioNode: this.filterNode
    });

    // Set up available options:
    this.addOption({
      id: 'type',
      label: 'Filter Type',
      type: 'choice',
      choices: this.getFilterTypes.bind(this), // Could be an array or a function.
      value: 'lowpass',
      exposeAsInput: {
        exposable: false,
        value: false
      },
      exposeToCanvasUi: {
        exposable: true,
        value: true,
        inputUiComponentType: 'Select'
      },
      exposeToUserUi: {
        exposable: false,
        value: false
      },
    }, this.onFilterTypeChanged, this);


    this.addOption({
      id: 'frequency',
      label: 'Frequency',
      type: 'number',
      range: [20, 20000],
      value: 1000,
      stepSize: 1,
      logarithmic: true,
      exposeAsInput: {
        exposable: true,
        value: false
      },
      exposeToCanvasUi: {
        exposable: true,
        value: true,
        inputUiComponentType: 'Knob'
      },
      exposeToUserUi: {
        exposable: true,
        value: true,
        inputUiComponentType: 'Knob'
      },
    }, this.onCutoffFrequencyChanged, this);
  }

  getFilterTypes() {
    let result = [];
    this.filterTypes.map(type => {
      result.push({
        name: type.substr(0, 1).toUpperCase() + type.substr(1),
        value: type
      });
    });

    return result;
  }

  onFilterTypeChanged(newFilterType) {
    if (this.filterTypes.indexOf(newFilterType) < 0) {
      this.log('onFilterTypeChanged(): Invalid type ' + newFilterType + '.');
      return false;
    }
    this.filterType = newFilterType;
    this.filterNode.type = newFilterType;
  }

  onCutoffFrequencyChanged(frequency) {
    this.frequency = frequency;
    if (this.active) {
      this.filterNode.frequency.value = frequency;
    }
  }
}
