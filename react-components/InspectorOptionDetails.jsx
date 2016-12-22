import React from 'react';
import Select from './ui-components/Select.jsx';

export default class InspectorOptionDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.option.id,
      canvasUiInputType: props.option.canvasUiInputType,
      exposeAsInput: props.option.exposeAsInput,
      exposeToCanvasUi: props.option.exposeToCanvasUi,
      exposeToUserUi: props.option.exposeToUserUi,
    };

    this.onCanvasUiInputTypeChanged = this.onCanvasUiInputTypeChanged.bind(this);
  }

  componentWillMount() {
    if (!this.props.component.inSidebar) {
      this.props.option.registerChangeCallback(this.onCanvasUiInputTypeChanged);
    }
  }

  componentWillUnmount() {
    this.props.option.unregisterChangeCallback(this.onCanvasUiInputTypeChanged);
  }

  exposeAsInputChanged(ev) {
    this.setState({
      exposeAsInput: {
        exposable: this.state.exposeAsInput.exposable,
        value: !!ev.target.checked,
        inputType: this.state.exposeAsInput.inputType
      }
    });

    //(Un)register the input.
    this.props.component.optionExposeAsInputChanged(!!ev.target.checked, this.props.option);

    // Update state and the dom.
    this.props.component.reactComponent.setState({
      inputs: this.props.component.getInputs()
    });
  }

  showOnCanvasUiChanged(ev) {
    this.props.option.exposeToCanvasUi.value = ev.target.checked;

    this.setState({
      exposeToCanvasUi: {
        exposable: this.state.exposeToCanvasUi.exposable,
        value: ev.target.checked,
        inputType: this.state.exposeToCanvasUi.inputType
      }
    });

    this.props.component.reactComponent.setState({
      options: this.props.component.options
    });
  }

  showOnUserUiChanged(ev) {
    this.setState({
      exposeToUserUi: {
        exposable: this.state.exposeToUserUi.exposable,
        value: ev.target.checked,
        inputType: this.state.exposeToUserUi.inputType
      }
    });
  }

  onChangeCanvasUiInputType(newInputType) {
    // The onChange event handler of the input type dom elemen.
    this.props.option.setCanvasUiInputType(newInputType);
  }

  onCanvasUiInputTypeChanged(optionValue, option) {
    // The callback that gets called from component-option when something changes.
    let newInputType = option.exposeToCanvasUi.inputType;
    let exposeToCanvasUiSettings = this.state.exposeToCanvasUi;
    exposeToCanvasUiSettings.inputType = newInputType;

    this.setState({
      exposeToCanvasUi: exposeToCanvasUiSettings
    });
  }

  render() {
    let item;
    let canvasUiSettings;

    if (true === this.state.exposeToCanvasUi.value) {
      switch (this.props.option.type) {
        case 'choice':
          canvasUiSettings = (
            <div className="component-option-canvas-ui-settings">
              <label className="component-option-canvas-ui-settings-label">as</label>
              <Select
                value={this.state.exposeToCanvasUi.inputType}
                options={this.props.component.getPossibleUiComponentsForOption(this.props.option)}
                onChange={this.onChangeCanvasUiInputType.bind(this)}
              />
            </div>
          );
          break;

        case 'boolean':
          // Since this is a boolean option, we don't need an additional input
          // and use the 'Expose...' input directly.
          break;
      }
    }

    return (
      <ul className="component-option-details">
        <li>
          <input
            id={this.state.id + '--input'}
            type="checkbox"
            onChange={this.exposeAsInputChanged.bind(this)}
            title="Expose input for this option"
            disabled={!this.state.exposeAsInput.exposable}
            checked={this.state.exposeAsInput.value}
          />
          <label htmlFor={this.state.id + '--input'}>Expose as Input</label>
        </li>
        <li>
          <input
            id={this.state.id + '--canvas-ui'}
            type="checkbox"
            onChange={this.showOnCanvasUiChanged.bind(this)}
            title="Show on Canvas Ui"
            disabled={!this.state.exposeToCanvasUi.exposable}
            checked={this.state.exposeToCanvasUi.value}
          />
          <label htmlFor={this.state.id + '--canvas-ui'}>Expose on Canvas Ui</label>
          {canvasUiSettings}
        </li>
        <li>
          <input
            id={this.state.id + '--user-ui'}
            type="checkbox"
            onChange={this.showOnUserUiChanged.bind(this)}
            title="Show on User Ui"
            disabled={!this.state.exposeToUserUi.exposable}
            checked={this.state.exposeToUserUi.value}
          />
          <label htmlFor={this.state.id + '--user-ui'}>Expose on User Ui</label>
        </li>
      </ul>
    );
  }
}