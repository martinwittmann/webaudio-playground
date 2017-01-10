import React from 'react';

import KeyboardOctave from './ui-components/KeyboardOctave.jsx';
import NumberInput from './ui-components/NumberInput.jsx';
import Radios from './ui-components/Radios.jsx';
import Select from './ui-components/Select.jsx';
import Knob from './ui-components/Knob.jsx';


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

  componentDidUpdate() {
    if (this.props.component.inSidebar) {
      return false;
    }

    let reactComponent = this.props.component.reactComponent;
    let container = reactComponent.props.container;

    reactComponent.childComponents.inputs.updateAllIoCoordinates();
    reactComponent.childComponents.outputs.updateAllIoCoordinates();
    container.moveComponentConnectionLines(reactComponent);
  }

  render() {
    let options = this.props.component.options;
    let optionsHtml;

    if (options && !this.props.component.inSidebar) {
      optionsHtml = options.map(option => {
        if (!option.exposeToCanvasUi.value) {
          return false;
        }

        switch (option.exposeToCanvasUi.inputUiComponentType) {
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
            return (
              <li key={option.id}>
                <NumberInput
                  option={option}
                  defaultValue={this.state.optionValues[option.id]}
                  onChange={this.onChange.bind(this)}
                />
              </li>
            );
            break;

          case 'Keyboard':
            let keyboardOctaves = [];
            let startNote = option.exposeToCanvasUi.settings.startNote;
            for (let i=0;i<option.exposeToCanvasUi.settings.octaves;i++) {
              keyboardOctaves.push((
                <KeyboardOctave
                  key={i}
                  startNote={startNote + 12 * i}
                  emitEvent={this.props.component.createAndSendMidiMessage.bind(this.props.component)}
                />
              ));
            }

            return (
              <li
                key={option.id}
                className={'keyboard-content octaves-' + option.exposeToCanvasUi.settings.octaves}
              >
                {keyboardOctaves}
              </li>
            );
            break;

          case 'Knob':
            return (
              <li key={option.id}>
                <Knob
                  option={option}
                  defaultValue={this.state.optionValues[option.id]}
                  onChange={this.onChange.bind(this)}
                />
              </li>
            );
            break;

          case 'TextInput':
          default:
            console.log(option.exposeToCanvasUi);
            console.log('ReactAudioComponentCanvasUi::render(): Unkown input type: ' + option.exposeToCanvasUi.inputUiComponentType);

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