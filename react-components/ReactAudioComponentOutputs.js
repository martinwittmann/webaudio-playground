import React from 'react';

export default class ReactAudioComponentOutputs extends React.Component {
  render() {
    let outputs = this.props.outputs.map(output => {
      return (<li key={output.id} title={output.id}>output</li>)
    });
    return (<ul className="component-outputs">{outputs}</ul>);
  }
}