import React from 'react';
import Settings from './Settings.js';
import InspectorColumn from './InspectorColumn.js';
import Column2 from './Column2.js';
import Column3 from './Column3.js';
import Column4 from './Column4.js';

import Oscillator from './Oscillator.js';

export default class ColumnLayout extends React.Component {
  handleChildEvent(type) {
    this.props.handleChildEvent(type);
  }
  render() {
    return (
      <ul className="column-layout">
        <li className="column column-1">
          <Settings midiInputs={this.props.settings.midiInputs} onMidiInputSelected={this.props.settings.onMidiInputSelected} />
          <InspectorColumn handleEvent={this.handleChildEvent.bind(this)} />
        </li>
        <li className="column column-2">
          <Column2 settings={this.props.settings.column2} />
        </li>
        <li className="column column-3">
          <Column3 settings={this.props.settings.column3} />
        </li>
        <li className="column column-4">
          <Column4 settings={this.props.settings.column4} />
        </li>
      </ul>
    );
  }
}