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
  }

  handleMidiEvent(data) {
    console.log('handleMidiEvent', data);
    if (this.outputs.length > 0) {
      // This component only supports 1 output. This output is only available if
      // a valid midi input was selected, which is handled by sendToOutput.
      this.sendToOutput(0, data);
    }
  }
}
