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
  }

  exposeAsInputChanged(ev) {
    this.setState({
      exposeAsInput: {
        exposable: this.state.exposeAsInput.exposable,
        value: ev.target.checked,
        inputType: this.state.exposeAsInput.inputType
      }
    });
    this.props.emitEventToOption('expose-as-input-changed', ev.target.checked);
  }

  showOnCanvasUiChanged(ev) {
    this.setState({
      exposeToCanvasUi: {
        exposable: this.state.exposeToCanvasUi.exposable,
        value: ev.target.checked,
        inputType: this.state.exposeToCanvasUi.inputType
      }
    });

    this.props.component.setState({
      options: this.props.component.state.options
    });
    //this.props.emitEventToOption('expose-to-canvas-ui-changed', ev.target.checked);
  }

  showOnUserUiChanged(ev) {
    this.setState({
      exposeToUserUi: {
        exposable: this.state.exposeToUserUi.exposable,
        value: ev.target.checked,
        inputType: this.state.exposeToUserUi.inputType
      }
    });
    this.props.emitEventToOption('expose-to-user-ui-changed', ev.target.checked);
  }

  onCanvasUiInputTypeChanged(newInputType) {
    this.props.option.canvasUiInputType = newInputType;
    console.log(this.props.option.canvasUiInputType);
    console.log(this.props.component);

    this.props.component.reactComponent.setState({
      options: this.props.component.state.options
    });
  }

  render() {
    let item;
    let canvasUiSettings;

    if (true === this.state.exposeToCanvasUi.value) {
      canvasUiSettings = (
        <div className="component-option-canvas-ui-settings">
          <label className="component-option-canvas-ui-settings-label">as</label>
          <Select
            value={this.state.exposeToCanvasUi.inputType}
            options={this.props.component.getPossibleUiComponentsForOption(this.props.option)}
            onChange={this.onCanvasUiInputTypeChanged.bind(this)}
          />
        </div>
      );
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