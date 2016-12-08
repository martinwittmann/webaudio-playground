import React from 'react';

export default class Oscillator extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div className="oscillator">
        <label>Oscillator</label>
        <p>{this.props.audioComponent.state.waveform}</p>
        <p>{this.props.audioComponent.state.frequency}</p>
      </div>
    );
  }
};