import React from 'react';

export default class FilterInput extends React.Component {
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
      <div className={this.props.className}>
      </div>
    );
  }
}