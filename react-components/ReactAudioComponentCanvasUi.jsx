import React from 'react';
import Select from './ui-components/Select.jsx';
import Radios from './ui-components/Radios.jsx';

export default class ReactAudioComponentCanvasUi extends React.Component {
  render() {
    let options = this.props.component.options;
    let optionsHtml;

    if (options) {
      optionsHtml = options.map(option => {
        switch (option.exposeToCanvasUi.inputType) {
          case 'Select':
            let selectOptions = [];
            if ('function' == typeof option.choices) {
              selectOptions = option.choices();
            }
            else {
              selectOptions = option.choices;
            }

            return (
              <li key={option.id}>
                <Select
                  options={selectOptions}
                />
              </li>
            );

          case 'Radios':
            let radioOptions = [];
            if ('function' == typeof option.choices) {
              radioOptions = option.choices();
            }
            else {
              radioOptions = option.choices;
            }

            return (
              <li key={option.id}>
                <Radios
                  options={radioOptions}
                />
              </li>
            );

          case 'NumberInput':
            break;

          case 'TextInput':
          default:

        }
      });
    }

    return (
      <ul className="audio-component-canvas-ui">
        {optionsHtml}
      </ul>
    );
  }
}