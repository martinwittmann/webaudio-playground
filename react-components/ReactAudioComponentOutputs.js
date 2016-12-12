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

  onMouseEnter(ev) {
    if (ev.target.className.match(/connectable/)) {
      ev.target.className += ' hover';
    }
  }

  onMouseLeave(ev) {
    if (ev.target.className.match(/hover/)) {
      ev.target.className = ev.target.className.replace(/\shover/, '');
    }
  }

  render() {
    let outputs = this.props.outputs.map((output, index) => {
      let cls = ['io', output.ioType, output.type];
      if (output.id == this.state.activeIO) {
        cls.push('connecting');
      }

      if (this.props.connectableIos && this.props.connectableIos.type && this.props.connectableIos.ioType) {
        if (output.type == this.props.connectableIos.type && output.ioType == this.props.connectableIos.ioType) {
          cls.push('connectable');
        }
      }

      return (<li
        key={output.id}
        title={output.name}
        id={output.id}
        className={cls.join(' ')}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        data-io-index={index}
      ></li>)
    });
    return (<ul className="component-io component-outputs">{outputs}</ul>);
  }
}