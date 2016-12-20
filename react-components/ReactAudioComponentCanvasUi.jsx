import React from 'react';
import Select from './ui-components/Select.jsx';

export default class ReactAudioComponentCanvasUi extends React.Component {
  render() {
    console.log('canvasUi render');
    let options = this.props.component.options;
    let optionsHtml = options.map(option => {
      switch (option.canvasUiInputType) {
        case 'Select':
          let options = [];
          if ('function' == option.choices) {
            options = option.choices();
          }
          else {
            options = option.choices;
          }

          return (
            <li key={option.id}>
              <Select
                options={options}
              />
            </li>
          );

        case 'NumberInput':
          break;

        case 'TextInput':
        default:

      }
    });

    return (
      <ul className="audio-component-canvas-ui">
        {optionsHtml}
      </ul>
    );
  }
}