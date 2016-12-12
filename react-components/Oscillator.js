import React from 'react';
import Select from './Select.js';

export default class Oscillator extends React.Component {
  constructor(props) {
    super(props);
    props.audioComponent.reactComponent = this;
    
    this.state = {
      inputs: [],

      // These are old state properties...
      input: this.props.audioComponent.state.input,
      waveform: this.props.audioComponent.state.waveform,
      frequency: this.props.audioComponent.state.frequency,
      active: this.props.audioComponent.state.active
    };
  }

  onWaveformChanged(value) {
    this.props.onChildEvent('waveformChanged', value);
    this.setState({
      waveform: value
    });
  }

  onInputChanged(value) {
    this.props.onChildEvent('inputChanged', value);
    this.setState({
      input: value
    });
  }

  onFrequencyChanged(ev) {
    let frequency = parseFloat(ev.target.value, 10);
    this.props.onChildEvent('frequencyChanged', frequency);
    this.setState({
      frequency: frequency
    });
  }

  onActiveChanged(ev) {
    this.props.onChildEvent('activeChanged', ev.target.checked);
    this.setState({
      active: ev.target.checked
    });
  }

  render() {
    let options = [
      (<li key="input">
        <label className="option-label">Input:</label>
        <Select
          className="input-select"
          defaultValue={this.state.input}
          options={this.props.audioComponent.getInputTypes()}
          onChange={this.onInputChanged.bind(this)}
        />
      </li>),
     (<li key="waveform">
        <label className="option-label">Waveform:</label>
        <Select
          className="wafeform-select"
          defaultValue={this.state.waveform}
          options={this.props.audioComponent.getWaveforms()}
          onChange={this.onWaveformChanged.bind(this)}
        />
      </li>)
    ];

    if ('fixed' == this.state.input) {
      options.push((<li key="frequency">
        <label className="option-label">Frequency:</label>
        <input name="frequency" onChange={this.onFrequencyChanged.bind(this)} value={this.state.frequency} />
      </li>));
      options.push((<li key="active">
        <label className="option-label">Output:</label>
        <input id="activate-{this.props.audioComponent.id}" type="checkbox" onChange={this.onActiveChanged.bind(this)} value={this.state.active} />
        <label htmlFor="activate-{this.props.audioComponent.id}">activate</label>
      </li>));
    }
    return (
      <ul className="audio-component-options">
        {options}
      </ul>
    );
  }
};