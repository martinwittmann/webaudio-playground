import React from 'react';
import InspectorOptionDetails from './InspectorOptionDetails.jsx';

// Import all UI components.
import Select from './ui-components/Select.jsx';
import Radios from './ui-components/Radios.jsx';
import Checkbox from './ui-components/Checkbox.jsx';
import KeyboardOctave from './ui-components/KeyboardOctave.jsx';

export default class InspectorOption extends React.Component {
  constructor(props) {
    super(props);

    // This is probably a bad idea, but it works for now.
    //this.state = props.option;

    this.state = {
      opened: true,
      value: props.option.getValue()
    };

    props.option.registerChangeCallback(this.onSelectChanged.bind(this));
  }

  onSelectChange(newValue) {
    // This is the onChange event of the select dom node.
    // NOTE: We only call the set method of the option. This handles calling all
    //       necessary components.
    this.props.option.setValue(newValue);
  }

  onSelectChanged(newValue) {
    // This is the callback which gets called from option.set().
    this.setState({
      value: newValue
    });
  }

  onNumberChange(ev) {
    this.setState({
      value: ev.target.value
    });
  }

  toggleDetails() {
    this.setState({
      opened: !this.state.opened
    });
  }

  handleChildEvent(type, ...args) {
    switch (type) {
      case 'expose-as-input-changed':
        this.props.emitEvent(type, args[0], this);
        break;
    }
  }

  render() {
    let item;
    let help = false;

    switch (this.props.option.getType()) {
      case 'choice':
        // In the inspector we always show choices as selects.
        item = (
          <Select
            options={this.props.option.getChoices()}
            onChange={this.onSelectChange.bind(this)}
            value={this.state.value}
          />
        );
        break;

      case 'boolean':
        // Shown as checkbox in the inspector.
        item = (
          <Checkbox
            label={this.props.option.label}
            onChange={this.onCheckboxtChange.bind(this)}
            value={this.state.value}
          />
        );
        break;

      case 'number':
        item = (
          <input
            type="number"
            min={this.props.option.range[0]}
            max={this.props.option.range[1]}
            step="0.01"
            onChange={this.onNumberChange.bind(this)}
            value={this.state.value}
          />
        );
        help = (
          <span className="input-help">[{this.props.option.range[0]}-{this.props.option.range[1]}]</span>
        );
        break;
    }

    let cls = ['component-option'];
    cls.push(this.state.opened ? 'opened' : 'closed');

    return (
      <div className={cls.join(' ')}>
        <a
          className="component-option-label"
          onClick={this.toggleDetails.bind(this)}
        >{this.props.option.label}:</a>
        <div className="component-option-item">
          {item}
        </div>
        <div className="component-help">{help}</div>
        <InspectorOptionDetails
          option={this.props.option}
          component={this.props.component}
          emitEventToOption={this.handleChildEvent.bind(this)}
        />
      </div>
    );
  }
}