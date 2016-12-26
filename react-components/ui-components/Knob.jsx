import React from 'react';

export default class Knob extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value : props.defaultValue
    };

    this.knobSize = 40;
    this.strokeWidth = this.knobSize / 15;
    this.buttonColor = '#aaaaaa';
    this.rangeAngle = 280; // The angle between the min and the max points of the knob.
    this.padding = {
      top: 10,
      right: 10,
      bottom: 30,
      left: 10
    };
    this.fullWidth = this.padding.left + this.knobSize + this.padding.right;
    this.fullHeight = this.padding.top + this.knobSize + this.padding.bottom;

    this.minValue = props.min || 0;
    this.maxValue = props.max || 1;
    this.mouseScaleFactor = .005;

    // Bind all event handlers which will be added to window to this.
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onWindowMouseUp = this.onWindowMouseUp.bind(this);
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
    return (value * factor - this.rangeAngle / 2) * 1;
  }

  getKnobTransform() {
    let angle = this.getAngle();
    let offsetX = this.knobSize / 2 + this.strokeWidth + this.padding.left;
    let offsetY = this.knobSize / 2 + this.strokeWidth + this.padding.top;
    return 'rotate(' + angle + ' ' + offsetX + ' ' + offsetY + ')';
  }

  onMouseDown(ev) {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onWindowMouseUp);
    this.mousePosY = ev.pageY;
    this.valueWasChanged = true;

    // Prevent moving the knob from dragging the component around.
    ev.preventDefault();
  }

  onWindowMouseUp(ev) {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);
    this.valueWasChanged = false;
  }

  onKnobMouseUp(ev) {
    console.log(ev.type, this.valueWasChanged);
    // Prevent selecting the component everytime the knob is moved.
    if (this.valueWasChanged) {
      this.valueWasChanged = false;
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  onMouseMove(ev) {
    let rawValue = (ev.pageY - this.mousePosY) * -1;
    let newValue = this.state.value + rawValue * this.mouseScaleFactor;

    this.mousePosY = ev.pageY;
    this.setValue(newValue);
  }

  setValue(value) {
    value = Math.max(this.minValue, Math.min(value, this.maxValue));

    if (value != this.state.value) {
      this.setState({
        value
      });
    }
  }

  render() {
    let centerX = (this.knobSize) / 2 + this.strokeWidth + this.padding.left;
    let centerY = (this.knobSize) / 2 + this.strokeWidth + this.padding.top;
    let knobRadius = this.knobSize / 2;

    return (
      <div
        className="input-knob"
        onMouseUp={this.onKnobMouseUp.bind(this)}
      >
        <input type="hidden" value={this.state.value} />
        <svg
          className="input-svg"
          width={this.fullWidth}
          height={this.fullHeight}
        >
          <g
            className="knob"
            transform={this.getKnobTransform()}
            onMouseDown={this.onMouseDown.bind(this)}
            ref={el => {
              this.domNode = el;
            }}
          >
            <circle
              cx={centerX}
              cy={centerY}
              r={knobRadius}
              fill="transparent"
              stroke={this.buttonColor}
              strokeWidth={this.strokeWidth}
            />
            <line
              x1={centerX}
              y1={this.strokeWidth + this.padding.top}
              x2={centerX}
              y2={centerY}
              stroke={this.buttonColor}
              strokeWidth={this.strokeWidth}
            />
          </g>
        </svg>
      </div>
    );
  }
}