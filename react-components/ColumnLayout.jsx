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
  }

  onTabButtonClick(ev) {
    console.log(ev.target.dataset);
    this.setState({
      currentTab: ev.target.dataset.tab
    });
  }

  handleEvent(type, ...args) {

    switch (type) {
      case 'component-selected':
        this.setState({
          selection: args[0]
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
            handleEvent={this.handleEvent.bind(this)}
            selection={this.state.selection}
          />
        );
        break;
    }

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