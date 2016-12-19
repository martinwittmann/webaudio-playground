import React from 'react';
import Inspector from './Inspector.jsx';
import Column2 from './Column2.jsx';
import ComponentsAvailable from './ComponentsAvailable.jsx';

// Drag & drop stuff.
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'

// All React components corresponding to audio components.
//import Oscillator from './Oscillator.jsx';


class ColumnLayout extends React.Component {
  constructor() {
    super();

    this.state = {
      currentTab: 'add-components',
      selection: false
    };

    window.addEventListener('onKeyDown', this.onAppKeyPress.bind(this), true);
  }

  onTabButtonClick(ev) {
    this.setState({
      currentTab: ev.target.dataset.tab
    });
  }

  showNextTab() {
    let nextTabNode = document.querySelector('.tab-links > .' . this.state.currentTab).nextSibling;
    this.onTabButtonClick({
      target: {
        dataset: {
          tab: nextTabNode.dataset.tab
        }
      }
    });
  }

  showPreviousTab() {
    let nextTabNode = document.querySelector('.tab-links > .' . this.state.currentTab).previousSibling;
    this.onTabButtonClick({
      target: {
        dataset: {
          tab: nextTabNode.dataset.tab
        }
      }
    });
  }

  onAppKeyPress(ev) {
    
    console.log(ev.keyCode);
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
          selection: args[0],
          currentTab: 'inspector'
        });
        break;

      case 'component-unselected':
        this.setState({
          selection: false,
          currentTab: 'add-components'
        });
        break;

      case 'expose-as-input-changed':
        console.log(this.state);
        console.log(args);
        if (!this.state.selection) {
          return false;
        }
        this.state.selection.props.component.optionExposeAsInputChanged();
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
      let cls = ['tab', 'add-components'];
      if (this.state.currentTab == link.id) {
        cls.push('active');
      }

      return (
        <li key={link.id} className={cls.join(' ')}>
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
            selection={this.state.selection}
          />
        );
        break;
    }

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
          <Column2
            settings={this.props.settings}
            emitEventToLayout={this.handleEvent.bind(this)}
          />
        </li>
      </ul>
    );
  }
}

export default DragDropContext(HTML5Backend)(ColumnLayout);