export default class audioComponentOption {
  constructor(data) {
    this.data = data;

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
  }

  setValue(value) {
    this.value = value;

    if ('function' == typeof this.onChange) {
      // Let the AudioComponent class handle the change.
      this.onChange(value);

      // Notify the react component on the canvas.
      this.reactComponent.onOptionChanged();

      // Notify the inspector react component.
      this.inspectorComponent.onOptionChanged();
    }
  }
}