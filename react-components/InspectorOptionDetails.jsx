import React from 'react';
import Select from './ui-components/Select.jsx';

export default class InspectorOptionDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.option.id,
      canvasUiInputType: props.option.canvasUiInputType,
      exposableAsInput: props.option.exposableAsInput,
      exposableToCanvasUi: props.option.exposableToCanvasUi,
      exposableToUserUi: props.option.exposableToUserUi
    };
  }

  exposeAsInputChanged(ev) {
    this.setState({
      exposeAsInput: ev.target.checked
    });
    this.props.emitEventToOption('expose-as-input-changed', ev.target.checked);
  }

  showOnCanvasUiChanged(ev) {
    this.setState({
      exposableToCanvasUi: ev.target.checked
    });
    this.props.emitEventToOption('expose-to-canvas-ui-changed', ev.target.checked);
  }

  showOnUserUiChanged(ev) {
    this.setState({
      exposableToUserUi: ev.target.checked
    });
    this.props.emitEventToOption('expose-to-user-ui-changed', ev.target.checked);
  }

  onCanvasUiInputTypeChanged(newInputType) {
    this.props.option.canvasUiInputType = newInputType;
    this.props.component.reactComponent.setState({
      options: this.props.options
    });
  }

  render() {
    let item;
    let canvasUiSettings;

    console.log(this.state);
    if (this.state.exposableToCanvasUi) {
      canvasUiSettings = (
        <div className="component-option-canvas-ui-settings">
          <label>Canvas Ui Input Type</label>
          <Select
            defaultValue={this.state.canvasUiInputType}
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
            disabled={!this.state.exposableAsInput}
          />
          <label htmlFor={this.state.id + '--input'}>Expose as Input</label>
        </li>
        <li>
          <input
            id={this.state.id + '--canvas-ui'}
            type="checkbox"
            onChange={this.showOnCanvasUiChanged.bind(this)}
            title="Show on Canvas Ui"
            disabled={!this.state.exposableToCanvasUi}
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
            disabled={!this.state.exposableToUserUi}
          />
          <label htmlFor={this.state.id + '--user-ui'}>Expose on User Ui</label>
        </li>
      </ul>
    );
  }
}