export default class componentConnectionManager {
  constructor() {
    this.connections = [];
  }

  connect(component1, component1Io, component2, component2Io) {
    let fromComponent, fromComponentIo, toComponent, toComponentIo;

    if ('output' == component1Io.ioType) {
      fromComponent = component1;
      fromComponentIo = component1Io;
      toComponent = component2;
      toComponentIo = component2Io;
    }
    else {
      fromComponent = component2;
      fromComponentIo = component2Io;
      toComponent = component1;
      toComponentIo = component1Io;
    }

    this.connections.push({
      id: this.connections.length,
      from: fromComponent,
      fromIo: fromComponentIo,
      to: toComponent,
      toIo: toComponentIo,
      fromCallbacks: {
        connect: fromComponent.getConnectOutputCallback(),
        unconnect: fromComponent.getUnconnectOutputCallback(),
        transmit: fromComponent.getTransmitFromOutputCallback()
      },
      toCallbacks: {
        connect: fromComponent.getConnectInputCallback(),
        unconnect: fromComponent.getUnconnectInputCallback(),
        transmit: fromComponent.getTransmitFromInputCallback()
      }
    });
  }
}