import React from 'react';

export default class ComponentConnectionLines extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lines: props.lines,
      connectingLine: props.connectingLine
    };

    props.container.childComponents.connectionLines = this;
  }

  render() {
    let lines = false;
    let canvas = document.querySelector(this.props.settings.canvasSelector);
    let ioOffset = this.props.settings.ioOffset;

    if (Array.isArray(this.state.lines) && this.state.lines.length > 0) {
      if (!canvas) {
        console.log('No canvas domNode for audio components found. Cannot render connection lines without canvas.getBoundingClientRect().');
        return false;
      }
      let canvasRect = canvas.getBoundingClientRect();

      lines = this.state.lines.map(line => {
        // line.from is the output's componentIO.
        // line.to is the input's componentIO.
        return (
          <line key={line.from.id + '--' + line.to.id}
            className="connection-line"
            x1={line.from.coordinates.left - canvasRect.left + ioOffset}
            y1={line.from.coordinates.top - canvasRect.top + ioOffset}
            x2={line.to.coordinates.left - canvasRect.left + ioOffset}
            y2={line.to.coordinates.top - canvasRect.top + ioOffset}
            strokeWidth="2"
            stroke={this.props.settings.ioConnectionLineColor}
          />);
      });
    }
    else {
      lines = [];
    }

    if (this.state.connectingLine) {
      lines.push((
        <line key="connecting-line"
          x1={this.state.connectingLine.x1}
          y1={this.state.connectingLine.y1}
          x2={this.state.connectingLine.x2}
          y2={this.state.connectingLine.y2}
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