import React from 'react';

export default class Inspector extends React.Component {
  addOsc(e) {
    this.props.handleEvent('add-oscillator');
  }
  render() {
    return (
      <div className="inspector">
        <button className="add-osc" onClick={this.addOsc.bind(this)}>Add Osc</button>
      </div>
    );
  }
}