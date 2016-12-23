import React from 'react';
import Oscillator from './Oscillator.jsx';
import ComponentsContainer from './ComponentsContainer.jsx';
import ReactAudioComponent from './ReactAudioComponent.jsx';

export default class Column2 extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {





    return (
      <div className="column-content">
        <ComponentsContainer
          settings={this.props.settings}
          emitEventToLayout={this.props.emitEventToLayout}
        />
        <svg className="components-connections" width="100%" height="100%">
          <ComponentConnectionLines
            lines={this.state.connectionLines}
            settings={this.props.settings}
            connectingLine={connectingLine}
          />
        </svg>
      </div>
    );
  }
}