import React from 'react';

export default class ReactAudioComponentInputs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIO: false,
      connectable: false,
      connected: false
    };
  }

  onMouseDown(ev) {
    this.props.handleEvent('start-connecting', ev, this, this.props.inputs[ev.target.dataset.ioIndex]);
    this.setState({
      activeIO: ev.target.id
    });
    ev.preventDefault();
  }

  onMouseUp(ev) {
    if (this.state.connectable) {
      // This should not be neede anymore since we're creating the connection in
      // ComponentsContainer within the snapping logic.

      // Finish creating the connection.
      //let input = this.props.inputs[ev.target.dataset.ioIndex];
      //this.props.handleEvent('create-connection', input, this);
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
      let connectable = false; // Only while starting a connection: whether or not the connection can be made with this io.
      let cls = ['io', input.ioType, input.type];
      if (input.id == this.state.activeIO || this.isSnapped) {
        cls.push('connecting');
      }

      if (this.props.connectableIos && this.props.connectableIos.type && this.props.connectableIos.ioType) {
        if (input.type == this.props.connectableIos.type && input.ioType == this.props.connectableIos.ioType) {
          cls.push('connectable');
          connectable = true;
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
            let rect = el.getBoundingClientRect();
            // We can't store the DOMrect directly since we need to change these
            // values if a component gets dragged around.
            this.coordinates = {
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              left: rect.left
            };
            if (connectable) {
              this.props.container.connectableIos[input.id] = {
                io: input,
                ioComponent: this,
                reactAudioComponent: this.props.reactAudioComponent,
                left: rect.left,
                top: rect.top
              };
            }
          }
        }}
      ></li>)
    });
    return (<ul className="component-io component-inputs">{inputs}</ul>);
  }
}