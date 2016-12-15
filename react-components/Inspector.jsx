import React from 'react';

export default class Inspector extends React.Component {
  render() {
    let selection = this.props.selection;
    let id = selection ? selection.props.component.id : 'none selected';
    return (
      <div className="inspector">
        {id}
      </div>
    );
  }
}