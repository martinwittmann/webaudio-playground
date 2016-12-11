import React, { PropTypes } from 'react';
import AudioComponent from './AudioComponent.js';

import { ItemTypes } from '../dnd-constants.js';
import { DropTarget } from 'react-dnd';

const componentTarget = {
  drop(props, monitor) {
    // Make the app add the component.
    let component = monitor.getItem().audioComponent;

    let originalNode = document.querySelector('#component-' + component.id);
    let originalNodeWidth = Math.round(originalNode.getBoundingClientRect().width);
    originalNode.parentNode.removeChild(originalNode);

    props.settings.emitEvent('add-component', component);

    let node = document.querySelector('#component-' + component.id);

    // Calculate the position where we want to drop the component:

    // These coordinates must be > component.boundingRect since this
    let cursorPosOnDragStart = monitor.getInitialClientOffset();
    let cursorOffsetInsideComponentOnDragStart = {
      x: cursorPosOnDragStart.x - component.initialBoundingRect.left,
      y: cursorPosOnDragStart.y - component.initialBoundingRect.top
    };

    let droppedAt = monitor.getClientOffset();
    let containerRect = document.querySelector(component.canvasSelector).getBoundingClientRect();

    component.inSidebar = false; // Mark the component to be shown on the canvas.

    node.style.left = (droppedAt.x - containerRect.left - cursorOffsetInsideComponentOnDragStart.x) + 'px';
    node.style.top = (droppedAt.y - containerRect.top - cursorOffsetInsideComponentOnDragStart.y) + 'px';
    node.style.width = originalNodeWidth + 'px';
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

class ComponentsContainer extends React.Component {
  constructor() {
    super();
  }
  render() {
    const { x, y, connectDropTarget, isOver } = this.props;
    let components = this.props.settings.components.map(component => {
      return (<div key={component.id}><AudioComponent component={component} /></div>);
    });

    return connectDropTarget(
      <div className="components-container">
        <svg className="components-connections" width="100%" height="100%">
        </svg>
        <div className="components">
          {components}
        </div>
      </div>
    );
  }
}

ComponentsContainer.propTypes = {
  isOver: PropTypes.bool.isRequired
};

export default DropTarget(ItemTypes.AUDIOCOMPONENT, componentTarget, collect)(ComponentsContainer);