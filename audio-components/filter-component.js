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
        value: false,
        inputType: 'select'
      },
      exposeToUserUi: {
        exposable: false,
        value: false
      },
    }, this.onFilterTypeChanged, this);
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
    console.log(this.filterType);
    this.filterNode.type.value = newFilterType;
  }

  onCutoffFrequencyChanged(frequency) {
    this.frequency = frequency;
    if (this.active) {
      this.filterNode.frequency.value = frequency;
    }
  }
}
