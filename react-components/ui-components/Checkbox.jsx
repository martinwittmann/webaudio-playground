import React from 'react';

export default class Checkbox extends React.Component {
  onChange(ev) {
    if ('function' == typeof this.props.onChange) {
      this.props.onChange(ev.target.value, this.props.option);
    }
  }

  render() {
    return (
      <input
        type="checkbox"
        className={this.props.className}
        checked={this.props.checked}
        onChange={this.onChange.bind(this)}
      />
    );
  }
}