import AudioComponent from './audio-component.js';

export default class Midi2FrequencyComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Midi to Frequency');

    this.type = 'midi-2-frequency';

    this.registerInput({
      dataType: 'midi',
      name: 'Midi In',
      receiveDataCallback: this.handleMidiInput.bind(this),
    });

    this.registerOutput({
      dataType: 'number',
      name: 'Frequency out',
    });
  }

  mapVelocityToGain(veloctiy) {
    return (veloctiy / 127) * .5;
  }

  midiNoteToFrequency(note) {
    return Math.pow(2, (note - 69) / 12) * 440;
  }

  handleMidiInput(inputData) {
    let message = inputData[0];
    let outputIndex = 0; // This component only supports 1 output, so we can hard-code it.
    let data = false;

    if (this.isNoteOn(message[0])) {
      data = {
        frequency: this.midiNoteToFrequency(message[1]),
        gain: this.mapVelocityToGain(message[2])
      };
    }
    else if (this.isNoteOff(message[0], message[1])) {
      data = {
        frequency: this.midiNoteToFrequency(message[1]),
        gain: 0
      };
    }

    if (data && this.outputs.length > 0) {
      this.sendToOutput(outputIndex, data);
    }
  }
}
