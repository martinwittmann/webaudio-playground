import AudioComponent from './audio-component.js';

export default class MidiInComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Midi In');
    this.type = 'midi-in';

    this.midiAccess = false;
    this.midiInputs = [];

    // Set up available options,
    this.addOption({
      id: 'midi-in',
      label: 'Midi In',
      type: 'choice',
      choices: this.getMidiInputs.bind(this), // Could be an array or a function.
      value: '',
      exposeAsInput: {
        exposable: false,
        value: false
      },
      exposeToCanvasUi: {
        exposable: true,
        value: true,
        inputIoComponentType: 'Select'
      },
      exposeToUserUi: {
        exposable: true,
        value: false,
        inputIoComponentType: 'Select'
      },
    }, this.onMidiInChanged, this);

    // Initialized webaudio midi and add all midi inputs as component inputs.
    this.initMidiAccess(this.onMidiAvailable.bind(this), this.onNoMidi.bind(this));
  }

  onMidiAvailable(midiAccess) {
    this.midiAccess = midiAccess;

    for (let input of midiAccess.inputs) {
      this.midiInputs.push({
        id: input[1].id,
        name: input[1].name,
        manufacturer: input[1].manufacturer,
      });
    }

    if (this.reactComponent) {
      this.reactComponent.setState({
        midiInputs: this.getMidiInputs()
      });
    }
  }

  onNoMidi(msg) {
    this.log('No midi available: ' + msg);
    if ('function' == this.onMidiAccessDone) {
      this.onMidiAccessDone();
    }
  };

  getMidiInputs() {
    let result = [];
    this.midiInputs.map(input => {
      result.push({
        name: input.name,
        value: input.id
      });
    });
    return result;
  }

  onMidiInChanged(id) {
    this.stop(); // Stop everything that's currently playing.

    if (this.midiIn) {
      // Unset existing midi event handler.
      this.midiAccess.inputs.get(this.midiIn).onmidimessage = undefined;
    }

    // Determine whether there is an input already.
    // This must be done *before* we set the the midiIn because we need the
    // current/old id to be able to find the input.
    let outputIndex = this.getIoIndex('outputs', {id: 'midi-in-' + this.midiIn});

    // Set the midi input.
    this.midiIn = id;
    let input = this.midiAccess.inputs.get(id);
    if (input && 'undefined'!= input.onmidimessage) {
      input.onmidimessage = this.onMidiMessage.bind(this);
    }

    // Add / update the component's input.
    if (outputIndex > -1) {
      // Update the input.
      this.updateOutput(outputIndex, {
        dataType: 'midi',
      });
    }
    else {
      this.registerOutput({
        dataType: 'midi',
        name: input.name
      });
    }
  }

  onMidiMessage(midiEvent) {
    if (this.outputs.length > 0) {
      // This component only supports 1 output. This output is only available if
      // a valid midi input was selected, which is handled by sendToOutput.
      this.sendToOutput(0, midiEvent.data);
    }
  }
}
