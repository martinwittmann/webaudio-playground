import React from 'react';
import AudioComponent from './AudioComponent.js';

export default class ComponentsAvailable extends React.Component {
  render() {
    let components = this.props.components.map(component => {
      return (<li key={component.id}><AudioComponent component={component} /></li>);
    });
    return (
      <ul className="components-available">
        <li key="headline">Available components:</li>
        {components}
      </ul>
    );
  }
}