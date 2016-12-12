import React from 'react';

export default class MidiIn extends React.Component {
  constructor(props) {
    super(props);
    props.audioComponent.reactComponent = this;
    
    this.state = {
      inputs: [],
      midiInputs: props.audioComponent.getMidiInputs()
    };
  }

  render() {
    let midiIns = this.state.midiInputs.map(input => {
      return (<option key={input.value} value={input.value}>{input.name}</option>);
    });

    return (
      <select onChange={this.props.audioComponent.onMidiInChanged.bind(this.props.audioComponent)}>
        <option value="">[Please select input]</option>
        {midiIns}
      </select>
    );
  }
}
