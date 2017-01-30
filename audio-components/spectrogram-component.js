import AudioComponent from './audio-component.js';
import audioComponentOption from '../component-option.js';

export default class SpectrogramComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Spectrogram');
    this.type = 'spectrogram';

    // Initialize state for this component type.
    this.audioNodes = {};
    this.analyserNode = this.createAnalyser();

    this.fftSize = 2048;


    this.registerInput({
      dataType: 'audio',
      name: 'Audio In',
      audioNode: this.analyserNode
    });

    // Set up available options:
    this.addOption({
      id: 'fft-size',
      label: 'FFT Size',
      type: 'choice',
      choices: this.getFFTSizes.bind(this), // Could be an array or a function.
      value: this.fftSize,
      exposeAsInput: {
        exposable: false,
        value: false
      },
      exposeToCanvasUi: {
        exposable: false,
        value: false
      },
      exposeToUserUi: {
        exposable: false,
        value: false
      },
    }, this.onFFTSizeChanged, this);
  }

  getFFTSizes() {
    return [32, 64, 128, 265, 512, 1024, 2048, 4096, 8192, 16384, 32768];
  }

  onFFTSizeChanged(newFFTSize) {
    if (this.getFFTSizes.indexOf(newFFTSize) < 0) {
      this.log('onFFTSizeChanged(): Invalid size ' + newFFTSize + '.');
      return false;
    }
    this.fftSize = newFFTSize;
  }
}
