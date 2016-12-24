import React from 'react';

import ReactAudioComponentIos from './ReactAudioComponentIos.jsx';
import ReactAudioComponentCanvasUi from './ReactAudioComponentCanvasUi.jsx';


export default class ReactAudioComponent extends React.Component {
  constructor(props) {
    super(props);
    props.component.reactComponent = this;

    if (props.component.initState) {
      this.state = props.component.initState();
    }
  }

  handleChildEvent(type, ...args) {
    switch (type) {
      case 'start-connecting':
        this.setState({
          canBeDragged: false
        });
        
        let io = args[0];
        this.props.emitEvent('start-connecting', io);
        break;
    }
  }

  parseOutputIdAttribute(id) {
    let parts = id.split('--');

    return {
      componentId: parts[0],
      outputId: parts[1].match(/\d+$/).pop()
    }
  }

  onDragStartComponent(ev) {
    let onCanvas = !this.props.component.inSidebar;

    try {
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.dropEffect = 'none';
      // Firefox does not fire the drag event unless we set some data.
      ev.dataTransfer.setData('text/plain', '');
    }
    catch(e) {
      // According to react-dnd IE does not allow setting a mime type here and
      // will throw an error.
    }

    let dragData = {
      componentId: this.props.component.id,
      dragStartX: ev.pageX,
      dragStartY: ev.pageY,
      lastDragX: onCanvas ? ev.pageX : 0,
      lastDragY: onCanvas ? ev.pageY : 0,
      onCanvas: onCanvas
    }

    window.dragData = dragData;

    this.setState({
      dragData: dragData
    });

    if (!this.props.component.inSidebar) {
      // We prevent showing a dragImage for components on the canvas since we
      // want to directly move it instead of dragging and on drop settinga new position.
      let img = new Image();
      ev.dataTransfer.setDragImage(img, 0, 0);
    }
  }

  onMouseDown(ev) {
    // We need to update the mousePos before dragging, since this is stored
    // globally for all components.
    if (!this.props.component.inSidebar) {
      this.props.container.mousePos.x = ev.pageX;
      this.props.container.mousePos.y = ev.pageY;
    }
  }

  onDragComponent(ev) {
    if (!this.state.dragData.onCanvas) {
      return true;
    }

    if (ev.pageX == 0 || ev.pageY == 0) {
      // This is the case in firefox.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=505521
      ev.pageX = this.props.container.mousePos.x;
      ev.pageY = this.props.container.mousePos.y;
    }

    let deltaX = ev.pageX - this.state.dragData.lastDragX;
    let deltaY = ev.pageY - this.state.dragData.lastDragY;

    // This is most probably a dirty hack.
    this.state.dragData.lastDragX = ev.pageX;
    this.state.dragData.lastDragY = ev.pageY;

    this.setState({
      canvasPos: {
        x: this.state.canvasPos.x + deltaX,
        y: this.state.canvasPos.y + deltaY
      },
      dragData: this.state.dragData
    });

    this.state.dragData.lastDragX = ev.pageX;
    this.state.dragData.lastDragY = ev.pageY;

    // We use the already calculated position delta and apply it to all ios.
    this.props.container.moveComponentConnectionLines(this, deltaX, deltaY);
  }

  onClickComponent(ev) {
    if (!this.props.component.inSidebar) {
      ev.stopPropagation();
      this.props.container.selectComponent(this);
    }
  }

  moveOnCanvas(pos) {
    this.props.component.canvasPos = pos;
    this.props.component.inSidebar = false;
    
    this.setState({
      canvasPos: pos
    });
  }

  componentDidMount() {
    if (this.props.container) {
      this.props.container.childComponents.connectionLines.setState({
        lines: this.props.container.connectionLines
      });
    }
  }

  render() {
    const { connectDragSource, isDragging } = this.props;

    let inlineStyles = {
      left: Math.round(this.state.canvasPos.x) + 'px',
      top: Math.round(this.state.canvasPos.y) + 'px'
    };

    let cls = ['audio-component', this.props.component.type];
    if (this.props.container && this.props.container.state.selectedComponent == this) {
      cls.push('selected');
    }

    console.log('render');

    return (
      <div
        id={"component-" + this.props.component.id}
        className={cls.join(' ')}
        style={inlineStyles}
        ref={(el) => {
          if (el && !this.props.component.initialBoundingRect) {
            // We store the dom element's coordinates once to be able to position
            // it correctly when it's dragged onto the canvas.
            this.props.component.initialBoundingRect = el.getBoundingClientRect();
          }
        }}
        draggable={this.state.canBeDragged}
        onDragStart={this.onDragStartComponent.bind(this)}
        onDrag={this.onDragComponent.bind(this)}
        onClick={this.onClickComponent.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
      >
        <ReactAudioComponentIos
          ios={this.state.inputs}
          handleEvent={this.handleChildEvent.bind(this)}
          settings={this.props.settings}
          reactAudioComponent={this}
        />
        <h2 className="audio-component-headline">{this.props.component.title}</h2>
        <div className="audio-component-content">
          <ReactAudioComponentCanvasUi component={this.props.component} />
        </div>
        <ReactAudioComponentIos
          ios={this.state.outputs}
          handleEvent={this.handleChildEvent.bind(this)}
          settings={this.props.settings}
          reactAudioComponent={this}
        />
      </div>
    );
  }
  log(msg) {
    if ('undefined' != typeof console.log) {
      console.log(msg);
    }
  }
}
