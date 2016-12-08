import React from 'react';
import MidiSettings from './MidiSettings.js';

export default class Settings extends React.Component {
  render() {
    return (
      <MidiSettings midiInputs={this.props.midiInputs} onMidiInputSelected={this.props.onMidiInputSelected} />
    );
  }
};