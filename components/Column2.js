import React from 'react';
import Oscillator from './Oscillator.js';
import ComponentsContainer from './ComponentsContainer.js';

export default class Column2 extends React.Component {
  renderAudioComponent(component) {
    switch (component.reactComponent) {
      case 'Oscillator':
        return (<li key={component.id}><Oscillator audioComponent={component} onChildEvent={component.onChildEvent.bind(component)} /></li>);

      default:
        this.debug('No corresponding reactComponent was found for component ' + component.type);
        return false;
    }
  }

  render() {
    let listContent = this.props.settings.column2.components.map(component => {
      return this.renderAudioComponent(component);
    });
    return (
      <div className="column-content">
        <ComponentsContainer />
      </div>
    );
  }
}