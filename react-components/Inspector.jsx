import React from 'react';
import InspectorOption from './InspectorOption.jsx';

export default class Inspector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedComponent: props.selectedComponent
    };
    console.log('2: ' + props.selectedComponent.title);
    //console.log(this.state.selectedComponent);

    if (props.selectedComponent) {
      this.state.options = props.selectedComponent.options;
    }
  }

  componentWillMount() {
    if (this.state.options) {
      this.state.options.map(option => {
        option.registerConditionChangedCallback(this.optionConditionChanged, this);
      });
    }
  }

  optionConditionChanged() {
    // Rerender all options if an option's conditions have changed.
    this.forceUpdate();
  }

  render() {
    //console.log(this.state.selectedComponent.title);
    let options;
    //if (!Array.isArray(this.state.options)) {
    if (!this.state.selectedComponent) {
       options = 'Select a component to edit it\'s options.';
    }
    else {
      options = this.state.options.map(option => {
        if (!option.conditionsAreMet()) {
          return false;
        }

        return (
          <li key={option.id}>
            <InspectorOption
              option={option}
              component={this.state.selectedComponent}
            />
          </li>
        );
      });      
    }

    return (
      <div className="inspector">
        <h3>{this.state.selectedComponent.title}</h3>
        <ul className="component-options">
          {options}
        </ul>
      </div>
    );
  }
}