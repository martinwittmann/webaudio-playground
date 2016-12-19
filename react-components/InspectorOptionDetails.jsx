import React from 'react';

export default class InspectorOptionDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.option;
  }

  handleEvent(type, args) {}

  exposeAsInputChanged(ev) {
    this.props.emitEventToOption('expose-as-input-changed', ev.target.checked);
  }

  showOnCanvasUiChanged(ev) {

  }

  showOnUserUiChanged(ev) {

  }

  render() {
    let item;

    return (
      <ul className="component-option-details">
        <li>
          <input
            id={this.state.id + '--input'}
            type="checkbox"
            onChange={this.exposeAsInputChanged.bind(this)}
            title="Expose input for this option"
            disabled={this.state.exposablAsInput}
          />
          <label htmlFor={this.state.id + '--input'}>Expose as Input</label>
        </li>
        <li>
          <input
            id={this.state.id + '--canvas-ui'}
            type="checkbox"
            onChange={this.showOnCanvasUiChanged.bind(this)}
            title="Show on Canvas Ui"
            disabled={this.state.exposableToCanvasUi}
          />
          <label htmlFor={this.state.id + '--canvas-ui'}>Expose on Canvas Ui</label>
        </li>
        <li>
          <input
            id={this.state.id + '--user-ui'}
            type="checkbox"
            onChange={this.showOnUserUiChanged.bind(this)}
            title="Show on User Ui"
            disabled={this.state.exposableToUserUi}
          />
          <label htmlFor={this.state.id + '--user-ui'}>Expose on User Ui</label>
        </li>
      </ul>
    );
  }
}