import React from 'react';
import ReactAudioComponent from './ReactAudioComponent.js';

export default class ComponentsContainer extends React.Component {
  constructor() {
    super();

    this.state = {
      isConnectingComponents: false,
      sourceComponent: false,
      sourceIoComponent: false,
      sourceIo: false,
      connectableIoType: false,
      connectableType: false
    };
  }

  onStartConnectingComponents([sourceComponent, sourceIoComponent, io]) {
    this.log('Start connecting...');
    let connectableIoType;
    if ('output' == io.ioType) {
      connectableIoType = 'input';
    }
    else if ('input' == io.ioType) {
      connectableIoType = 'output';
    }
    else {
      this.log('onStartConnectingComponents: Trying to start connecting from unknown ioType: ' + io.ioType);
      return false;
    }

    this.setState({
      isConnectingComponents: true,
      sourceComponent: sourceComponent,
      sourceIoComponent: sourceIoComponent,
      connectableIoType: connectableIoType,
      connectableType: io.type,
      sourceIo: io
    });
  }

  onStopConnectingComponents() {
    this.log('Stopped connecting.');

    // Remove the classes for marking connectable ios on this component (the container).
    this.setState({
      isConnectingComponents: false,
      connectableIoType: false,
      connectableType: false,
      sourceComponent: false,
      sourceIoComponent: false,
      sourceIo: false
    });

    // Allow the component to be moved around again.
    if (this.state.sourceComponent) {
      this.state.sourceComponent.setState({
        canBeDragged: true
      });
    }

    // Remove the class for the connecting io.
    if (this.state.sourceIoComponent) {
      this.state.sourceIoComponent.setState({
        activeIO: false
      });
    }
  }

  onCreateConnection(args) {
    this.log('Create connection...');
    let component1 = this.state.sourceComponent.props.component;
    let component1Io = this.state.sourceIo;
    let component2 = args[0].props.component;
    let component2Io = args[1];

    // We always create the connection from the output to the input.
    // Right now there's no technical reason for this apart from being logic.
    // We need to check component2Io since this is where the mouseUp event fired.
    if ('output' == component2Io.ioType) {
      component2.connectOutput(component2Io, component1Io);
    }
    else {
      component1.connectOutput(component1Io, component2Io);
    }
  }

  onDragOverContainer(ev) {
    // For some reason this is necessary for the onDrop event to fire.
    // See: http://stackoverflow.com/questions/8414154/html5-drop-event-doesnt-work-unless-dragover-is-handled
    ev.preventDefault();
  }

  handleEvent(type, ...args) {
    switch (type) {
      case 'start-connecting':
        this.onStartConnectingComponents(args);
        break;

      case 'create-connection':
        this.onCreateConnection(args);
        break;

      case 'stop-connecting':

        this.onStopConnectingComponents(args);
    }
  }

  onMouseUp(ev) {
    if (this.state.isConnectingComponents) {
      // Only stop connecting if we started.
      this.onStopConnectingComponents();
    }
  }

  onDropComponent(ev) {
    ev.preventDefault();

    let componentId = ev.dataTransfer.getData('id');
    let cursorPosOnDragStart = {
      x: parseFloat(ev.dataTransfer.getData('dragStartX'), 10),
      y: parseFloat(ev.dataTransfer.getData('dragStartY'), 10)
    };
    let newCanvasPos, component;

    let componentIsOnCanvas = parseInt(ev.dataTransfer.getData('onCanvas'), 10);

    // Handle the dropping by either adding the component to the canvas or moving it on the canvas.
    let droppedAt = {
      x: ev.pageX,
      y: ev.pageY
    };

    if (!componentIsOnCanvas) {
      // Add the component to the canvas at the expected position.
      component = this.props.settings.emitEvent('get-available-component-by-id', componentId);
      this.props.settings.emitEvent('add-component', component);

      // Calculate the position where we want to drop the component:
      let posInCompOnDragStart = {
        x: cursorPosOnDragStart.x - component.initialBoundingRect.left,
        y: cursorPosOnDragStart.y - component.initialBoundingRect.top
      };

      let containerRect = document.querySelector(component.canvasSelector).getBoundingClientRect();

      component.inSidebar = false; // Mark the component to be shown on the canvas.

      newCanvasPos = {
        x: droppedAt.x - containerRect.left - posInCompOnDragStart.x,
        y: droppedAt.y - containerRect.top - posInCompOnDragStart.y
      };
    }
    else {
      // Just move the component to the expected position.
      component = this.props.settings.emitEvent('get-canvas-component-by-id', componentId);
      newCanvasPos = {
        x: component.state.canvasPos.x + (droppedAt.x - cursorPosOnDragStart.x),
        y: component.state.canvasPos.y + (droppedAt.y - cursorPosOnDragStart.y)
      };
    }

    // Update the container's position.
    component.moveReactContainerComponent(newCanvasPos);
  }

  render() {
    const { x, y, connectDropTarget, isOver } = this.props;

    let connectableIos = {};
    if (this.state.connectableIoType) {
      connectableIos.ioType = this.state.connectableIoType;
    }
    if (this.state.connectableType) {
      connectableIos.type = this.state.connectableType;
    }

    let components = this.props.settings.components.map(component => {
      return (<ReactAudioComponent
        key={component.id}
        component={component}
        emitEvent={this.handleEvent.bind(this)}
        connectableIos={connectableIos}
      />);
    });

    let cls = ['components-container'];
    if (this.state.isConnectingComponents) {
      cls.push('connecting');
    }

    return (
      <div
        className={cls.join(' ')}
        onMouseUp={this.onMouseUp.bind(this)}
      >
        <svg className="components-connections" width="100%" height="100%">
        </svg>
        <div
          className="components"
          onDrop={this.onDropComponent.bind(this)}
          onDragOver={this.onDragOverContainer.bind(this)}
        >
          {components}
        </div>
      </div>
    );
  }

  log(msg) {
    if (console && console.log) {
      console.log(msg);
    }
  }
}
