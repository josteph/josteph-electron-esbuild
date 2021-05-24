import React from 'react';
import { render } from 'react-dom';
import { MESSAGE_ENUM } from '@shared/constants';
import App from './App';

render(<App />, document.getElementById('root'));

let worker = new Worker('./worker.js');
const broadcastChannel = new BroadcastChannel('WebSocketChannel');

let webSocketState = WebSocket.CONNECTING;
let sessionId: string;

// Listen to broadcasts from server
function handleMessage(msg) {
  switch (msg.type) {
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
function postMessageToWSServer(message) {
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

broadcastChannel.addEventListener("message", event => {
  switch (event.data.type) {
    case "WSState":
      webSocketState = event.data.state;
      break;
    default:
      break;
  }
});

worker.onmessage = event => {
  handleMessage(event.data);
};

setInterval(() => {
  const msg = {
    type: MESSAGE_ENUM.START_FETCH,
    url: `https://jsonplaceholder.typicode.com/todos/${Math.floor(Math.random() * 100) + 1}`,
  };

  postMessageToWSServer(msg);
}, 5000);