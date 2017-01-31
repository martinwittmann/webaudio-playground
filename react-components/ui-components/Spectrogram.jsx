import React from 'react';

export default class Spectrogram extends React.Component {
  onClick(ev) {
    ev.stopPropagation();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <canvas
        className={this.props.className}
        onClick={this.onClick.bind(this)}
        width="500"
        height="800"
        ref={(el) => {
          if (el) {
            this.props.option.setValue(el.getContext('2d'));
          }
        }}
      >
      </canvas>
    );
  }
}