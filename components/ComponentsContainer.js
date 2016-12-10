import React, { PropTypes } from 'react';

import { ItemTypes } from '../dnd-constants.js';
import { DropTarget } from 'react-dnd';

const componentTarget = {
  drop(props, monitor) {
    console.log(this);
    console.log(props);
    console.log(monitor.getItem());
    let audioComponentId = monitor.getItem().id;
  }
};

function collect(connect, monitor) {
  return {
    abc: 55,
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

    return connectDropTarget(
      <div className="components-container">
        <svg className="components-connections" width="100%" height="100%">
        </svg>
        <div className="components"></div>
      </div>
    );
  }
}


ComponentsContainer.propTypes = {
  isOver: PropTypes.bool.isRequired
};

export default DropTarget(ItemTypes.AUDIOCOMPONENT, componentTarget, collect)(ComponentsContainer);