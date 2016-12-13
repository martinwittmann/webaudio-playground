import React from 'react';

export default class ComponentConnectionLines extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let lines = false;
    let canvas = document.querySelector(this.props.settings.canvasSelector);

    if (!canvas) {
      return false;
    }

    let canvasRect = canvas.getBoundingClientRect();
    if (this.props.lines) {
      lines = this.props.lines.map(line => {
        return (
          <line key="1"
            x1={line.from.coordinates.left - canvasRect.left + this.props.settings.ioOffset}
            y1={line.from.coordinates.top - canvasRect.top + this.props.settings.ioOffset}
            x2={line.to.coordinates.left - canvasRect.left + this.props.settings.ioOffset}
            y2={line.to.coordinates.top - canvasRect.top + this.props.settings.ioOffset}
            strokeWidth="2"
            stroke={this.props.settings.ioConnectionLineColor}
          />);
      });
    }
    return (<g className="connection-lines">{lines}</g>);
  }
}