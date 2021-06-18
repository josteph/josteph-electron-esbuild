
import { MESSAGE_ENUM } from '@shared/constants';

let worker: Worker;
let webSocketState: number = WebSocket.CONNECTING;
let sessionId: string;

// Listen to broadcasts from server
function handleMessage(msg) {
  switch (msg.type) {
    case 'WSState':
      webSocketState = msg.state;
      break;
    case MESSAGE_ENUM.SUCCESS_FETCH:
      console.groupCollapsed(`[${msg.url}]: fetch success!`);
      console.log(msg.body);
      console.groupEnd();
      break;
    case MESSAGE_ENUM.FAILED_FETCH:
      console.groupCollapsed(`[${msg.url}]: fetch error!`);
      console.error(msg.error);
      console.groupEnd();
      break;
    case MESSAGE_ENUM.SELF_CONNECTED:
      sessionId = msg.id;
      console.log(`You are connected! Your session id is ${sessionId}`);
      break;
    default:
      console.log("Unknown message type.");
      break;
  }
}

// Use this method to send data to the server.
export function postMessageToWSServer(message) {
  if (webSocketState === WebSocket.CONNECTING) {
    console.log("Still connecting to the server, try again later!");
    
    if (worker) {
      worker.terminate();
    }

    worker = new Worker('./worker.js');
  } else if (webSocketState === WebSocket.CLOSING  || webSocketState === WebSocket.CLOSED) {
    console.log("Connection Closed!");
  } else {
    worker.postMessage(message);
  }
}

export function init() {
  if (worker) {
    return worker;
  }

  // worker.js will be generated in the same level as index.js
  worker = new Worker('./worker.js');

  worker.onmessage = event => {
    handleMessage(event.data);
  };

  return worker;
}
