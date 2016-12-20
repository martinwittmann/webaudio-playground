import React from 'react';
import Select from './ui-components/Select.jsx';
import Radios from './ui-components/Radios.jsx';
import KeyboardOctave from './ui-components/KeyboardOctave.jsx';

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
            console.log(radioOptions);

            return (
              <li key={option.id}>
                <Radios
                  option={option}
                  options={radioOptions}
                />
              </li>
            );

          case 'NumberInput':
            break;

          case 'Keyboard':
            return (
              <li
                key={option.id}
                className="keyboard-content octaves-1"
              >
                <KeyboardOctave
                  startNote={60}
                  emitEvent={this.props.component.createAndSendMidiMessage.bind(this.props.component)}
                />
              </li>
            );
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