import React from 'react';

import ReactAudioComponentInputs from './ReactAudioComponentInputs.js';
import ReactAudioComponentOutputs from './ReactAudioComponentOutputs.js';

// React components for our audio components.
import Oscillator from './Oscillator.js';
import MidiIn from './MidiIn.js';

export default class ReactAudioComponent extends React.Component {
  constructor(props) {
    super(props);
    props.component.reactContainerComponent = this;

    this.state = {
      inputs: props.component.getInputs(),
      outputs: props.component.getOutputs(),
      canBeDragged: true
    };
  }

  handleChildEvent(type, ev) {
    switch (type) {
      case 'start-connecting':
        this.state.canBeDragged = false;
        break;

      case 'stop-connecting':
        this.state.canBeDragged = true;
    }
  }

  onDragStart(ev) {
    console.log('drag start');
    ev.dataTransfer.setData('text', this.props.component.id);
  }

  render() {
    const { connectDragSource, isDragging } = this.props;
    let component;
    switch (this.props.component.reactComponentType) {
      case 'Oscillator':
        component = (<Oscillator audioComponent={this.props.component} onChildEvent={this.props.component.onChildEvent.bind(this.props.component)} />);
        break;

      case 'MidiIn':
        component = (<MidiIn audioComponent={this.props.component} onChildEvent={this.props.component.onChildEvent.bind(this.props.component)} />);
        break;

      default:
        this.log('ReactAudioComponent::render(): No corresponding reactComponentType was found for component ' + this.props.component.type);
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
        draggable={this.state.canBeDragged}
        onDragStart={this.onDragStart.bind(this)}
      >
        <ReactAudioComponentInputs inputs={this.state.inputs} />
        <h2 className="audio-component-headline">{this.props.component.title}</h2>
        <div className="audio-component-content">
          {component}
        </div>
        <ReactAudioComponentOutputs outputs={this.state.outputs} handleEvent={this.handleChildEvent.bind(this)} />
      </div>
    );
  }
  log(msg) {
    if ('undefined' != typeof console.log) {
      console.log(msg);
    }
  }
}
