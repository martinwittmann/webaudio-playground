import AudioComponent from './audio-component.js';
import audioComponentOption from '../component-option.js';

export default class SpectrogramComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Spectrogram');
    this.type = 'spectrogram';

    // Initialize state for this component type.
    this.audioNodes = {};
    this.analyserNode = this.audioContext.createAnalyser();

    this.fftSize = 2048;


    this.registerInput({
      dataType: 'audio',
      name: 'Audio In',
      audioNode: this.analyserNode
    });

    // Set up available options:
    this.addOption({
      id: 'spectrogram',
      label: 'Spectrogram',
      type: 'none', // We don't render the spectrogram in the inspector.
      value: 0,
      exposeAsInput: {
        exposable: false,
        value: false
      },
      exposeToCanvasUi: {
        exposable: true,
        value: true,
        inputUiComponentType: 'Spectrogram'
      },
      exposeToUserUi: {
        exposable: false,
        value: false
      },
    }, this.onSpectrogramChanged, this);

    this.addOption({
      id: 'fftsize',
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
    let result = [];
    for (let i=5;i<16;i++) {
      result.push({
        name: Math.pow(2, i),
        value: Math.pow(2, i)
      });
    }

    return result;
  }

  onFFTSizeChanged(newFFTSize) {
    newFFTSize = parseInt(newFFTSize, 10);

    if (this.getFFTSizes().map(item => { return item.value }).indexOf(newFFTSize) < 0) {
      this.log('onFFTSizeChanged(): Invalid size ' + newFFTSize + '.');
      return false;
    }
    
    this.fftSize = newFFTSize;
  }

  onSpectrogramChanged(newValue, option) {
    // Nothing to do here.
  }
}
