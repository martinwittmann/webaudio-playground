import React from 'react';

export default class Select extends React.Component {
  onChange(ev) {
    // This is needed for the onChange in the inspector.
    if ('undefined' != typeof this.props.onChange) {
      this.props.onChange(ev.target.value);
    }

    // This is needed for onChange when displayed inside a component.
    if(this.props.option && this.props.option.onChange) {
      this.props.option.onChange(ev.target.value);
    }
  }

  onClick(ev) {
    ev.stopPropagation();
  }

  render() {
    let value = this.props.defaultValue;
    let options = this.props.options.map(option => {
      return (<option key={option.value} value={option.value}>{option.name}</option>);
    });
    return (
      <select
        className={this.props.className}
        value={this.props.value}
        onChange={this.onChange.bind(this)}
        onClick={this.onClick.bind(this)}
      >
      {options}
      </select>
    );
  }
}