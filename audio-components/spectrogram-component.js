import AudioComponent from './audio-component.js';
import audioComponentOption from '../component-option.js';

export default class SpectrogramComponent extends AudioComponent {
  constructor(app, id) {
    super(app, id, 'Spectrogram');
    this.type = 'spectrogram';

    // Initialize state for this component type.
    this.audioNodes = {};
    this.analyserNode = this.audioContext.createAnalyser();

    this.fftSize = 1024;
    //this.frequencyData = new Uint8Array(this.fftSize);
    //this.analyserNode.getByteFrequencyData(this.frequencyData);
    this.canvasPosX = 0;
    this.lastDraw = 0;
    this.width = 500;
    this.height = 800;

    this.analyserNode.fftSize = this.fftSize


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
    this.analyserNode.fftSize = this.fftSize;
  }

  onSpectrogramChanged(canvas2dContext, option) {
    this.canvas2dContext = canvas2dContext;
    this.startAnimation();
  }

  startAnimation() {
    if (!this.canvas2dContext) {
      return false;
    }

    if (!this.requestedAnimationFrame) {
      requestAnimationFrame(this.drawSpectrogram.bind(this));
    }
  }

  drawSpectrogram() {
    let now = Date.now();
    if (now - this.lastDraw < 1000) {
      requestAnimationFrame(this.drawSpectrogram.bind(this));
      return;
    }

    let frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(frequencyData);

    if (this.canvasPosX > this.width - 1) {
      let xOffset = this.width - 1 - this.canvasPosX;
      this.canvasPosX = this.width - 1;
      let img = this.canvas2dContext.getImageData(0, 0, this.width, this.height);
      this.canvas2dContext.clearRect(0, 0, this.width, this.height);
      this.canvas2dContext.putImageData(img, xOffset, 0);
    }

    frequencyData.map((row, index) => {
      if (0 == row) {
        this.canvas2dContext.clearRect(this.canvasPosX, this.height - index - 1, 1, 1);
        return;
      }
      let brightness = 255 - row; //Math.min(row, 255);
      let color = 'rgb(' + brightness + ',' + brightness + ',' + brightness + ')';
      this.canvas2dContext.fillStyle = color;
      this.canvas2dContext.fillRect(this.canvasPosX, this.height - index - 1, 1, 1);
    });

    this.canvasPosX++;
    this.lastDraw = now;
    requestAnimationFrame(this.drawSpectrogram.bind(this));
  }
}
