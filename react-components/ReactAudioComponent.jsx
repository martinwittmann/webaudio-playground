import React from 'react';

import ReactAudioComponentInputs from './ReactAudioComponentInputs.jsx';
import ReactAudioComponentOutputs from './ReactAudioComponentOutputs.jsx';

// React components for our audio components.
import Oscillator from './Oscillator.jsx';
import MidiIn from './MidiIn.jsx';
import Midi2Frequency from './Midi2Frequency.jsx';
import MidiKeyboard from './MidiKeyboard.jsx';

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
      canBeDraggedToCanvas: props.component.inSidebar,
      connectableIos: props.connectableIos
    };

    // I moved this out of state to be able to set it directly and synchronously.
    this.canBeDragged = true;
  }

  handleChildEvent(type, ...args) {
    let outputData, ev;
    switch (type) {
      case 'start-connecting':
        ev = args[0];
        ev.preventDefault();
        outputData = this.parseOutputIdAttribute(ev.target.getAttribute('id'));
        this.canBeDragged = false;
        
        let sourceIoComponent = args[1];
        let io = args[2];
        this.props.emitEvent('start-connecting', this, sourceIoComponent, io, { x: ev.pageX, y: ev.pageY});
        break;

      case 'create-connection':
        this.props.emitEvent('create-connection', this, args[0], args[1]);
        break;

      case 'stop-connecting':
        ev = args[0];
        ev.preventDefault();

        this.canBeDragged = true;
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

  onMouseDown(ev) {
    if (this.canBeDragged) {
      this.onDragStartComponent(ev);
      this.globalMouseMoveEventHandler = this.onDragComponent.bind(this);
      document.addEventListener('mousemove', this.globalMouseMoveEventHandler);
    }
  }

  onMouseUp(ev) {
    if (this.globalMouseMoveEventHandler) {
      document.removeEventListener('mousemove', this.globalMouseMoveEventHandler);
    }
  }

  onDragStartComponent(ev) {
    let onCanvas = !this.props.component.inSidebar;
    console.log(this.canBeDragged);

    if (ev.dataTransfer) {
      // 
      ev.dataTransfer.setData('text/plain', '');
    }

    let dragData = {
      componentId: this.props.component.id,
      dragStartX: ev.pageX,
      dragStartY: ev.pageY,
      lastDragX: onCanvas ? ev.pageX : 0,
      lastDragY: onCanvas ? ev.pageY : 0,
      onCanvas: onCanvas
    }

    window.dragData = dragData;

    this.setState({
      dragData: dragData
    });
  }

  onDragComponent(ev) {
    if (!this.state.dragData.onCanvas) {
      return true;
    }

    let deltaX = ev.pageX - this.state.dragData.lastDragX;
    let deltaY = ev.pageY - this.state.dragData.lastDragY;

    //console.log(ev.pageX, ev.pageY, this.state.dragData.lastDragX, this.state.dragData.lastDragY);

    // This is most probably a dirty hack.
    this.state.dragData.lastDragX = ev.pageX;
    this.state.dragData.lastDragY = ev.pageY;

    this.setState({
      canvasPos: {
        x: this.state.canvasPos.x + deltaX,
        y: this.state.canvasPos.y + deltaY
      },
      dragData: this.state.dragData
    });

    this.state.dragData.lastDragX = ev.pageX;
    this.state.dragData.lastDragY = ev.pageY;

    // We use the already calculated position delta and apply it to all ios.
    this.props.container.updateComponentConnectionLines(this, deltaX, deltaY);
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
        draggable={this.state.canBeDraggedToCanvas}
        onDragStart={this.onDragStartComponent.bind(this)}
        onDrag={this.onDragComponent.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
      >
        <ReactAudioComponentInputs
          inputs={this.state.inputs}
          handleEvent={this.handleChildEvent.bind(this)}
          connectableIos={this.props.connectableIos}
          settings={this.props.settings}
        />
        <h2 className="audio-component-headline">{this.props.component.title}</h2>
        <div className="audio-component-content">
          {component}
        </div>
        <ReactAudioComponentOutputs
          outputs={this.state.outputs}
          handleEvent={this.handleChildEvent.bind(this)}
          connectableIos={this.props.connectableIos}
          settings={this.props.settings}
          canvasSelector={this.props.canvasSelector}
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
