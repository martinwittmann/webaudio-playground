import React from 'react';
import ReactAudioComponent from './ReactAudioComponent.js';

export default class ComponentsAvailable extends React.Component {
  render() {
    let components = this.props.components.componentsAvailable.map(component => {
      return (<li key={component.id}><ReactAudioComponent component={component} inSidebar /></li>);
    });
    return (
      <ul className="components-available">
        <li key="headline">Available components:</li>
        {components}
      </ul>
    );
  }
}