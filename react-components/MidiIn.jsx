import React from 'react';

export default class MidiIn extends React.Component {
  constructor(props) {
    super(props);
    // TODO: This constructors seems to get called twice when dropping a component
    //       onto the canvas. Since the audioComponent class needs to manually
    //       free elements this is probably a memory leak.

    props.audioComponent.reactComponent = this;
    
    this.state = {
      inputs: [],
      midiIn: props.audioComponent.state.midiIn,
      midiInputs: props.audioComponent.getMidiInputs()
    };
  }

  onMidiInChanged(ev) {
    this.props.audioComponent.onMidiInChanged(ev.target.value);
  }

  onClickSelect(ev) {
    ev.stopPropagation();
  }

  render() {
    let midiIns = this.state.midiInputs.map(input => {
      return (<option key={input.value} value={input.value}>{input.name}</option>);
    });

    return (
      <select
        onChange={this.onMidiInChanged.bind(this)}
        onClick={this.onClickSelect.bind(this)}
        defaultValue={this.state.midiIn}
      >
        <option value="">[Please select input]</option>
        {midiIns}
      </select>
    );
  }
}
