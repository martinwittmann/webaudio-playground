export default class componentIO {
  constructor(data) {
    this.connections = [];

    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
  }

  addConnection(toIo) {
    //this.log('Connecting ' + this.name + ' (' + this.id + ') to ' + toIo.name + ' (' + toIo.id + ')');
    switch (this.type) {
      case 'midi':
      case 'number':
        this.sendDataCallback = toIo.receiveDataCallback;
        break;

      case 'audio':
        this.audioNode.connect(toIo.destination);
        break;
    }

    this.connections.push(toIo);
    // NOTE: We add both objects here even for the connected object so we we don't
    //       need to call/implement toIo.addConnection and find a way to prevent
    //       infinite recursion. They're both of the same class/type so that's ok I guess.
    toIo.connections.push(this);
  }

  removeConnection(toIo) {
    switch (this.type) {
      case 'midi':
      case 'number':
        this.sendDataCallback = false;
        break;

      case 'audio':
        // Disconnect the output node.
        this.audioNode.disconnect(toIo.destination);
        break;
    }


    // Remove the connection to toIo from this.
    let toIoIndex = this.getConnectionIndex(toIo);
    if (-1 == toIoIndex) {
      this.log('componentIO::toIoIndex(): Trying to remove io from this.connections whose index could not be found: ' + toIo.id);
      return false;
    }

    this.connections.splice(toIoIndex, 1);


    // Remove the connection to this from toIo.
    let fromIoIndex = toIo.getConnectionIndex(this);
    if (-1 == fromIoIndex) {
      this.log('componentIO::fromIoIndex(): Trying to remove io from this.connections whose index could not be found: ' + this.id);
      return false;
    }

    toIo.connections.splice(fromIoIndex, 1);
  }
  removeAllConnections() {
    this.connections.map(connection => {
      this.removeConnection(connection);
    });
  }

  getConnectionIndex(io) {
    for (let i=0;i<this.connections.length;i++) {
      if (this.connections[i].id == io.id) {
        return i;
      }
    }

    return -1;
  }

  log(msg) {
    if (console && console.log) {
      console.log(msg);
    }
  }
}