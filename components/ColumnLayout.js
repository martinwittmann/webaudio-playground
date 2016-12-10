import React from 'react';
import Settings from './Settings.js';
import InspectorColumn from './InspectorColumn.js';
import Column2 from './Column2.js';
import ComponentsAvailable from './ComponentsAvailable.js';

import Oscillator from './Oscillator.js';

export default class ColumnLayout extends React.Component {
  handleChildEvent(type) {
    this.props.handleChildEvent(type);
  }
  render() {
    return (
      <ul className="column-layout">
        <li className="column column-1">
          <ComponentsAvailable />
          <InspectorColumn handleEvent={this.handleChildEvent.bind(this)} />
        </li>
        <li className="column column-2">
          <Column2 settings={this.props.settings} />
        </li>
      </ul>
    );
  }
}
