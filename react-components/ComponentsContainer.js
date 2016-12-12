import React, { PropTypes } from 'react';
import ReactAudioComponent from './ReactAudioComponent.js';

import { ItemTypes } from '../dnd-constants.js';
import { DropTarget } from 'react-dnd';

const componentTarget = {
  drop(props, monitor) {
    // Handle the dropping by either adding the component to the canvas or moving it on the canvas.

    let component = monitor.getItem().audioComponent;
    let cursorPosOnDragStart = monitor.getInitialClientOffset();
    let droppedAt = monitor.getClientOffset();

    if (component.inSidebar) {
      // Add the component to the canvas at the expected position.

      let originalNode = document.querySelector('#component-' + component.id);
      let originalNodeWidth = Math.round(originalNode.getBoundingClientRect().width);
      originalNode.parentNode.removeChild(originalNode);

      props.settings.emitEvent('add-component', component);

      // Calculate the position where we want to drop the component:

      // These coordinates must be > component.boundingRect since this
      let cursorPosOnDragStart = monitor.getInitialClientOffset();

      let cursorOffsetInsideComponentOnDragStart = {
        x: cursorPosOnDragStart.x - component.initialBoundingRect.left,
        y: cursorPosOnDragStart.y - component.initialBoundingRect.top
      };


      let containerRect = document.querySelector(component.canvasSelector).getBoundingClientRect();

      // It's important that we retrieve the node *after* we deleted the original
      // node because otherwise we'd get the original instead of the dropped node.
      let node = document.querySelector('#component-' + component.id);
      node.style.left = (droppedAt.x - containerRect.left - cursorOffsetInsideComponentOnDragStart.x) + 'px';
      node.style.top = (droppedAt.y - containerRect.top - cursorOffsetInsideComponentOnDragStart.y) + 'px';
      node.style.width = originalNodeWidth + 'px';

      component.inSidebar = false; // Mark the component to be shown on the canvas.
    }
    else {
      // Just move the component to the expected position.
      let node = document.querySelector('#component-' + component.id);
      node.style.left = parseFloat(node.style.left) + (droppedAt.x - cursorPosOnDragStart.x) + 'px';
      node.style.top = parseFloat(node.style.top) + (droppedAt.y - cursorPosOnDragStart.y) + 'px';
    }
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
      return (<div key={component.id}><ReactAudioComponent component={component} /></div>);
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

export default DropTarget(ItemTypes.REACTAUDIOCOMPONENT, componentTarget, collect)(ComponentsContainer);