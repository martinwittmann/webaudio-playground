export default class audioComponentOption {
  constructor(data, changeCallback) {
    this.onChangeCallbacks = [];

    this.id = data.id;
    this.label = data.label;
    this.type = data.type;
    this.choices = data.choices;
    this.value = data.value;
    this.onChange = data.onChange;
    this.exposeAsInput = data.exposeAsInput;
    this.exposeToCanvasUi = data.exposeToCanvasUi;
    this.exposeToUserUi = data.exposeToUserUi;
    this.range = data.range;

    if ('function' == changeCallback) {
      this.registerChangeCallback(callback);
    }
  }

  registerChangeCallback(callback) {
    if ('function' == typeof callback) {
      this.onChangeCallbacks.push(callback);
      return this.onChangeCallbacks.length - 1;
    }

    return false;
  }

  unregisterChangeCallback(index) {
    this.onChangeCallbacks.splice(index, 1);
  }

  setValue(value) {
    this.value = value;

    // Notify all subscribed callbacks.
    this.onChangeCallbacks.map(callback => {
      callback(value, this);
    })
  }

  getValue() {
    return this.value;
  }

  getType() {
    return this.type;
  }

  getChoices() {
    if ('function' == typeof this.choices) {
      return this.choices();
    }
    else if (Array.isArray(this.choices)) {
      return this.choices;
    }
    else {
      console.log('audioComponentOption::getChoices: called with invalid type: ' + typeof this.choices + '.');
      return false;
    }
  }
}