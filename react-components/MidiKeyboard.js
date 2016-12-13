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

  render() {
    // This should be the c'.
    return (
      <div className="keyboard-content octaves-2">
        <KeyboardOctave startNote={60} />
        <KeyboardOctave startNote={72} />
      </div>);
  }
}
