import React from 'react';
import ReactAudioComponent from './ReactAudioComponent.js';

export default class ComponentsContainer extends React.Component {
  constructor() {
    super();
  }

  onDragOver(ev) {
    // For some reason this is necessary for the onDrop event to fire.
    // See: http://stackoverflow.com/questions/8414154/html5-drop-event-doesnt-work-unless-dragover-is-handled
    ev.preventDefault();
  }

  onDrop(ev) {
    ev.preventDefault();

    let componentId = ev.dataTransfer.getData('id');
    let component = this.props.settings.emitEvent('get-available-component-by-id', componentId);
    let cursorPosOnDragStart = {
      x: parseFloat(ev.dataTransfer.getData('dragStartX'), 10),
      y: parseFloat(ev.dataTransfer.getData('dragStartY'), 10)
    };

    // Handle the dropping by either adding the component to the canvas or moving it on the canvas.
    let droppedAt = {
      x: ev.pageX,
      y: ev.pageY
    };

    if (component.inSidebar) {
      // Add the component to the canvas at the expected position.

      this.props.settings.emitEvent('add-component', component);

      // Calculate the position where we want to drop the component:
      let posInCompOnDragStart = {
        x: cursorPosOnDragStart.x - component.initialBoundingRect.left,
        y: cursorPosOnDragStart.y - component.initialBoundingRect.top
      };

      let containerRect = document.querySelector(component.canvasSelector).getBoundingClientRect();

      // It's important that we retrieve the node *after* we deleted the original
      // node because otherwise we'd get the original instead of the dropped node.
      let node = document.querySelector('#component-' + component.id);
      component.state.canvasPos.x = droppedAt.x - containerRect.left - posInCompOnDragStart.x;
      component.state.canvasPos.y = droppedAt.y - containerRect.top - posInCompOnDragStart.y;
      component.inSidebar = false; // Mark the component to be shown on the canvas.
    }
    else {
      // Just move the component to the expected position.
      let node = document.querySelector('#component-' + component.id);
      node.style.left = parseFloat(node.style.left) + (droppedAt.x - cursorPosOnDragStart.x) + 'px';
      node.style.top = parseFloat(node.style.top) + (droppedAt.y - cursorPosOnDragStart.y) + 'px';
    }
  }

  render() {
    const { x, y, connectDropTarget, isOver } = this.props;
    let components = this.props.settings.components.map(component => {
      return (<div key={component.id}><ReactAudioComponent component={component} /></div>);
    });

    return (
      <div
        className="components-container"
       >
        <svg className="components-connections" width="100%" height="100%">
        </svg>
        <div
          className="components"
          onDrop={this.onDrop.bind(this)}
          onDragOver={this.onDragOver.bind(this)}
        >
          {components}
        </div>
      </div>
    );
  }
}
