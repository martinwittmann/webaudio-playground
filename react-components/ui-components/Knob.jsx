import React from 'react';

export default class Knob extends React.Component {
  constructor(props) {
    console.log('constr');
    super(props);

    this.knobSize = 35;
    this.strokeWidth = this.knobSize / 15;
    this.buttonColor = '#aaaaaa';
    this.rangeAngle = 280; // The angle between the min and the max points of the knob.
    this.padding = {
      top: 10,
      right: 10,
      bottom: 4,
      left: 10
    };
    this.fullWidth = this.padding.left + this.knobSize + this.padding.right;
    this.fullHeight = this.padding.top + this.knobSize + this.padding.bottom;

    this.minValue = props.min || 0;
    this.maxValue = props.max || 1;
    this.stepSize = props.stepSize || .01;
    // We need to make the scaleFactor depend on the steptsize in order to make
    // the scaling work reasonably for any given stepSize.
    this.mouseScaleFactor = .7 * this.stepSize;

    // Bind all event handlers which will be added to window to this.
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onWindowMouseUp = this.onWindowMouseUp.bind(this);
  }

  onClick(ev) {
    ev.stopPropagation();
  }

  getAngle() {
    // For some reason I don't understand yet, we can't use state here since
    // it does not get a new value, if updated from the inspector.
    let value = this.props.defaultValue;
    let valueRange = this.maxValue - this.minValue;
    let factor = this.rangeAngle / valueRange;
    return (value * factor - this.rangeAngle / 2) * 1;
  }

  getKnobTransform() {
    let angle = this.getAngle();
    let offsetX = (this.knobSize) / 2 + this.padding.left;
    let offsetY = (this.knobSize) / 2 + this.padding.top;
    return 'rotate(' + angle + ' ' + offsetX + ' ' + offsetY + ')';
  }

  onMouseDown(ev) {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onWindowMouseUp);
    this.mousePosY = ev.pageY;

    // Prevent moving the knob from dragging the component around.
    ev.preventDefault();
  }

  onWindowMouseUp(ev) {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);

    // The mouse up event fires before any click events. So this handler is always
    // fired before this.onKnobClick, disregarding whether or not the mouse up
    // happened somewhere on the knob or anywhere outside.
    // If we set this.valueWasChanged = false here and then the onKnobClick handler
    // fires, it doesn't know that this was not a regular click event (without
    // setting a knob value).
    // To prevent this, we only reset this.valueWasChanged if the event fired on
    // the window, which means the mouse button was releases outside the knob
    // because in this case the onKnobClick handler will not be fired.
    if (window === ev.currentTarget) {
      this.valueWasChanged = false;
    }
  }

  onKnobMouseUp(ev) {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);

    ev.stopPropagation();
  }

  onKnobClick(ev) {
    // Prevent selecting the component everytime the knob is moved.
    if (this.valueWasChanged) {
      this.valueWasChanged = false;
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  onMouseMove(ev) {
    let rawValue = (ev.pageY - this.mousePosY) * -1;
    let delta = rawValue * this.mouseScaleFactor;

    if (this.props.logarithmic) {
      let logFactor = 0.004;
      delta = this.props.defaultValue * logFactor * delta;
    }

    // 'Round' the delta to stepSize.
    delta /= this.stepSize;
    delta = Math.round(delta) * this.stepSize;

    this.mousePosY = ev.pageY;
    this.valueWasChanged = true;
    this.setValue(this.props.defaultValue + delta);
  }

  normalizeValue(value) {
    value = parseFloat(value);
    value = Math.max(this.minValue, Math.min(value, this.maxValue));
    return parseFloat(value.toFixed(2));
  }

  setValue(value) {
    value = this.normalizeValue(value);

    if (value != this.props.defaultValue) {
      if ('function' == typeof this.props.onChange) {
        this.props.onChange(value, this.props.option);
      }
    }
  }

  render() {
    let centerX = (this.knobSize) / 2 + this.padding.left;
    let centerY = (this.knobSize) / 2 + this.padding.top;
    let knobRadius = this.knobSize / 2;

    return (
      <div
        className="input-knob"
        onMouseUp={this.onKnobMouseUp.bind(this)}
        onClick={this.onKnobClick.bind(this)}
      >
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
              y1={this.padding.top}
              x2={centerX}
              y2={centerY}
              stroke={this.buttonColor}
              strokeWidth={this.strokeWidth}
            />
          </g>
        </svg>
        <label className="knob-label">
          {this.props.option.label}
        </label>
      </div>
    );
  }
}