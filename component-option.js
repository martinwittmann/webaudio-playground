  export default class audioComponentOption {
  constructor(data, allOptions, changeCallback, changeCallbackThis) {
    this.onChangeCallbacks = [];
    this.onConditionChangedCallbacks = [];
    this.allOptions = allOptions;

    // Default options.
    this.logarithmic = false;

    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }

    if ('function' ==  typeof changeCallback) {
      this.registerChangeCallback(changeCallback, changeCallbackThis);
    }

    if ('undefined' == typeof this.conditions) {
      this.conditions = {};
    }

    for (let optionId in this.conditions) {
      let option = this.getOption(optionId);
      option.registerChangeCallback(this.conditionChanged, this);
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

  registerConditionChangedCallback(callback, callbackThis) {
    if ('function' == typeof callback) {
      return this.onConditionChangedCallbacks.push({
        callback: callback,
        bindTo: callbackThis
      });
    }
    else {
      console.log('registerConditionChangedCallback called with invalid callback', callback);
      console.trace();
    }

    return false;
  }

  unregisterConditionChangedCallback(index) {
    if ('function' == typeof index) {
      var callback = index;
      index = -1;

      for (let i=0;i<this.onConditionChangedCallbacks.length;i++) {
        if (this.onConditionChangedCallbacks[i].callback == callback) {
          index = i;
          break;
        }
      }
    }

    if (index > -1) {
      this.onConditionChangedCallbacks.splice(index, 1);
    }
  }

  setValue(value) {
    this.value = value;
    this.notifyChangeCallbacks();
  }

  setCanvasUiInputType(newInputType) {
    this.exposeToCanvasUi.inputUiComponentType = newInputType;
    this.notifyChangeCallbacks();
  }

  notifyChangeCallbacks() {
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

  updateSetting(set, setting, value) {
    if ('undefined' == typeof this[set].settings[setting]) {
      return false;
    }

    this[set].settings[setting] = value;
    this.notifyChangeCallbacks();
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

  doShowOption() {
    return this.exposeToCanvasUi.value && this.conditionsAreMet();
  }

  conditionsAreMet() {
    for (let optionId in this.conditions) {
      let value = this.conditions[optionId];
      let option = this.getOption(optionId);
      if (!option) {
        console.log('conditionsAreMet(): Could not find option with id ' + optionId);
        continue;
      }

      if ((Array.isArray(value) && -1 === value.indexOf(option.getValue())) || option.getValue() != value) {
        return false;
      }
    }

    return true;
  }

  conditionChanged() {
    this.onConditionChangedCallbacks.map(callback => {
      callback.callback.apply(callback.bindTo, [this.value, this]);
    });
  }

  getOption(id) {
    for (let i=0;i<this.allOptions.length;i++) {
      if (id == this.allOptions[i].id) {
        return this.allOptions[i];
      }
    }
    return false;
  }
}