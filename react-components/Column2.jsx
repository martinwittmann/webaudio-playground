import React from 'react';
import Oscillator from './Oscillator.jsx';
import ComponentsContainer from './ComponentsContainer.jsx';
import ReactAudioComponent from './ReactAudioComponent.jsx';

export default class Column2 extends React.Component {
  render() {
    return (
      <div className="column-content">
        <ComponentsContainer settings={this.props.settings} />
      </div>
    );
  }
}