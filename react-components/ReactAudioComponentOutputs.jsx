import React from 'react';

export default class ReactAudioComponentOutputs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIO: false,
      connectable: false,
      connected: false
    };

    this.coordinates = {};
  }

  onMouseDown(ev) {
    this.props.handleEvent('start-connecting', ev, this, this.props.outputs[ev.target.dataset.ioIndex]);
    this.setState({
      activeIO: ev.target.id,
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
    let outputs = this.props.outputs.map((output, index) => {
      let connectable = false; // Only while starting a connection: whether or not the connection can be made with this io.
      let cls = ['io', output.ioType, output.type];
      if (output.id == this.state.activeIO || this.isSnapped) {
        cls.push('connecting');
      }

      if (this.props.connectableIos && this.props.connectableIos.type && this.props.connectableIos.ioType) {
        if (output.type == this.props.connectableIos.type && output.ioType == this.props.connectableIos.ioType) {
          cls.push('connectable');
          connectable = true;
        }
      }

      if (this.state.connected) {
        cls.push('connected');
      }

      return (<li
        key={output.id}
        title={output.name}
        id={output.id}
        className={cls.join(' ')}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        data-io-index={index}
        ref={(el) => {
          if (el) {
            let rect = el.getBoundingClientRect();
            // We can't store the DOMrect directly since we need to change these
            // values if a component gets dragged around.

            this.coordinates[output.id] = {
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              left: rect.left
            };
            console.log(rect);

            if (connectable) {
              this.props.container.connectableIos[output.id] = {
                io: output,
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
    return (<ul className="component-io component-outputs">{outputs}</ul>);
  }
}