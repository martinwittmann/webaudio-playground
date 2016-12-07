import React from 'react';
import MidiSettings from './MidiSettings.js';

export default class App extends React.Component {

  constructor() {
    super();
    this.state = {
      midiAccess: false,
      midiInputs: [],
      components: {},
      midiInputs: []
    };

    // This feels like a hack to me, but I couldn't find a better solution yet.
    this.onMidiAvailable = this.onMidiAvailable.bind(this);
    this.onNoMidi = this.onNoMidi.bind(this);

    navigator.requestMIDIAccess().then(this.onMidiAvailable, this.onNoMidi);
  }

  onMidiAvailable(midiAccess) {
    let midiInputs = [];

    for (let input of midiAccess.inputs) {
      midiInputs.push({
        id: input[1].id,
        name: input[1].name,
        manufacturer: input[1].manufacturer,
      });
    }

    this.setState({
      midiAccess,
      midiInputs
    });
  }

  onNoMidi(msg) {
    console.log('No midi available: ' + msg);
  }

  render() {
    return (
      <MidiSettings midiInputs={this.state.midiInputs} />
    );
  }
};