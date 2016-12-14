import React from 'react';
import ReactAudioComponent from './ReactAudioComponent.jsx';
import ComponentConnectionLines from './ComponentConnectionLines.jsx';

export default class ComponentsContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isConnectingComponents: false,
      sourceComponent: false,
      sourceIoComponent: false,
      sourceIo: false,
      connectableIoType: false,
      connectableType: false,
      connectionLines: [],
      canvasSelector: props.settings.canvasSelector
    };
  }

  onStartConnectingComponents([sourceComponent, sourceIoComponent, io, mousePos]) {
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

    this.connectingFromIoPos = {
      x: sourceIoComponent.coordinates.left + this.props.settings.ioOffset,
      y: sourceIoComponent.coordinates.top + this.props.settings.ioOffset
    };

    this.setState({
      isConnectingComponents: true,
      sourceComponent: sourceComponent,
      sourceIoComponent: sourceIoComponent,
      connectableIoType: connectableIoType,
      connectableType: io.type,
      sourceIo: io,
    });

    // We can't simply use the bind wrapped function since removeEventListener
    // needs the exact same function instance. So we store it, and use it in
    // onStopConnectingComponents() to remove the event listener.
    // For performance reasons I did not want to use this event handler all the
    // time, so we only subscribe when necessary.
    this.mouseMoveCallback = this.onMouseMove.bind(this);
    document.querySelector(this.state.canvasSelector).addEventListener('mousemove', this.mouseMoveCallback);
  }

  onStopConnectingComponents() {
    // Remove the classes for marking connectable ios on this component (the container).

    this.setState({
      currentMousePos: false,
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
    document.querySelector(this.state.canvasSelector).removeEventListener('mousemove', this.mouseMoveCallback);
  }

  onCreateConnection(args) {
    let component1 = this.state.sourceComponent.props.component;
    let component1Io = this.state.sourceIo;
    let component2 = args[0].props.component;
    let component2Io = args[1];
    let component2IoComponent = args[2];
    let outputComponent, inputComponent, outputId, inputId;

    // We always create the connection from the output to the input.
    // Right now there's no technical reason for this apart from being logic.
    // We need to check component2Io since this is where the mouseUp event fired.
    if ('output' == component2Io.ioType) {
      component2.connectOutput(component2Io, component1Io);
      outputComponent = component2IoComponent;
      inputComponent = this.state.sourceIoComponent;
      outputId = component2.id;
      inputId = this.state.sourceComponent.props.component.id;
    }
    else {
      component1.connectOutput(component1Io, component2Io);
      outputComponent = this.state.sourceIoComponent;
      inputComponent = component2IoComponent;
      outputId = this.state.sourceComponent.props.component.id;
      inputId = component2.id;
    }

    let newLines = this.state.connectionLines.slice();

    newLines.push({
      from: outputComponent,
      to: inputComponent,
      outputId: outputId,
      inputId: inputId
    });

    this.state.sourceIoComponent.setState({
      connected: true
    });

    component2IoComponent.setState({
      connected: true
    });

    this.setState({
      connectionLines: newLines
    });
  }

  onMouseMove(ev) {
    if (this.state.isConnectingComponents) {
      this.setState({
        currentMousePos: {
          x: ev.pageX,
          y: ev.pageY
        }
      });
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
    //let dragData = JSON.parse(ev.dataTransfer.getData('text/plain'));
    let dragData = window.dragData;

    let cursorPosOnDragStart = {
      x: parseFloat(dragData.dragStartX, 10),
      y: parseFloat(dragData.dragStartY, 10)
    };
    let newCanvasPos, component;

    let componentIsOnCanvas = dragData.onCanvas;

    // Handle the dropping by either adding the component to the canvas or moving it on the canvas.
    let droppedAt = {
      x: ev.pageX,
      y: ev.pageY
    };

    if (!componentIsOnCanvas) {
      // Add the component to the canvas at the expected position.
      component = this.props.settings.emitEvent('get-available-component-by-id', dragData.componentId);
      this.props.settings.emitEvent('add-component', component);

      // Calculate the position where we want to drop the component:
      let posInCompOnDragStart = {
        x: cursorPosOnDragStart.x - component.initialBoundingRect.left,
        y: cursorPosOnDragStart.y - component.initialBoundingRect.top
      };

      let containerRect = this.getContainerRect();

      component.inSidebar = false; // Mark the component to be shown on the canvas.

      component.moveReactContainerComponent({
        x: droppedAt.x - containerRect.left - posInCompOnDragStart.x,
        y: droppedAt.y - containerRect.top - posInCompOnDragStart.y
      });
    }
  }

  updateComponentConnectionLines(reactAudioComponent, deltaX, deltaY) {
    let componentId = reactAudioComponent.props.component.id;
    let newConnectionLines = this.state.connectionLines.map((line, index) => {
      // Update the io's coordinates if it belongs on any end to the moved component.
      if (line.inputId == componentId) {
        line.to.coordinates.left += deltaX;
        line.to.coordinates.top += deltaY;
      }
      else if (line.outputId == componentId) {
        line.from.coordinates.left += deltaX;
        line.from.coordinates.top += deltaY;
      }
      return line;
    });
    this.setState({
      connectionLines: newConnectionLines
    });
  }

  getContainerRect() {
    if ('undefined' == typeof this.containerRect) {
      this.containerRect = document.querySelector(this.props.settings.canvasSelector).getBoundingClientRect();
    }
    return this.containerRect;
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
        settings={this.props.settings}
        container={this}
      />);
    });

    let connectingLine = false;
    let cls = [this.props.settings.canvasSelector.replace(/\./, '')];

    if (this.state.isConnectingComponents) {
      cls.push('connecting');

      if (this.state.currentMousePos) {
        let containerRect = this.getContainerRect();
        connectingLine = {
          x1: this.connectingFromIoPos.x - containerRect.left,
          y1: this.connectingFromIoPos.y - containerRect.top,
          x2: this.state.currentMousePos.x - containerRect.left,
          y2: this.state.currentMousePos.y - containerRect.top
        };
      }
    }

    return (
      <div
        className={cls.join(' ')}
        onMouseUp={this.onMouseUp.bind(this)}
        onDrop={this.onDropComponent.bind(this)}
        onDragOver={this.onDragOverContainer.bind(this)}
      >
        <svg className="components-connections" width="100%" height="100%">
          <ComponentConnectionLines
            lines={this.state.connectionLines}
            settings={this.props.settings}
            connectingLine={connectingLine}
          />
        </svg>
        {components}
      </div>
    );
  } //

  log(msg) {
    if (console && console.log) {
      console.log(msg);
    }
  }
}