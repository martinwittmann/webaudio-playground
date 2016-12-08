export default class AudioComponent {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.id = 123;

    if (!this.audioContext) {
      this.debug('A valid audioContext is needed to create this AudioComponent.');
    }
  }

  createGainNode(volume) {
    let gain = this.audioContext.createGain();
    gain.gain.value = volume;
    return gain;
  }

  createOscillatorNode(waveform, frequency) {
    let osc = this.audioContext.createOscillator();
    osc.type = waveform;
    osc.frequency.value = frequency; 
    return osc;
  }

  isNoteOff(status, data2) {
    return ((status & 0xF0) == 0x80) || ((status & 0xF0) == 0x90 && data2 == 0);
  }

  isNoteOn(status) {
    return (status & 0xF0) == 0x90;
  }

  getStatusByte(data) {
    let statusByte;

    if (data[0] & 0b10000000) {
      // This is a status byte.

      // We store the status byte because some midi devices might send the
      // status byte only if it it different from the last one.
      this.lastStatusByte = statusByte;

      return data[0];
    }
    else {
      // Retrieve the last status byte if this messages did not include one.
      // See Midi spec.
      return this.lastStatusByte;
    }
  }

  midiNoteToFrequency(note) {
    return Math.pow(2, (note - 69) / 12) * 440;
  }

  midiEvent(data) {
    let status = this.getStatusByte(data);
    if (this.isNoteOn(status) && this.handleNoteOn) {
      this.handleNoteOn(data[1], data[2]);
    }
    else if (this.isNoteOff(status) && this.handleNoteOff) {
      this.handleNoteOff(data[1]);
    }
  }

  debug(msg) {
    console.log(msg);
  }
}