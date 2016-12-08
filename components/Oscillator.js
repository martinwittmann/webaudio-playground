import React from 'react';
import Select from './Select.js';
import MidiInputs from './MidiInputs.js';

export default class Oscillator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: this.props.audioComponent.state.input,
      waveform: this.props.audioComponent.state.waveform,
      frequency: this.props.audioComponent.state.frequency
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

  onFrequencyChanged(value) {
    this.props.onChildEvent('frequencyChanged', value);
    this.setState({
      frequency: value
    });
  }

  onActiveChanged(value) {
    this.props.onChildEvent('activeChanged', value);
    this.setState({
      active: !!value
    });
  }

  onMidiInputChanged(value) {
    this.props.onChildEvent('midiInputChanged', value);
    this.setState({
      midiInput: value
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
    else
    if ('midi' == this.state.input) {
      options.push((<li key="midi-inputs">
        <label className="option-label">Midi Input</label>
        <Select
          className="midi-input"
          onChange={this.onMidiInputChanged.bind(this)}
          value={this.state.midiInput}
          options={this.props.audioComponent.getMidiInputs()}
        />
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