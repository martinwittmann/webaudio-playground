import React from 'react';

export default class Knob extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value : props.defaultValue
    };

    this.minValue = props.min || 0;
    this.maxValue = props.max || 1;
    this.knobSize = 40;
    this.strokeWidth = this.knobSize / 15;
    this.buttonColor = '#ccc';
    this.rangeAngle = 280; // The angle between the min and the max points of the knob.

    this.mouseScaleFactor = .5;

    this.onMouseMove = this.onMouseMove.bind(this);
  }

  onChange(ev) {
    if ('function' == typeof this.props.onChange) {
      this.props.onChange(ev.target.value, this.props.option);
    }
  }

  onClick(ev) {
    ev.stopPropagation();
  }

  getAngle() {
    let value = Math.max(this.minValue, Math.min(this.state.value, this.maxValue));
    let valueRange = this.maxValue - this.minValue;
    let factor = this.rangeAngle / valueRange;
    return value * factor - this.rangeAngle / 2;
  }

  getKnobTransform() {
    let angle = this.getAngle();
    let offset = this.knobSize / 2 + this.strokeWidth;
    return 'rotate(' + angle + ' ' + offset + ' ' + offset + ')';
  }

  onMouseDown(ev) {
    this.containerDomNode.addEventListener('mousemove', this.onMouseMove, true);
    this.mousePosX = ev.pageX;

    ev.preventDefault();
    ev.stopPropagation();
    return false;
  }

  onMouseUp(ev) {
    console.log('removeEventListener');
    this.containerDomNode.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove(ev) {
    let xOffset = ev.pageX - this.mousePosX;
    console.log(xOffset);
    this.setState({
      value: this.state.value + xOffset * this.mouseScaleFactor
    });
  }

  render() {
    return (
      <div
        className="input-knob"
        ref={el => {
          this.containerDomNode = el;
        }}
      >
        <input type="hidden" value={this.state.value} />
        <svg className="input-svg">
          <g
            className="knob"
            transform={this.getKnobTransform()}
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            ref={el => {
              this.domNode = el;
            }}
          >
            <circle
              cx={this.knobSize / 2 + this.strokeWidth}
              cy={this.knobSize / 2 + this.strokeWidth}
              r={this.knobSize / 2}
              fill="transparent"
              stroke={this.buttonColor}
              strokeWidth={this.strokeWidth}
            />
            <line
              x1={this.knobSize / 2 + this.strokeWidth}
              y1={this.strokeWidth}
              x2={this.knobSize / 2 + this.strokeWidth}
              y2={this.knobSize / 2 + this.strokeWidth}
              stroke={this.buttonColor}
              strokeWidth={this.strokeWidth}
            />
          </g>
        </svg>
      </div>
    );
  }
}