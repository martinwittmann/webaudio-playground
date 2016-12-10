import React from 'react';
import Oscillator from './Oscillator.js';
import ComponentsContainer from './ComponentsContainer.js';
import AudioComponent from './AudioComponent.js';

export default class Column2 extends React.Component {
  render() {
    return (
      <div className="column-content">
        <ComponentsContainer settings={this.props.settings} />
      </div>
    );
  }
}