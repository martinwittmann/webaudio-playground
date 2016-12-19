import React from 'react';

import ReactAudioComponentInputs from './ReactAudioComponentInputs.jsx';
import ReactAudioComponentOutputs from './ReactAudioComponentOutputs.jsx';

// React components for our audio components.
import Oscillator from './Oscillator.jsx';
import MidiIn from './MidiIn.jsx';
import Midi2Frequency from './Midi2Frequency.jsx';
import MidiKeyboard from './MidiKeyboard.jsx';
import AudioOut from './AudioOut.jsx';

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
        this.props.emitEvent('start-connecting', this, sourceIoComponent, io, { x: ev.pageX, y: ev.pageY});
        break;

      case 'create-connection':
        this.props.emitEvent('create-connection', this, args[0], args[1]);
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

  onDragStartComponent(ev) {
    let onCanvas = !this.props.component.inSidebar;

    try {
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.dropEffect = 'none';
      // Firefox does not fire the drag event unless we set some data.
      ev.dataTransfer.setData('text/plain', '');
    }
    catch(e) {
      // According to react-dnd IE does not allow setting a mime type here and
      // will throw an error.
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

    if (!this.props.component.inSidebar) {
      // We prevent showing a dragImage for components on the canvas since we
      // want to directly move it instead of dragging and on drop settinga new position.
      let img = new Image();
      ev.dataTransfer.setDragImage(img, 0, 0);
    }
  }

  onDragComponent(ev) {
    if (!this.state.dragData.onCanvas) {
      return true;
    }

    if (ev.pageX == 0 || ev.pageY) {
      // This is case in firefox.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=505521
      ev.pageX = this.props.container.mousePos.x;
      ev.pageY = this.props.container.mousePos.y;
    }

    let deltaX = ev.pageX - this.state.dragData.lastDragX;
    let deltaY = ev.pageY - this.state.dragData.lastDragY;

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

  onClickComponent(ev) {
    if (!this.props.component.inSidebar) {
      ev.stopPropagation();
      this.props.container.selectComponent(this);
    }
  }

  render() {
    const { connectDragSource, isDragging } = this.props;
    let component;
    switch (this.props.component.reactComponentType) {
      case 'AudioOut':
        component = (<AudioOut
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

      case 'MidiIn':
        component = (<MidiIn
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
        
      case 'Oscillator':
        component = (<Oscillator
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

    let cls = ['audio-component', this.props.component.type];
    if (this.props.selected) {
      cls.push('selected');
    }

    return (
      <div
        id={"component-" + this.props.component.id}
        className={cls.join(' ')}
        style={inlineStyles}
        ref={(el) => {
          if (el && !this.props.component.initialBoundingRect) {
            // We store the dom element's coordinates once to be able to position
            // it correctly when it's dragged onto the canvas.
            this.props.component.initialBoundingRect = el.getBoundingClientRect();
          }
        }}
        draggable={this.state.canBeDragged}
        onDragStart={this.onDragStartComponent.bind(this)}
        onDrag={this.onDragComponent.bind(this)}
        onClick={this.onClickComponent.bind(this)}
      >
        <ReactAudioComponentInputs
          inputs={this.state.inputs}
          handleEvent={this.handleChildEvent.bind(this)}
          connectableIos={this.props.connectableIos}
          settings={this.props.settings}
          container={this.props.container}
          reactAudioComponent={this}
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
          container={this.props.container}
          reactAudioComponent={this}
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
