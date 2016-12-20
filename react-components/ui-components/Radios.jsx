import React from 'react';

export default class Radios extends React.Component {
  onChange(ev) {
    if ('undefined' != typeof this.props.onChange) {
      this.props.onChange(ev.target.value);
    }
  }

  render() {
    let value = this.props.defaultValue;
    let radios = this.props.options.map(option => {
      return (
        <radio
          key={option.value}
          value={option.value}
          label={option.name}
        />
      );
    });
    return (
      <radiogroup
        className={this.props.className}
        value={this.props.value}
        onChange={this.onChange.bind(this)}
      >
      {radios}
      </radiogroup>
    );
  }
}