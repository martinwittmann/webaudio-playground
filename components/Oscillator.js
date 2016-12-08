import React from 'react';

export default class Oscillator extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div className="oscillator">
        <label>Oscillator</label>
        <p>{this.props.oscillator.waveform.value}</p>
        <p>{this.props.oscillator.frequency.value}</p>
      </div>
    );
  }
};