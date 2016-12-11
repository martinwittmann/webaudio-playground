import React, { PropTypes } from 'react';
import AudioComponent from './AudioComponent.js';

import { ItemTypes } from '../dnd-constants.js';
import { DropTarget } from 'react-dnd';

const componentTarget = {
  drop(props, monitor) {
    // Make the app add the component.
    let component = monitor.getItem().audioComponent;

    let originalNode = document.querySelector('#component-' + component.id);
    originalNode.parentNode.removeChild(originalNode);

    props.settings.emitEvent('add-component', component);

    let node = document.querySelector('#component-' + component.id);
    let droppedAt = monitor.getClientOffset();
    node.style.borderColor = 'red';
    node.style.left = droppedAt.x + 'px';
    node.style.top = droppedAt.y + 'px';
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