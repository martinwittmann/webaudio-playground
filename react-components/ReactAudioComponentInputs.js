import React from 'react';

export default class ReactAudioComponentInputs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIO: false
    };
  }

  onMouseDown(ev) {
    this.props.handleEvent('start-connecting', ev, this, this.props.inputs[ev.target.dataset.ioIndex]);
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
    let inputs = this.props.inputs.map((input, index) => {
      let cls = ['io', input.ioType, input.type];
      if (input.id == this.state.activeIO) {
        cls.push('connecting');
      }

      return (<li
        key={input.id}
        title={input.name}
        id={input.id}
        className={cls.join(' ')}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        data-io-index={index}
      ></li>)
    });
    return (<ul className="component-io component-inputs">{inputs}</ul>);
  }
}