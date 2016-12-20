import React from 'react';

export default class Checkbox extends React.Component {
  onChange(ev) {
    if ('undefined' != typeof this.props.onChange) {
      this.props.onChange(ev.target.value);
    }
    
    // This is needed for setValue when displayed inside a component.
    if(this.props.option && this.props.option.setValue) {
      this.props.option.setValue(ev.target.value);
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