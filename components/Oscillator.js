import React from 'react';
import Select from './Select.js';

export default class Oscillator extends React.Component {
  constructor() {
    super();
  }

  onWaveformChanged(value) {
    this.props.onWaveformChanged(value);
  }

  render() {
    return (
      <div className="audio-component oscillator">
        <label>Oscillator</label>
        <Select className="wafeform-select" defaultValue={this.props.audioComponent.state.waveform} options={this.props.audioComponent.getWaveforms()} onChange={this.onWaveformChanged.bind(this)} />
        <p>{this.props.audioComponent.state.frequency}</p>
      </div>
    );
  }
};