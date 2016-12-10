import React from 'react';

import { ItemTypes } from '../dnd-constants.js';
import { DropTarget } from 'react-dnd';

const componentTarget = {
  drop(props, monitor) {
    console.log(props);
  }
};

export default class ComponentsContainer extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div className="components-container">
        <svg className="components-connections" width="100%" height="100%">
        </svg>
        <div className="components"></div>
      </div>
    );
  }
}