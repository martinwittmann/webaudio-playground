import React from 'react';

export default class Midi2Frequency extends React.Component {
  constructor(props) {
    super(props);
    // TODO: This constructor seems to get called twice when dropping a component
    //       onto the canvas. Since the audioComponent class needs to manually
    //       free elements this is probably a memory leak.

    props.audioComponent.reactComponent = this;
    
    this.state = {
      inputs: props.audioComponent.getInputs(),
      outputs: props.audioComponent.getOutputs(),
    };
  }

  render() {

    return (
      <div>No settings yet.</div>
    );
  }
}
