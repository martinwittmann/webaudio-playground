import React from 'react';

export default class KeyboardOctave extends React.Component {
  onClick(ev) {
    // We need to stop bubbling up for key clicks because otherwise playing a
    // note would select the component.
    ev.stopPropagation();
  }

  onMouseDown(ev) {
    this.props.emitEvent('note-on', parseInt(ev.target.dataset.key, 10));
    ev.preventDefault();
  }

  onMouseUp(ev) {
    this.props.emitEvent('note-off', parseInt(ev.target.dataset.key, 10));
    ev.preventDefault();
  }

  render() {
    let {startNote, additionalC } = this.props;
    let octave = Math.floor(startNote / 12);
    let cls = ['keyboard-keys octave-' + octave];

    if (additionalC) {
      additionalC = (
        <li
          key={startNote + 12}
          id={startNote + 12}
          className="key note-c"
          data-key={startNote + 12}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >C{octave}</li>);
      cls.push('additionalC');
    }

    return (
      <ul className={cls.join(' ')}>
        <li
          key={startNote}
          id={startNote}
          className="key note-c"
          data-key={startNote}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >C{octave}</li>
        <li
          key={startNote + 1}
          id={startNote + 1}
          className="key key-black note-cis"
          data-key={startNote + 1}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >Cis{octave}</li>
        <li
          key={startNote + 2}
          id={startNote + 2}
          className="key note-d"
          data-key={startNote + 2}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >D{octave}</li>
        <li
          key={startNote + 3}
          id={startNote + 3}
          className="key key-black note-dis"
          data-key={startNote + 3}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >Dis{octave}</li>
        <li
          key={startNote + 4}
          id={startNote + 4}
          className="key note-e"
          data-key={startNote + 4}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >E{octave}</li>
        <li
          key={startNote + 5}
          id={startNote + 5}
          className="key note-f"
          data-key={startNote + 5}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >F{octave}</li>
        <li
          key={startNote + 6}
          id={startNote + 6}
          className="key key-black note-fis"
          data-key={startNote + 6}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >Fis{octave}</li>
        <li
          key={startNote + 7}
          id={startNote + 7}
          className="key note-g"
          data-key={startNote + 7}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
        >G{octave}</li>
        <li
          key={startNote + 8}
          id={startNote + 8}
          className="key key-black note-gis"
          data-key={startNote + 8}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >Gis{octave}</li>
        <li
          key={startNote + 9}
          id={startNote + 8}
          className="key note-a"
          data-key={startNote + 9}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >A{octave}</li>
        <li
          key={startNote + 10}
          id={startNote + 10}
          className="key key-black note-ais"
          data-key={startNote + 10}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >Ais{octave}</li>
        <li
          key={startNote + 11}
          id={startNote + 11}
          className="key note-b"
          data-key={startNote + 11}
          onClick={this.onClick.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
        >Ais{octave}</li>
        {additionalC}
      </ul>
    );
  }
}
