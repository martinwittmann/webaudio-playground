import React from 'react';

export default class ReactAudioComponentInputs extends React.Component {
  render() {
    //console.log(this);
    let inputs = this.props.inputs.map(input => {
      return (<li key={input.id} title={input.name}></li>)
    });
    return (<ul className="component-inputs">{inputs}</ul>);
  }
}