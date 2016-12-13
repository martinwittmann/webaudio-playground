import AudioComponent from './audio-component.js';

export default class MidiKeyboardComponent extends AudioComponent {
  constructor(audioContext, id) {
    super(audioContext, id, 'Midi Keyboard');

    this.type = 'midi-keyboard';
    this.reactComponentType = 'MidiKeyboard';

    this.registerOutput({
      type: 'midi',
      name: 'Midi Out'
    });

    this.state.veloctiy = 127;
  }

  createMidiMessage(type, note) {
    let message = [];

    switch (type) {
      case 'note-on':
        message.push(144);
        break;

      case 'note-off':
        message.push(128);
        break;

      default:
        console.log('createMidiMessage: Called with unknown type ' + type);
        return false;
    }

    message.push(note);
    message.push(this.state.veloctiy);
    return message;
  }

  createAndSendMidiMessage(type, note) {
    let message = this.createMidiMessage(type, note);

    if (this.outputs.length > 0) {
      // This component only supports 1 output. This output is only available if
      // a valid midi input was selected, which is handled by sendToOutput.
      this.sendToOutput(0, message);
    }
  }
}
