import React, { Component, PropTypes } from 'react';
import { ItemTypes } from '../dnd-constants.js';
import { DragSource } from 'react-dnd';

import Oscillator from './Oscillator.js';

const audioComponentSource = {
  beginDrag(props) {
    return {
      audioComponent: props.component
    };
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class AudioComponent extends React.Component {
  log(msg) {
    if ('undefined' != typeof console.log) {
      console.log(msg);
    }
  }
  render() {
    const { connectDragSource, isDragging } = this.props;
    let component;
    switch (this.props.component.reactComponent) {
      case 'Oscillator':
        component = connectDragSource(<div><Oscillator audioComponent={this.props.component} onChildEvent={this.props.component.onChildEvent.bind(this.props.component)} /></div>);
        break;

      default:
        console.log(this.props.component);
        this.log('AudioComponent::render(): No corresponding reactComponent was found for component ' + this.props.component.type);
        return false;
    }

    return (<div id={"component-" + this.props.component.id} className="component">{component}</div>);
  }
}

AudioComponent.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

export default DragSource(ItemTypes.AUDIOCOMPONENT, audioComponentSource, collect)(AudioComponent);