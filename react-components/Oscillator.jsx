import React from 'react';
import Select from './ui-components/Select.jsx';

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
    return (
      <ul className="audio-component-options">
      </ul>
    );
  }
};