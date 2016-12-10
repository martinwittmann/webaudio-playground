import React from 'react';
import Oscillator from './Oscillator.js';
import ComponentsContainer from './ComponentsContainer.js';
import AudioComponent from './AudioComponent.js';

export default class Column2 extends React.Component {
  render() {
    /*
    let listContent = this.props.settings.components.map(component => {
      return (<AudioComponent component={component} />);
    });
    */
    return (
      <div className="column-content">
        <ComponentsContainer />
      </div>
    );
  }
}