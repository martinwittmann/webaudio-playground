import React from 'react';

export default class Select extends React.Component {
  onChange(ev) {
    if ('undefined' != typeof this.props.onChange) {
      this.props.onChange(ev.target.value);
    }
  }

  render() {
    let value = this.props.defaultValue;
    let options = this.props.options.map(option => {
      return (<option key={option.value} value={option.value}>{option.name}</option>);
    });
    return (
      <select className={this.props.className} value={this.props.value} onChange={this.onChange.bind(this)}>
      {options}
      </select>
    );
  }
}