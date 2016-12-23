import React from 'react';
import Inspector from './Inspector.jsx';
import ComponentsAvailable from './ComponentsAvailable.jsx';
import ComponentsContainer from './ComponentsContainer.jsx';
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
      sourceComponent: false,
      sourceIoComponent: false,
      sourceIo: false,
      connectableIoType: false,
      connectableType: false,
      connectionLines: [],
      canvasSelector: props.settings.canvasSelector,
      selectedComponent: false
    };

    // This is used while starting a connection and holds all possible connection
    // io endpoints and their coordinates to allow snapping into close ios.
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
      let cls = ['tab', link.id];
      if (this.state.currentTab == link.id) {
        cls.push('active');
      }

      return (
        <li key={link.id} className={cls.join(' ')} data-tab={link.id}>
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

    let connectableIos = {};
    if (this.state.connectableIoType) {
      connectableIos.ioType = this.state.connectableIoType;
    }
    if (this.state.connectableType) {
      connectableIos.type = this.state.connectableType;
    }
    let connectingLine = false;
    

    if (this.state.isConnectingComponents) {
      cls.push('connecting');

      if (this.state.currentMousePos) {
        let containerRect = this.getContainerRect();
        let rawMouseX = this.state.currentMousePos.x - containerRect.left;
        let rawMouseY = this.state.currentMousePos.y - containerRect.top;

        connectingLine = {
          x1: this.connectingFromIoPos.x - containerRect.left,
          y1: this.connectingFromIoPos.y - containerRect.top,
          x2: rawMouseX,
          y2: rawMouseY
        };


        // Try snapping to a close connectable io.
        let snapSize = this.props.settings.snapSize;
        this.snappedToConnectingIo = false;
        for (let id in this.connectableIos) {
          let io = this.connectableIos[id];
          io.ioComponent.isSnapped = false;
          if (Math.abs(io.left - containerRect.left - rawMouseX) < snapSize && Math.abs(io.top - containerRect.top - rawMouseY) < snapSize) {
            this.snappedToConnectingIo = io;
            // We can't call io.ioComponent.setState because that's not allowed 
            // in a render function in react and will throw an error.
            io.ioComponent.isSnapped = true;
            connectingLine.x2 = io.left - containerRect.left + this.props.settings.ioOffset;
            connectingLine.y2 = io.top - containerRect.top + this.props.settings.ioOffset;
          }
        }
      }
    }





    let connectionLines = React.createElement(ComponentConnectionLines, {
      lines: this.state.connectionLines,
      settings: this.props.settings,
      connectingLine: connectingLine
    });

    let components = React.createElement(ComponentsContainer, {
      settings: this.props.settings,
      connectionLinesComponent: connectionLines,
      connectableIos: connectableIos,
      emitEventToLayout: this.props.emitEventToLayout
    });

    return (
      <ul
        className="column-layout"
      >
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
            {components}
            {connectionLines}
          </div>
        </li>
      </ul>
    );
  }
}

export default DragDropContext(HTML5Backend)(ColumnLayout);