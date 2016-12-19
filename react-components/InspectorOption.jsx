import React from 'react';
import Select from './Select.jsx';
import InspectorOptionDetails from './InspectorOptionDetails.jsx';

export default class InspectorOption extends React.Component {
  constructor(props) {
    super(props);

    this.state = props.option;
    this.state.opened = true;
  }

  handleEvent(type, args) {}

  onSelectChange(newValue) {
    // What to do here?
  }

  onNumberChange(ev) {
    this.setState({
      value: ev.target.value
    });
  }

  showOnCanvasUiChanged(ev) {

  }

  showOnUserUiChanged(ev) {

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
          emitEventToOption={this.handleChildEvent.bind(this)}
        />
      </div>
    );
  }
}