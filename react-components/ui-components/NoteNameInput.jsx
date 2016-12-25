import React from 'react';

export default class NoteNameInput extends React.Component {
  onChange(ev) {
    if ('function' == typeof this.props.onChange) {
      let rawValue = ev.target.value;
      let noteNumber = this.getNoteNumber(rawValue);
      this.props.onChange(false === noteNumber ? rawValue : noteNumber, this.props.option);
    }
  }

  getNoteNumber(value) {
    let parts = value.match(/(.*?)([0-9-]+)/);
    if (value.length < 1 || !Array.isArray(parts) || parts.length > 3) {
      return false;
    }

    let octave = parseInt(parts[2], 10);
    if (octave != value.substr(1) || octave < -1 || octave > 9) {
      return false;
    }

    let noteName = parts[1];
    let noteIndex;

    switch (noteName.toLowerCase()) {
      case 'c':
        noteIndex = 0;
        break;

      case 'c#':
      case 'cis':
      case 'des':
      case 'db':
        noteIndex = 1;
        break;

      case 'd':
        noteIndex = 2;
        break;

      case 'd#':
      case 'dis':
      case 'es':
      case 'eb':
        noteIndex = 3;
        break;

      case 'e':
        noteIndex = 4;
        break;

      case 'f':
        noteIndex = 5;
        break;

      case 'f#':
      case 'fis':
      case 'ges':
      case 'gb':
        noteIndex = 6;
        break;

      case 'g':
        noteIndex = 7;
        break;

      case 'g#':
      case 'gis':
      case 'as':
      case 'ab':
        noteIndex = 8;
        break;

      case 'a':
        noteIndex = 9;
        break;

      case 'a#':
      case 'bb':
        noteIndex = 10;
        break;

      case 'b':
      case 'h':
        noteIndex = 11;
        break;

      default:
        return false;
    }

    return (octave + 1) * 12 + noteIndex;
  }

  getNoteName(noteNumber) {
    let octave = Math.floor(noteNumber / 12) - 1;
    let noteIndex = noteNumber % 12;
    let noteName;
    switch(noteIndex) {
      case 0:
        noteName = 'C';
        break;

      case 1:
        noteName = 'C#';
        break;

      case 2:
        noteName = 'D';
        break;

      case 3:
        noteName = 'D#';
        break;

      case 4:
        noteName = 'E';
        break;

      case 5:
        noteName = 'F';
        break;

      case 6:
        noteName = 'F#';
        break;

      case 7:
        noteName = 'G';
        break;

      case 8:
        noteName = 'G#';
        break;

      case 9:
        noteName = 'A';
        break;

      case 10:
        noteName = 'A#';
        break;

      case 11:
        noteName = 'B';
        break;
    }

    return noteName + octave;
  }

  onClick(ev) {
    ev.stopPropagation();
  }

  render() {
    let value;
    if (isNaN(this.props.defaultValue) || !this.props.defaultValue) {
      value = this.props.defaultValue;
    }
    else {
      value = this.getNoteName(this.props.defaultValue);
    }

    return (
      <input
        value={value}
        onChange={this.onChange.bind(this)}
        onClick={this.onClick.bind(this)}
      />
    );
  }
}