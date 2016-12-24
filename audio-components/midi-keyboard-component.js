import AudioComponent from './audio-component.js';
import audioComponentOption from '../component-option.js';

export default class MidiKeyboardComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Midi Keyboard');
    
    this.type = 'midi-keyboard';

    this.registerOutput({
      dataType: 'midi',
      name: 'Midi Out'
    });

    this.veloctiy = 127;

    this.options.push(new audioComponentOption({
      id: 'keyboard',
      label: 'Keyboard',
      type: 'boolean',
      value: true,
      exposeAsInput: {
        exposable: false,
        value: false
      },
      exposeToCanvasUi: {
        exposable: true,
        value: true,
        inputType: 'Keyboard'
      },
      exposeToUserUi: {
        exposable: true,
        value: false,
        inputType: 'Keyboard'
      }
    }, this.onShowKeyboardChanged, this));
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
    message.push(this.veloctiy);
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

  onShowKeyboardChanged(ev) {

  }
}
