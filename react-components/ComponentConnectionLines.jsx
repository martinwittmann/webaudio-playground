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
          <line key={line.outputId + '--' + line.inputId}
            className="connection-line"
            x1={line.from.coordinates[line.outputId].left - canvasRect.left + this.props.settings.ioOffset}
            y1={line.from.coordinates[line.outputId].top - canvasRect.top + this.props.settings.ioOffset}
            x2={line.to.coordinates[line.inputId].left - canvasRect.left + this.props.settings.ioOffset}
            y2={line.to.coordinates[line.inputId].top - canvasRect.top + this.props.settings.ioOffset}
            strokeWidth="2"
            stroke={this.props.settings.ioConnectionLineColor}
          />);
      });
    }

    if (this.props.connectingLine) {
      lines.push((
        <line key="connecting-line"
          x1={this.props.connectingLine.x1}
          y1={this.props.connectingLine.y1}
          x2={this.props.connectingLine.x2}
          y2={this.props.connectingLine.y2}
          strokeWidth="2"
          stroke={this.props.settings.ioConnectionLineColor}
        />
      ));

    }
    return (
      <svg className="components-connections" width="100%" height="100%">
        <g className="connection-lines">{lines}</g>
      </svg>
    );

  }
}