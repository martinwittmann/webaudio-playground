import React from 'react';
import Oscillator from './Oscillator.js';

export default class MidiInputs extends React.Component {
  onMidiInputSelected(e) {
    var inputIndex = e.target.value;
    this.props.onMidiInputChanged(inputIndex);
  }

  render() {
    console.log('ssssssss');
    let inputOptions = this.props.midiInputs.map((input) => {
      return (<option key={input.id} value={input.id}>{input.name}</option>);
    });

    return (
      <div className="midi-settings">
        <h1>Midi Settings</h1>
        <select className="midi-inputs" onChange={this.onMidiInputChanged.bind(this)}>
          <option value="">[Please select input]</option>
          {inputOptions}
        </select>
      </div>
    );
  }
}
