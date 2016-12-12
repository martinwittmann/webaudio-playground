import React from 'react';

export default class ReactAudioComponentOutputs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIO: false
    };
  }

  onMouseDown(ev) {
    this.props.handleEvent('start-connecting', ev, this, this.props.outputs[ev.target.dataset.ioIndex]);
    this.setState({
      activeIO: ev.target.id,
    });
  }

  onMouseUp(ev) {
    this.props.handleEvent('stop-connecting', ev);
    this.setState({
      activeIO: false
    });
  }

  render() {
    let outputs = this.props.outputs.map((output, index) => {
      let cls = ['io', output.ioType, output.type];
      if (output.id == this.state.activeIO) {
        cls.push('connecting');
      }

      return (<li
        key={output.id}
        title={output.name}
        id={output.id}
        className={cls.join(' ')}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        data-io-index={index}
      ></li>)
    });
    return (<ul className="component-io component-outputs">{outputs}</ul>);
  }
}