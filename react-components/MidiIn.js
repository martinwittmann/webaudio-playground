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

  onMidiInChanged(ev) {
    this.props.audioComponent.onMidiInChanged.apply(this.props.audioComponent, [ev.target.value]);

    // Let the event bubble up until app.js.
    this.props.onChildEvent('midiInputChanged', ev.target.value);
    this.setState({
      midiInput: ev.target.value
    });
  }

  render() {
    let midiIns = this.state.midiInputs.map(input => {
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
