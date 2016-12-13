import React from 'react';

export default class MidiKeyboard extends React.Component {
  constructor(props) {
    super(props);
    // TODO: This constructors seems to get called twice when dropping a component
    //       onto the canvas. Since the audioComponent class needs to manually
    //       free elements this is probably a memory leak.

    props.audioComponent.reactComponent = this;
  }

  render() {
    return (
      <div>MidiKeyboard</div>
    );
  }
}
