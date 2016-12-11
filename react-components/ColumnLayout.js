import React from 'react';
import Settings from './Settings.js';
import Inspector from './Inspector.js';
import Column2 from './Column2.js';
import ComponentsAvailable from './ComponentsAvailable.js';

// Drag & drop stuff.
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

// All React components corresponding to audio components.
import Oscillator from './Oscillator.js';


class ColumnLayout extends React.Component {
  handleEvent(type) {
    this.props.settings.handleEvent(type);
  }
  render() {
    return (
      <ul className="column-layout">
        <li className="column column-1">
          <ComponentsAvailable components={this.props.settings.componentsAvailable} />
          <Inspector handleEvent={this.handleEvent.bind(this)} />
        </li>
        <li className="column column-2">
          <Column2 settings={this.props.settings} />
        </li>
      </ul>
    );
  }
}

export default DragDropContext(HTML5Backend)(ColumnLayout);