import React from 'react';
import InspectorOptionDetails from './InspectorOptionDetails.jsx';

// Import all UI components.
import Checkbox from './ui-components/Checkbox.jsx';
import KeyboardOctave from './ui-components/KeyboardOctave.jsx';
import NumberInput from './ui-components/NumberInput.jsx';
import Radios from './ui-components/Radios.jsx';
import Select from './ui-components/Select.jsx';

export default class InspectorOption extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opened: true,
      value: props.option.getValue()
    };
  }

  componentWillMount() {
    this.props.option.registerChangeCallback(this.onSelectChanged, this);
  }

  componentWillUnmount() {
    this.props.option.unregisterChangeCallback(this.onSelectChanged);
  }

  onChange(newValue) {
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
            onChange={this.onChange.bind(this)}
            value={this.state.value}
          />
        );
        break;

      case 'boolean':
        // Shown as checkbox in the inspector.
        item = (
          <Checkbox
            label={this.props.option.label}
            onChange={this.onChange.bind(this)}
            value={this.state.value}
          />
        );
        break;

      case 'number':
        item = (
          <NumberInput
            defaultValue={this.props.option.value}
            onChange={this.onChange.bind(this)}
            min={this.props.option.range[0]}
            max={this.props.option.range[1]}
            step={this.props.option.stepSize}
            onChange={this.onChange.bind(this)}
          />
        );
        help = (
          <span className="input-help">[{this.props.option.range[0]}-{this.props.option.range[1]}]</span>
        );
        break;

      case 'none':
      case 'keyboard':
        // We allow setting options to type none if the only thing a user can do
        // is to toggle the option detail settings.
        item = false;
        break;

      default:
        console.log('InspectorOption::render(): unknown option type ' + this.props.option.getType());
        return false;
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