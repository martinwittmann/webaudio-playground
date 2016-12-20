import React from 'react';
import Select from './ui-components/Select.jsx';
import Radios from './ui-components/Radios.jsx';
import KeyboardOctave from './ui-components/KeyboardOctave.jsx';

export default class ReactAudioComponentCanvasUi extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      optionValues: {}
    };
    this.optionChangedCallback = this.optionChanged.bind(this)

    props.component.options.map(option => {
      this.state.optionValues[option.id] = option.getValue();
      option.registerChangeCallback(this.optionChangedCallback);
    });
  }

  optionChanged(newValue, option) {
    let newOptionValues = this.state.optionValues;
    newOptionValues[option.id] = newValue;

    this.setState({
      optionValues: newOptionValues
    });
  }

  componentWillUnmount() {
    this.props.component.options.map(option => {
      option.unregisterChangeCallback(this.optionChangedCallback);
    });
  }

  render() {
    let options = this.props.component.options;
    let optionsHtml;

    if (options) {
      optionsHtml = options.map(option => {
        if (!option.exposeToCanvasUi.value) {
          return false;
        }

        switch (option.exposeToCanvasUi.inputType) {
          case 'Select':
            return (
              <li key={option.id}>
                <Select
                  option={option}
                  options={option.getChoices()}
                  value={this.state.optionValues[option.id]}
                />
              </li>
            );

          case 'Radios':
            return (
              <li key={option.id}>
                <Radios
                  option={option}
                  options={option.getChoices()}
                  value={this.state.optionValues[option.id]}
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
      <ul className="audio-component-canvas-ui" ref="">
        {optionsHtml}
      </ul>
    );
  }
}