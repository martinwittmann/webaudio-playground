import React from 'react';

export default class ReactAudioComponentOutputs extends React.Component {
  onMouseDown(ev) {
    this.props.handleEvent('start-connecting', ev);
  }

  onMouseUp(ev) {
    this.props.handleEvent('stop-connecting', ev);
  }

  render() {
    let outputs = this.props.outputs.map(output => {
      return (<li
        key={output.id}
        title={output.id}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
      ></li>)
    });
    return (<ul className="component-outputs">{outputs}</ul>);
  }
}