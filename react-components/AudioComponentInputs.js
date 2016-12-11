import React from 'react';

export default class AudioComponentInputs extends React.Component {
  render() {
    let inputs = this.props.inputs.map(input => {
      return (<li key={input.id} title={input.name}></li>)
    });
    return (<ul className="component-inputs">{inputs}</ul>);
  }
}