import React from 'react';

export default class Radios extends React.Component {
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

  render() {
    let value = this.props.defaultValue;
    let radios = this.props.options.map(option => {
      return (
        <li
          key={option.value}
        >
          <input type="radio"
            id={this.props.option.id + '--' + option.value}
            name={this.props.option.id}
            value={option.value}
            defaultChecked={option.value == this.props.value}
            onChange={this.onChange.bind(this)}
          />
          <label
            htmlFor={this.props.option.id + '--' + option.value}
          >
            {option.name}
          </label>
        </li>
      );
    });
    return (
      <ul
        className={'radio-list ' + this.props.className}
        value={this.props.value}
      >
      {radios}
      </ul>
    );
  }
}