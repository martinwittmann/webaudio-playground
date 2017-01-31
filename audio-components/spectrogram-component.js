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
    this.frequencyData = new Uint8Array(this.fftSize);
    //this.analyserNode.getByteFrequencyData(this.frequencyData);
    this.canvasPosX = 0;
    this.lastDraw = 0;


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
    if (now - this.lastDraw < 50) {
      requestAnimationFrame(this.drawSpectrogram.bind(this));
      return;
    }

    this.analyserNode.getByteFrequencyData(this.frequencyData);
    this.canvas2dContext.fillStyle = 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')';
    if (this.canvasPosX > 499) {
      let xOffset = 499 - this.canvasPosX;
      this.canvasPosX = 499;
      let img = this.canvas2dContext.getImageData(0, 0, 500, 300);
      this.canvas2dContext.clearRect(0, 0, 500, 300);
      this.canvas2dContext.putImageData(img, xOffset, 0);
    }

    this.canvas2dContext.fillRect(this.canvasPosX, 0, 1, 300);
    /*
    this.frequencyData.map((row, index) => {
      let brightness = Math.min(row, 255);
      let color = 'rgb(' + brightness + ',' + brightness + ',' + brightness + ')';
      if (this.canvasPosX > 500) {
        let xOffset = 500 - this.canvasPosX;
        this.canvasPosX = 500;
        let current = this.canvas2dContext.getImageData(0, 0, 500, 300);
        this.canvas2dContext.clearRect(0, 0, 500, 300);
        this.canvas2dContext.putImageData(current, xOffset, 0);

      }
      this.canvas2dContext.fillStyle = color;
      this.canvas2dContext.fillRect(this.canvasPosX, index, 1, 1);
    });
    */

    this.canvasPosX++;
    this.lastDraw = now;
    requestAnimationFrame(this.drawSpectrogram.bind(this));
  }
}
