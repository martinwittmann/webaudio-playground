import React from 'react';
import KeyboardOctave from './KeyboardOctave.js';

export default class MidiKeyboard extends React.Component {
  constructor(props) {
    super(props);
    // TODO: This constructors seems to get called twice when dropping a component
    //       onto the canvas. Since the audioComponent class needs to manually
    //       free elements this is probably a memory leak.

    props.audioComponent.reactComponent = this;
  }

  handleEvent(type, noteValue) {
    switch (type) {
      case 'note-on':
        this.props.audioComponent.createAndSendMidiMessage('note-on', noteValue);
        break;

      case 'note-off':
        this.props.audioComponent.createAndSendMidiMessage('note-off', noteValue);
        break;
    }
  }

  render() {
    // This should be the c'.
    return (
      <div className="keyboard-content octaves-2">
        <KeyboardOctave startNote={60} emitEvent={this.handleEvent.bind(this)} />
        <KeyboardOctave startNote={72} emitEvent={this.handleEvent.bind(this)} />
      </div>);
  }
}
