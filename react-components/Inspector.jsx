import React from 'react';
import InspectorOption from './InspectorOption.jsx';

export default class Inspector extends React.Component {
  constructor(props) {
    super(props);
  }

  handleEvent(type, ...args) {
  }

  render() {
    let selection = this.props.selection;
    let options;

    if (!selection) {
       options = 'Select a component to edit it\'s options.';
    }
    else {
      let component = selection.props.component;
      options = component.options.getOptions().map(option => {
        return (
          <li key={option.id}>
            <InspectorOption
              option={option}
              component={component}
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