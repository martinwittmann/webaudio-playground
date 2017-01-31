import React from 'react';

export default class Spectrogram extends React.Component {
  onClick(ev) {
    ev.stopPropagation();
  }

  render() {
    return (
      <canvas
        className={this.props.className}
        onClick={this.onClick.bind(this)}
        width="500"
        height="300"
      >
      </canvas>
    );
  }
}