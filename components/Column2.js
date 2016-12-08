import React from 'react';
import Oscillator from './Oscillator.js';

export default class Column2 extends React.Component {
  renderAudioComponent(component) {
    switch (component.reactComponent) {
      case 'Oscillator':
        return (<li key={component.id}><Oscillator audioComponent={component} onWaveformChanged={component.onWaveformChanged.bind(component)} /></li>);

      default:
        this.debug('No corresponding reactComponent was found for component ' + component.type);
        return false;
    }
  }

  render() {
    let listContent = this.props.settings.components.map(component => {
      return this.renderAudioComponent(component);
    });
    return (
      <div className="column-content">
        <h2>Column2</h2>
        <ul className="column-content-list">
          {listContent}
        </ul>
      </div>
    );
  }
}