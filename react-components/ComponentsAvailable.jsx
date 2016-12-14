import React from 'react';
import ReactAudioComponent from './ReactAudioComponent.jsx';

export default class ComponentsAvailable extends React.Component {
  render() {
    let components = this.props.settings.componentsAvailable.map(component => {
      return (
        <li key={component.id}>
          <ReactAudioComponent
            component={component}
            settings={this.props.settings}
            inSidebar
          /></li>);
    });
    return (
      <ul className="components-available">
        <li key="headline">Available components:</li>
        {components}
      </ul>
    );
  }
}