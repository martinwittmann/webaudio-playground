import React from 'react';

export default class MidiSettings extends React.Component {
  render() {
    let inputOptions = this.props.midiInputs.map((input) => {
      return (<option key={input.id} value={input.id}>{input.name}</option>);
    });

    return (
      <div className="midi-settings">
        <h1>Midi Settings</h1>
        <select className="midi-inputs">
          <option value="">[Please select input]</option>
          {inputOptions}
        </select>
      </div>
    );
  }
}
