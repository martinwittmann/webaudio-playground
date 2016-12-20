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
    this.state = props.option;
    this.state.opened = true;
  }

  onSelectChange(newValue) {
    // What to do here?
    // - Update the corresponding value in the audio component class.
    this.props.option.onChange(newValue);

    this.props.component.waveform = newValue;

    this.props.component.reactComponent.setState({
      waveform: newValue
    });

    this.setState({
      waveform: newValue
    });
  }

  onNumberChange(ev) {
    this.setState({
      value: ev.target.value
    });
  }

  getChoices(option) {
    if ('function' == typeof option.choices) {
      return option.choices();
    }
    else if (Array.isArray(option.choices)) {
      return option.choices;
    }
    else {
      console.log('InspectorOption::getChoices: called with invalid type: ' + typeof option.choices + '.');
      return false;
    }
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

    switch (this.state.type) {
      case 'choice':
        // In the inspector we always show choices as selects.
        item = (
          <Select
            options={this.getChoices(this.state)}
            onChange={this.onSelectChange.bind(this)}
            value={this.props.component.waveform}
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
            min={this.state.range[0]}
            max={this.state.range[1]}
            step="0.01"
            onChange={this.onNumberChange.bind(this)}
            value={this.state.value}
          />
        );
        help = (
          <span className="input-help">[{this.state.range[0]}-{this.state.range[1]}]</span>
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
        >{this.state.label}:</a>
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