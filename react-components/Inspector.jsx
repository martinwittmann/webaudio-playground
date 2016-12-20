import React from 'react';
import InspectorOption from './InspectorOption.jsx';

export default class Inspector extends React.Component {
  constructor(props) {
    super(props);
  }

  handleEvent(type, ...args) {
    switch (type) {
      case 'expose-as-input-changed':
        this.props.emitEvent(type, args[0], args[1]);
        break;

      case 'expose-to-canvas-ui-changed':
        this.props.emitEvent(type, args[0], args[1]);
        break;

      case 'expose-to-user-ui-changed':
        this.props.emitEvent(type, args[0], args[1]);
        break;
    }
  }

  render() {
    let selection = this.props.selection;
    let options;

    if (!selection) {
       options = 'Select a component to edit it\'s options.';
    }
    else {
      let reactComponent = selection.props.component;
      options = reactComponent.options.map(option => {
        return (
          <li key={option.id}>
            <InspectorOption
              option={option}
              component={reactComponent}
              emitEvent={this.handleEvent.bind(this)}
            />
          </li>
        );
      });      
    }

    return (
      <div className="inspector">
        <ul className="component-options">
          {options}
        </ul>
      </div>
    );
  }
}