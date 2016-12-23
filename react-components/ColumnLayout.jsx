import React from 'react';
import Inspector from './Inspector.jsx';
import ComponentsAvailable from './ComponentsAvailable.jsx';
import ReactAudioComponent from './ReactAudioComponent.jsx';
import ComponentConnectionLines from './ComponentConnectionLines.jsx';

// Drag & drop stuff.
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'


class ColumnLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'add-components',
      isConnectingComponents: false,
      sourceIo: false,
      connectableIoType: false,
      connectableType: false,
      connectionLines: [],
      selectedComponent: false
    };

    this.canvasSelector = props.settings.canvasSelector;

    // This is used while starting a connection and holds all possible connection
    // io endpoints and their coordinates to allow snapping to close ios.
    this.connectableIos = {};
    this.snappedToConnectingIo = false;

    window.addEventListener('keydown', this.onAppKeyPress.bind(this), true);
  }

  onTabButtonClick(ev) {
    this.setState({
      currentTab: ev.target.dataset.tab
    });
  }

  showNextTab() {
    let currentTab = document.querySelector('.tab-links > .' + this.state.currentTab);
    let nextTabNode = currentTab.nextSibling;
    if (!nextTabNode) {
      nextTabNode = currentTab.parentNode.firstChild;
    }

    this.onTabButtonClick({
      target: {
        dataset: {
          tab: nextTabNode.dataset.tab
        }
      }
    });
  }

  showPreviousTab() {
    let currentTab = document.querySelector('.tab-links > .' + this.state.currentTab);
    let previousTabNode = currentTab.previousSibling;
    if (!previousTabNode) {
      previousTabNode = currentTab.parentNode.lastChild;
    }

    this.onTabButtonClick({
      target: {
        dataset: {
          tab: previousTabNode.dataset.tab
        }
      }
    });
  }

  onAppKeyPress(ev) {
    switch (ev.keyCode) {
      case 9: // The tab key.
        if (ev.shiftPressed) {
          this.showPreviousTab();
        }
        else {
          this.showNextTab();
        }
        break;
    }
  }

  handleEvent(type, ...args) {

    switch (type) {
      case 'component-selected':
        this.setState({
          selectedComponent: args[0],
          currentTab: 'inspector'
        });
        break;

      case 'component-unselected':
        this.setState({
          selectedComponent: false,
          currentTab: 'add-components'
        });
        break;
    }

    this.props.settings.emitEvent(type, args);
  }

  selectComponent(reactAudioComponent) {
    this.setState({
      selectedComponent: reactAudioComponent.props.component.id
    });
  }

  unselectComponent() {
    this.setState({
      selectedComponent: false
    });
  }

  onStartConnectingComponents([sourceComponent, sourceIoComponent, io]) {
    let ioOffset = this.props.settings.ioOffset;

    // The absolute coordinages of the io's center we're starting the connection from.
    let lineFromPos = {
      x: sourceIoComponent.coordinates[io.id].left + ioOffset,
      y: sourceIoComponent.coordinates[io.id].top + ioOffset
    };

    // We can't simply use the bind wrapped function since removeEventListener
    // needs the exact same function instance. So we store it, and use it in
    // onStopConnectingComponents() to remove the event listener.
    // For performance reasons I did not want to use this event handler all the
    // time, so we only subscribe when necessary.
    this.mouseMoveCallback = this.onMouseMove.bind(this);
    document.querySelector(this.canvasSelector).addEventListener('mousemove', this.mouseMoveCallback);

    let connectableIos = {};
    if (this.state.connectableIoType) {
      connectableIos.ioType = this.state.connectableIoType;
    }
    if (this.state.connectableType) {
      connectableIos.type = this.state.connectableType;
    }

    this.connectFromComponent = sourceComponent;

    this.setState({
      isConnectingComponents: true,
      connectableIoType: 'output' == io.ioType ? 'output' : 'input',
      connectableType: io.type,
      sourceIo: io,
    });
  }

  onStopConnectingComponents() {
    this.connectFromComponent = false;

    // Remove the classes for marking connectable ios on this component (the container).
    this.setState({
      isConnectingComponents: false,
      connectableIoType: false,
      connectableType: false,
      sourceIo: false
    });

    // Allow the component to be moved around again.
    if (this.connectFromComponent) {
      this.connectFromComponent.setState({
        canBeDragged: true
      });
    }

    // Remove the class for the connecting io.
    if (this.connectFromIoComponent) {
      this.connectFromIoComponent.setState({
        activeIO: false
      });
      this.connectFromIoComponent = false;
    }

    this.snappedToConnectingIo = false;
    document.querySelector(this.canvasSelector).removeEventListener('mousemove', this.mouseMoveCallback);
  }

  onCreateConnection(args) {
    let component1 = this.sourceComponent.props.component;
    let component1Io = this.state.sourceIo;
    let component2 = args[0].props.component;
    let component2Io = args[1];
    let component2IoComponent = args[2];
    let outputComponent, inputComponent, outputId, inputId;

    // We always create the connection from the output to the input.
    // Right now there's no technical reason for this apart from being logic.
    // We need to check component2Io since this is where the mouseUp event fired.
    if ('output' == component2Io.ioType) {
      component2Io.addConnection(component1Io);

      outputComponent = component2IoComponent;
      inputComponent = this.state.sourceIoComponent;
      outputId = component2Io.id;
      inputId = component1Io.id;
    }
    else {
      component1Io.addConnection(component2Io);

      outputComponent = this.state.sourceIoComponent;
      inputComponent = component2IoComponent;
      outputId = component1Io.id;
      inputId = component2Io.id;
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

  // This only gets added after starting a connection and is removed afterwards.
  onMouseMove(ev) {
    this.currentMousePos = {
        x: ev.pageX,
        y: ev.pageY
    };

    let rect = this.getContainerRect();
    let rawMouseX = this.currentMousePos.x - rect.left;
    let rawMouseY = this.currentMousePos.y - rect.top;

    this.connectingLine = {
      x1: sourceIoComponent.coordinates[io.id].left + ioOffset - rect.left,
      y1: lineFromPos.y - rect.top,
      x2: rawMouseX,
      y2: rawMouseY
    };

    // Try snapping to a close connectable io.
    let snapSize = this.props.settings.snapSize;
    // This is used when stopping creating a connection. If this is an io we will
    // connect to it.
    this.snappedToConnectingIo = false;

    // connectableIos is set in ReactAudioComponentInputs/Outputs.
    for (let id in this.connectableIos) {
      let io = this.connectableIos[id];
      io.ioComponent.isSnapped = false;
      let xInSnapRange = Math.abs(io.left - rect.left - rawMouseX) < snapSize;
      let yInSnapRange = Math.abs(io.left - rect.left - rawMouseY) < snapSize;

      if (xInSnapRange && yInSnapRange) {
        this.snappedToConnectingIo = io;
        // We can't call io.ioComponent.setState because that's not allowed 
        // in a render function in react and will throw an error.
        io.ioComponent.isSnapped = true;
        this.connectingLine.x2 = io.left - rect.left + ioOffset;
        this.connectingLine.y2 = io.top - rect.top + ioOffset;
      }
    }
  }

  onDragOverContainer(ev) {
    // This dirty hack is necessary since firefox does not (yet) provide mouse
    // coordinates in the on drag event. So we store them here and use them in
    // ReactAudioComponent if necessary.
    this.mousePos = {
      x: ev.pageX,
      y: ev.pageY
    };

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
        break;
    }
  }

  onMouseUp(ev) {
    if (this.state.isConnectingComponents) {
      if (this.snappedToConnectingIo) {
        // Create the connection.
        let ioData = this.snappedToConnectingIo;
        let args = [ioData.reactAudioComponent, ioData.io, ioData.ioComponent];
        this.onCreateConnection(args);
      }

      // We need to stop creating connections even if we just created one.
      this.onStopConnectingComponents();
    }
  }

  onClick(ev) {
    //this.unselectComponent();
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

      //component.inSidebar = false; // Mark the component to be shown on the canvas.

      component.reactComponent.moveOnCanvas({
        x: droppedAt.x - containerRect.left - posInCompOnDragStart.x,
        y: droppedAt.y - containerRect.top - posInCompOnDragStart.y
      });
    }
  }

  updateComponentConnectionLines(reactAudioComponent, deltaX, deltaY) {
    let componentId = reactAudioComponent.props.component.id;

    let newConnectionLines = this.state.connectionLines.map((line, index) => {
      // Update the io's coordinates if it belongs on any end to the moved component.
      let outputComponentId = line.from.props.reactAudioComponent.props.component.id;
      let inputComponentId = line.to.props.reactAudioComponent.props.component.id;

      if (inputComponentId == componentId) {
        line.to.coordinates[line.inputId].left += deltaX;
        line.to.coordinates[line.inputId].top += deltaY;
      }
      else if (outputComponentId == componentId) {
        line.from.coordinates[line.outputId].left += deltaX;
        line.from.coordinates[line.outputId].top += deltaY;
      }
      return line;
    });

    this.setState({
      connectionLines: newConnectionLines
    });
  }

  getContainerRect() {
    if ('undefined' == typeof this.containerRect) {
      this.containerRect = document.querySelector(this.canvasSelector).getBoundingClientRect();
    }
    return this.containerRect;
  }

  render() {
    let tabContent;
    let tabLinkData = [
      {
        id: 'add-components',
        title: 'Add components'
      },
      {
        id: 'inspector',
        title: 'Inspector'
      }
    ];
    let tabLinks = tabLinkData.map(link => {
      let tabClass = ['tab', link.id];
      if (this.state.currentTab == link.id) {
        tabClass.push('active');
      }

      return (
        <li key={link.id} className={tabClass.join(' ')} data-tab={link.id}>
          <a onClick={this.onTabButtonClick.bind(this)} data-tab={link.id}>{link.title}</a>
        </li>
      );
    })

    switch(this.state.currentTab) {
      case 'add-components':
        tabContent = (
          <ComponentsAvailable
            settings={this.props.settings}
          />
        );
        break;

      case 'inspector':
        tabContent = (
          <Inspector
            emitEvent={this.handleEvent.bind(this)}
            selectedComponent={this.state.selectedComponent}
          />
        );
        break;
    }

    const { x, y, connectDropTarget, isOver } = this.props;

    let connectingLine = false;
    
    let cls = [this.props.settings.canvasSelector.replace(/\./, '')];

    if (this.state.isConnectingComponents) {
      cls.push('connecting');

    }

    let connectionLines = React.createElement(ComponentConnectionLines, {
      lines: this.state.connectionLines,
      settings: this.props.settings,
      connectingLine: connectingLine
    });

    let components = this.props.settings.components.map(component => {
      return (<ReactAudioComponent
        key={component.id}
        component={component}
        emitEvent={this.handleEvent.bind(this)}
        connectableIos={this.props.connectableIos}
        settings={this.props.settings}
        container={this}
      />);
    });

    return (
      <ul className="column-layout">
        <li className="column column-1">
          <ul className="tab-links">
            {tabLinks}
          </ul>
          <div className="tab-contents">
            {tabContent}
          </div>
        </li>
        <li className="column column-2">
          <div className="column-content">
            <div
              className={cls.join(' ')}
              onMouseUp={this.onMouseUp.bind(this)}
              onDrop={this.onDropComponent.bind(this)}
              onDragOver={this.onDragOverContainer.bind(this)}
              onClick={this.onClick.bind(this)}
            >
              {components}
            </div>
            {connectionLines}
          </div>
        </li>
      </ul>
    );
  }
}

export default DragDropContext(HTML5Backend)(ColumnLayout);