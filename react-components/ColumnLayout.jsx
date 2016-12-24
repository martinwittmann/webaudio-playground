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
      selectedComponent: false
    };

    this.connectionLines = [];
    this.canvasSelector = props.settings.canvasSelector;
    this.connectableIos = [];
    this.snappedToConnectingIo = false;

    this.childComponents = {
      connectionLines: false
    };

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
      selectedComponent: reactAudioComponent,
      currentTab: 'inspector'
    });
  }

  unselectComponent() {
    this.setState({
      selectedComponent: false,
      currentTab: 'add-components'
    });
  }

/*
* io: The componentIO object of the actual input/output the connection is started from.
*/
  onStartConnectingComponents(io) {
    let ioOffset = this.props.settings.ioOffset;
    let ioType = 'output' == io.ioType ? 'input' : 'output';

    // The absolute coordinates of the io's center we're starting the connection from.
    this.lineFromPos = {
      x: io.coordinates.left + ioOffset,
      y: io.coordinates.top + ioOffset
    };

    // Add the event handler for mouse move.
    this.mouseMoveCallback = this.onMouseMove.bind(this);
    document.querySelector(this.canvasSelector).addEventListener('mousemove', this.mouseMoveCallback);

    this.connectFromIo = io;


    // Store all connectable ios of all components.
    this.connectableIos = this.props.settings.components.reduce((ios, component) => {
      let connectableOutputs = component.outputs.filter(output => {
        let result = output.dataType == io.dataType && output.ioType == ioType;
        return result;
      });

      let connectableInputs = component.inputs.filter(input => {
        let result = input.dataType == io.dataType && input.ioType == ioType;
        return result;
      });

      return ios.concat(connectableInputs).concat(connectableOutputs);
    }, []);

    this.setState({
      // We store parts of the css class we add to the container.
      isConnectingComponents: ioType + '-' + io.dataType
    });
  }

  onStopConnectingComponents() {
    this.connectableIos = [];

    // Remove the classes for marking connectable ios on the container and remove
    // the connectingLine.
    this.setState({
      isConnectingComponents: false
    });

    this.childComponents.connectionLines.setState({
      connectingLine: false
    });

    // Remove the class for the connecting io.
    if (this.connectFromIo.reactComponent) {
      this.connectFromIo.reactComponent.setState({
        activeIO: false
      });
    }

    // Allow the component to be moved around again.
    if (this.connectFromIo) {
      this.connectFromIo.reactComponent.props.reactAudioComponent.setState({
        canBeDragged: true
      });
    }

    // Reset snapping and stop listening to onMouseMove.
    this.snappedToConnectingIo = false;
    document.querySelector(this.canvasSelector).removeEventListener('mousemove', this.mouseMoveCallback);

    this.connectFromIo = false;
  }

  onCreateConnection(connectToIo) {
    let outputIo, inputIo;

    // We always create the connection from the output to the input.
    // Right now there's no technical reason for this apart from being logic.
    // We need to check component2Io since this is where the mouseUp event fired.
    if ('output' == connectToIo.ioType) {
      outputIo = connectToIo;
      inputIo = this.connectFromIo;
    }
    else {
      outputIo = this.connectFromIo;
      inputIo = connectToIo;
    }
    outputIo.addConnection(inputIo);


    this.connectionLines.push({
      from: outputIo,
      to: inputIo
    });

    outputIo.reactComponent.setState({
      connected: true
    });

    inputIo.reactComponent.setState({
      connected: true
    });

    // Update the connection lines.    
    console.log(this);
    this.childComponents.connectionLines.setState({
      lines: this.connectionLines
    });
  }

  // This only gets added after starting a connection and is removed afterwards.
  onMouseMove(ev) {
    this.currentMousePos = {
        x: ev.pageX,
        y: ev.pageY
    };

    let ioOffset = this.props.settings.ioOffset;
    let cRect = this.getContainerRect();
    let rawMouseX = this.currentMousePos.x - cRect.left;
    let rawMouseY = this.currentMousePos.y - cRect.top;

    let connectingLine = {
      x1: this.lineFromPos.x - cRect.left,
      y1: this.lineFromPos.y - cRect.top,
      x2: rawMouseX,
      y2: rawMouseY
    };

    // Try snapping to a close connectable io.
    // This is used when stopping creating a connection. If this is an io we will
    // connect to it.
    this.snappedToConnectingIo = false;

    // connectableIos is set in ReactAudioComponentInputs/Outputs.
    this.connectableIos.map(io => {
      let snapSize = this.props.settings.snapSize;
      io.isSnapped = false;
      let xInSnapRange = Math.abs(io.coordinates.left - cRect.left - rawMouseX) < snapSize;
      let yInSnapRange = Math.abs(io.coordinates.top - cRect.top - rawMouseY) < snapSize;

      if (xInSnapRange && yInSnapRange) {
        this.snappedToConnectingIo = io;
        // We can't call io.ioComponent.setState because that's not allowed 
        // in a render function in react and will throw an error.
        io.isSnapped = true;
        connectingLine.x2 = io.coordinates.left - cRect.left + ioOffset;
        connectingLine.y2 = io.coordinates.top - cRect.top + ioOffset;
      }
    });

    this.childComponents.connectionLines.setState({
      connectingLine: connectingLine
    });
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
        this.onStartConnectingComponents(args[0]);
        break;
    }
  }

  onMouseUp(ev) {
    if (this.state.isConnectingComponents) {
      if (this.snappedToConnectingIo) {
        // Create the connection.
        this.onCreateConnection(this.snappedToConnectingIo);
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

  moveComponentConnectionLines(reactAudioComponent, deltaX = 0, deltaY = 0) {
    let componentId = reactAudioComponent.props.component.id;

    let newConnectionLines = this.connectionLines.map((line, index) => {
      // Update the io's coordinates if it belongs on any end to the moved component.

      if (line.to.id == componentId) {
        line.to.coordinates[line.inputId].left += deltaX;
        line.to.coordinates[line.inputId].top += deltaY;
      }
      else if (line.from.id == componentId) {
        line.from.coordinates[line.outputId].left += deltaX;
        line.from.coordinates[line.outputId].top += deltaY;
      }
      return line;
    });

    this.childComponents.connectionLines.setState({
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
    
    let cls = [this.props.settings.canvasSelector.replace(/\./, '')];

    if (this.state.isConnectingComponents) {
      cls.push('connecting', 'connect-to--' + this.state.isConnectingComponents);
    }

    let connectionLines = (<ComponentConnectionLines
      lines={this.state.connectionLines}
      settings={this.props.settings}
      connectingLine={this.state.connectingLine}
      container={this}
    />);

    let components = this.props.settings.components.map(component => {
      return (<ReactAudioComponent
        key={component.id}
        component={component}
        emitEvent={this.handleEvent.bind(this)}
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