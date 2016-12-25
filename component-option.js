  export default class audioComponentOption {
  constructor(data, changeCallback, changeCallbackThis) {
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

    if ('function' ==  typeof changeCallback) {
      this.registerChangeCallback(changeCallback, changeCallbackThis);
    }
  }

  destructor() {
    console.log('option destruct ' + this.id);
    this.onChangeCallbacks = [];
  }

  registerChangeCallback(callback, callbackThis) {
    if ('function' == typeof callback) {
      return this.onChangeCallbacks.push({
        callback: callback,
        bindTo: callbackThis
      });
    }
    else {
      console.log('registerChangeCallback called with invalid callback', callback);
      console.trace();
    }

    return false;
  }

  unregisterChangeCallback(index) {
    if ('function' == typeof index) {
      var callback = index;
      index = -1;

      for (let i=0;i<this.onChangeCallbacks.length;i++) {
        if (this.onChangeCallbacks[i].callback == callback) {
          index = i;
          break;
        }
      }
    }

    if (index > -1) {
      this.onChangeCallbacks.splice(index, 1);
    }
  }

  setValue(value) {
    this.value = value;

    // Notify all subscribed callbacks.
    this.onChangeCallbacks.map(callback => {
      callback.callback.apply(callback.bindTo, [value, this]);
    });
  }

  setCanvasUiInputType(newInputType) {
    this.exposeToCanvasUi.inputType = newInputType;

    // Notify all subscribed callbacks.
    this.onChangeCallbacks.map(callback => {
      callback.callback.apply(callback.bindTo, [this.value, this]);
    });
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