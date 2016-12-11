import React from 'react';

export default class MidiIn extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  onMidiInChanged(value) {
    this.props.onChildEvent('midiInputChanged', value);
    this.setState({
      midiInput: value
    });
  }

  render() {
    let midiIns = this.props.audioComponent.getMidiInputs().map(input => {
      return (<option key={input.value} value={input.value}>{input.name}</option>);
    });

    return (
      <select onChange={this.onMidiInChanged.bind(this)}>
        <option value="">[Please select input]</option>
        {midiIns}
      </select>
    );
  }
}
