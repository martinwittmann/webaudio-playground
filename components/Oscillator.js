import React from 'react';
import Select from './Select.js';

export default class Oscillator extends React.Component {
  constructor() {
    super();
  }

  onWaveformChanged(value) {
    this.props.onChildEvent('waveformChanged', value);
  }

  onInputChanged(value) {
    this.props.onChildEvent('inputChanged', value);
  }

  render() {
    let options = [
      (<li key="input">
        <label>Input:</label>
        <Select
          className="input-select"
          defaultValue={this.props.audioComponent.state.input}
          options={this.props.audioComponent.getInputTypes()}
          onChange={this.onInputChanged.bind(this)}
        />
      </li>),
     (<li key="waveform">
        <label>Waveform:</label>
        <Select
          className="wafeform-select"
          defaultValue={this.props.audioComponent.state.waveform}
          options={this.props.audioComponent.getWaveforms()}
          onChange={this.onWaveformChanged.bind(this)}
        />
      </li>)
    ];

    if ('fixed' == this.props.audioComponent.state.input) {
      options.push((<li key="frequency">
        <label>Frequency</label>
        <input name="frequency" onChange={this.onFrequencyChanged.bind(this)} value={this.props.audioComponent.state.frequency} />
      </li>));
    }
    return (
      <div className="audio-component oscillator">
        <h2 className="audio-component-headline">Oscillator</h2>
        <ul className="audio-component-options">
          {options}
        </ul>
      </div>
    );
  }
};