import React from 'react';

export default class ReactAudioComponentIos extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeIO: false,
      connectable: false,
      connected: false
    };

    props.reactAudioComponent.childComponents[props.ioType] = this;
    this.coordinates = {};
  }

  onMouseDown(ev) {
    ev.preventDefault();
    this.props.handleEvent('start-connecting', this.props.ios[ev.target.dataset.ioIndex]);
    
    this.setState({
      activeIO: ev.target.id
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

  updateAllIoCoordinates() {
    this.props.ios.map(io => {
      if (io.domNode) {
        io.coordinates = this.getIoClientRect(io.domNode);
      }
      else {
        console.log('updateAllIoCoordinates(): Could not find domNode for io ' + io.id);
      }
    });
  }

  getIoClientRect(domNode) {
    if (!domNode || !domNode.getBoundingClientRect) {
      return false;
    }
    let rect = domNode.getBoundingClientRect();
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left
    };
  }

  render() {
    let ioType;
    let ios = this.props.ios.map((io, index) => {
      io.reactComponent = this;
      let cls = ['io', io.ioType, io.dataType];
      ioType = io.ioType;
      if (io.id == this.state.activeIO || io.id == io.isSnapped) {
        cls.push('connecting');
      }

      if (this.state.connected) {
        cls.push('connected');
      }

      return (<li
        key={io.id}
        title={io.name}
        id={io.id}
        className={cls.join(' ')}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        data-io-index={index}
        ref={(el) => {
          if (el) {
            io.domNode = el;
            io.coordinates = this.getIoClientRect(el);
          }
        }}
      ></li>)
    });
    let cls = ['component-io', 'component-' + ioType + 's'];
    return (
      <ul className={cls.join(' ')}>
        {ios}
      </ul>
    );
  }
}