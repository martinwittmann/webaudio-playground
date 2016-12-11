import React, { Component, PropTypes } from 'react';
import { ItemTypes } from '../dnd-constants.js';
import { DragSource } from 'react-dnd';

import AudioComponentInputs from './AudioComponentInputs.js';

// React components for our audio components.
import Oscillator from './Oscillator.js';
import MidiIn from './MidiIn.js';

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
        component = connectDragSource(<div className="audio-component-content"><Oscillator audioComponent={this.props.component} onChildEvent={this.props.component.onChildEvent.bind(this.props.component)} /></div>);
        break;

      case 'MidiIn':
        component = connectDragSource(<div className="audio-component-content"><MidiIn audioComponent={this.props.component} onChildEvent={this.props.component.onChildEvent.bind(this.props.component)} /></div>);
        break;

      default:
        console.log(this.props.component);
        this.log('AudioComponent::render(): No corresponding reactComponent was found for component ' + this.props.component.type);
        return false;
    }

    return (
      <div
        id={"component-" + this.props.component.id}
        className={"audio-component " + this.props.component.type}
        ref={(el) => {
          if (el && !this.props.component.initialBoundingRect) {
            // We store the dom element's coordinates once to be able to position
            // it correctly when it's dragged onto the canvas.
            this.props.component.initialBoundingRect = el.getBoundingClientRect();
          }
        }}
      >
        <h2 className="audio-component-headline">{this.props.component.title}</h2>

        {component}
      </div>
    );
  }
}

AudioComponent.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

export default DragSource(ItemTypes.AUDIOCOMPONENT, audioComponentSource, collect)(AudioComponent);