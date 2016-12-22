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
  }

  onChange(value, option) {
    // This gets uplifted from child component's dom element onChange event.
    if(!option || !option.setValue) {
      console.log('ReactAudioComponentCanvasUi::onChange(): invalid option parameter: ', option);
      return false;
    }
    option.setValue(value);
  }

  optionChanged(newValue, option) {
    let newOptionValues = this.state.optionValues;
    newOptionValues[option.id] = newValue;

    this.setState({
      optionValues: newOptionValues
    });

    let reactComponent = this.props.component.reactComponent;
    reactComponent.props.container.updateComponentConnectionLines(reactComponent, 0, 0);
  }

  componentWillMount() {
    // Only register to the option changed callback if the component is shown in the canvas.
    if (!this.props.component.inSidebar) {
      this.props.component.options.map(option => {
        this.state.optionValues[option.id] = option.getValue();
        option.registerChangeCallback(this.optionChanged, this);
      });
    }
  }

  componentWillUnmount() {
    if (!this.props.component.inSidebar) {
      this.props.component.options.map(option => {
        option.unregisterChangeCallback(this.optionChanged);
      });
    }
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
                  onChange={this.onChange.bind(this)}
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
                  onChange={this.onChange.bind(this)}
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
                  onChange={this.onChange.bind(this)}
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