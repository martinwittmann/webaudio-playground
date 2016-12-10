import React from 'react';
import Oscillator from './Oscillator.js';

export default class AudioComponent extends React.Component {
  debug(msg) {
    if ('undefined' != typeof console.log) {
      console.log(msg);
    }
  }
  render() {
    switch (this.props.component.reactComponent) {
      case 'Oscillator':
        return (<Oscillator audioComponent={this.props.component} onChildEvent={this.props.component.onChildEvent.bind(this.props.component)} />);

      default:
        console.log(this.props.component);
        this.debug('AudioComponent::render(): No corresponding reactComponent was found for component ' + this.props.component.type);
        return false;
    }
  }
}