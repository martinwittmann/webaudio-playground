import React from 'react';

export default class MidiSettings extends React.Component {
  onMidiInputSelected(e) {
    var inputIndex = e.target.value;
    this.props.onMidiInputSelected(inputIndex);
  }

  render() {
    let inputOptions = this.props.midiInputs.map((input) => {
      return (<option key={input.id} value={input.id}>{input.name}</option>);
    });

    return (
      <div className="midi-settings">
        <h1>Midi Settings</h1>
        <select className="midi-inputs" onChange={this.onMidiInputSelected.bind(this)}>
          <option value="">[Please select input]</option>
          {inputOptions}
        </select>
      </div>
    );
  }
}
