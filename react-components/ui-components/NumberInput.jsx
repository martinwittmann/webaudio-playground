import React from 'react';

export default class NumberInput extends React.Component {
  onChange(ev) {
    if ('function' == typeof this.props.onChange) {
      this.props.onChange(ev.target.value, this.props.option);
    }
  }

  onClick(ev) {
    ev.stopPropagation();
  }

  render() {
    return (
      <input
        type="number"
        min={this.props.min}
        max={this.props.max}
        step={this.props.stepSize}
        value={this.props.defaultValue}
        onChange={this.onChange.bind(this)}
        onClick={this.onClick.bind(this)}
      />
    );
  }
}