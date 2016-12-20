export default class audioComponentOptions {
  constructor() {
    this.options = [];
  }

  getOptions() {
    return this.options;
  }

  addOption(data) {
    this.options.push(data);
  }
}