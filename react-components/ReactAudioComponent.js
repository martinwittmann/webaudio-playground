import React from 'react';

import ReactAudioComponentInputs from './ReactAudioComponentInputs.js';
import ReactAudioComponentOutputs from './ReactAudioComponentOutputs.js';

// React components for our audio components.
import Oscillator from './Oscillator.js';
import MidiIn from './MidiIn.js';
import Midi2Frequency from './Midi2Frequency.js';
import MidiKeyboard from './MidiKeyboard.js';

export default class ReactAudioComponent extends React.Component {
  constructor(props) {
    super(props);
    props.component.reactContainerComponent = this;

    this.state = {
      inputs: props.component.getInputs(),
      outputs: props.component.getOutputs(),
      canvasPos: {
        x: props.component.state.canvasPos.x,
        y: props.component.state.canvasPos.y
      },
      canBeDragged: true,
      connectableIos: props.connectableIos
    };
  }

  handleChildEvent(type, ...args) {
    let outputData, ev;
    switch (type) {
      case 'start-connecting':
        ev = args[0];
        ev.preventDefault();
        outputData = this.parseOutputIdAttribute(ev.target.getAttribute('id'));

        this.setState({
          canBeDragged: false
        });
        
        let sourceIoComponent = args[1];
        let io = args[2];
        this.props.emitEvent('start-connecting', this, sourceIoComponent, io);
        break;

      case 'create-connection':
        this.props.emitEvent('create-connection', this, args[0]);
        break;

      case 'stop-connecting':
        ev = args[0];
        ev.preventDefault();

        this.setState({
          canBeDragged: true
        });
        this.props.emitEvent('stop-connecting');
    }
  }

  parseOutputIdAttribute(id) {
    let parts = id.split('--');

    return {
      componentId: parts[0],
      outputId: parts[1].match(/\d+$/).pop()
    }
  }

  onDragStart(ev) {
    ev.dataTransfer.setData('id', this.props.component.id);
    ev.dataTransfer.setData('dragStartX', ev.pageX);
    ev.dataTransfer.setData('dragStartY', ev.pageY);
    // We need to save this as number because otherwise false becomes 'false'
    // which makes parsing the values complicated. Se we work around this by
    // casting to number.
    ev.dataTransfer.setData('onCanvas', this.props.component.inSidebar ? 0 : 1);
  }

  render() {
    const { connectDragSource, isDragging } = this.props;
    let component;
    switch (this.props.component.reactComponentType) {
      case 'Oscillator':
        component = (<Oscillator
          audioComponent={this.props.component}
          onChildEvent={this.props.component.onChildEvent.bind(this.props.component)}
        />);
        break;

      case 'MidiIn':
        component = (<MidiIn
          audioComponent={this.props.component}
          onChildEvent={this.props.component.onChildEvent.bind(this.props.component)}
        />);
        break;

      case 'Midi2Frequency':
        component = (<Midi2Frequency
          audioComponent={this.props.component}
          onChildEvent={this.props.component.onChildEvent.bind(this.props.component)}
        />);
        break;

      case 'MidiKeyboard':
        component = (<MidiKeyboard
          audioComponent={this.props.component}
          onChildEvent={this.props.component.onChildEvent.bind(this.props.component)}
        />);
        break;

      default:
        this.log('ReactAudioComponent::render(): No corresponding reactComponentType was found for component ' + this.props.component.type);
        return false;
    }

    let inlineStyles = {
      left: Math.round(this.state.canvasPos.x) + 'px',
      top: Math.round(this.state.canvasPos.y) + 'px'
    };

    return (
      <div
        id={"component-" + this.props.component.id}
        className={"audio-component " + this.props.component.type}
        style={inlineStyles}
        ref={(el) => {
          if (el && !this.props.component.initialBoundingRect) {
            // We store the dom element's coordinates once to be able to position
            // it correctly when it's dragged onto the canvas.
            this.props.component.initialBoundingRect = el.getBoundingClientRect();
          }
        }}
        draggable={this.state.canBeDragged}
        onDragStart={this.onDragStart.bind(this)}
      >
        <ReactAudioComponentInputs
          inputs={this.state.inputs}
          handleEvent={this.handleChildEvent.bind(this)}
          connectableIos={this.props.connectableIos}
        />
        <h2 className="audio-component-headline">{this.props.component.title}</h2>
        <div className="audio-component-content">
          {component}
        </div>
        <ReactAudioComponentOutputs
          outputs={this.state.outputs}
          handleEvent={this.handleChildEvent.bind(this)}
          connectableIos={this.props.connectableIos}
        />
      </div>
    );
  }
  log(msg) {
    if ('undefined' != typeof console.log) {
      console.log(msg);
    }
  }
}
