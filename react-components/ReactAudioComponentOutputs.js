import React from 'react';

export default class ReactAudioComponentOutputs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIO: false
    };
  }
  onMouseDown(ev) {
    this.props.handleEvent('start-connecting', ev, this);
    this.setState({
      activeIO: ev.target.id
    });
  }

  onMouseUp(ev) {
    this.props.handleEvent('stop-connecting', ev);
    this.setState({
      activeIO: false
    });
  }

  render() {
    let outputs = this.props.outputs.map(output => {
      return (<li
        key={output.id}
        title={output.name}
        id={output.id}
        className={output.id == this.state.activeIO ? 'connecting' : ''}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
      ></li>)
    });
    return (<ul className="component-outputs">{outputs}</ul>);
  }
}