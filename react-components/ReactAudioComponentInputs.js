import React from 'react';

export default class ReactAudioComponentInputs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIO: false,
      connectable: false,
      canvasSelector: props.canvasSelector,
      connected: false
    };
  }

  onMouseDown(ev) {
    this.props.handleEvent('start-connecting', ev, this, this.props.inputs[ev.target.dataset.ioIndex]);
    this.setState({
      activeIO: ev.target.id
    });
  }

  onMouseUp(ev) {
    if (this.state.connectable) {
      // Finish creating the connection.
      let input = this.props.inputs[ev.target.dataset.ioIndex];
      this.props.handleEvent('create-connection', input, this);
    }
    else {
      this.props.handleEvent('stop-connecting', ev);
    }

    this.setState({
      activeIO: false,
      connectable: false
    });
  }

  onMouseEnter(ev) {
    if (ev.target.className.match(/connectable/)) {
      ev.target.className += ' hover';
      this.setState({
        connectable: true
      });
    }
  }

  onMouseLeave(ev) {
    ev.target.className = ev.target.className.replace(/\s?hover/, '');
    this.setState({
      connectable: false
    });
  }

  render() {
    let inputs = this.props.inputs.map((input, index) => {
      let cls = ['io', input.ioType, input.type];
      if (input.id == this.state.activeIO) {
        cls.push('connecting');
      }

      if (this.props.connectableIos && this.props.connectableIos.type && this.props.connectableIos.ioType) {
        if (input.type == this.props.connectableIos.type && input.ioType == this.props.connectableIos.ioType) {
          cls.push('connectable');
        }
      }

      if (this.state.connected) {
        cls.push('connected');
      }

      return (<li
        key={input.id}
        title={input.name}
        id={input.id}
        className={cls.join(' ')}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        data-io-index={index}
        ref={(el) => {
          if (el) {
            this.coordinates = el.getBoundingClientRect();
          }
        }}
      ></li>)
    });
    return (<ul className="component-io component-inputs">{inputs}</ul>);
  }
}