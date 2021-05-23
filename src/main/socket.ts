import WebSocket from 'ws';
import fetch from 'node-fetch';
import { MESSAGE_ENUM, PORT } from '@shared/constants';
import generateUuid from './helpers/uuid';
// import readJson from './helpers/readJson';

type ResponsePayload = {
  type: string;
  url: string;
  body: null | any;
  error: null | string;
}

const app = new WebSocket.Server({
  port: PORT,
});

function heartbeat() {
  this.isAlive = true;
}

app.on('connection', function connection(ws) {
  // @ts-expect-error
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('message', (message) => onMessage(ws, message));

  onConnection(ws);
});

const interval = setInterval(function ping() {
  app.clients.forEach(function each(ws) {
    // @ts-expect-error
    if (ws.isAlive === false) return ws.terminate();

    // @ts-expect-error
    ws.isAlive = false;
    ws.ping(() => {});
  });
}, 30000);

app.on('close', function close() {
  clearInterval(interval);
});

function onConnection(ws: WebSocket) {
  const id = generateUuid();
  const selfMsg = {
    type: MESSAGE_ENUM.SELF_CONNECTED,
    id,
  };

  ws.send(JSON.stringify(selfMsg));
}

async function onMessage(ws: WebSocket, message) {
  let clientMsg;

  try {
    clientMsg = JSON.parse(String(message));
  } catch (e) {
    const payload = {
      type: MESSAGE_ENUM.FAILED_FETCH,
      url: clientMsg.url,
      body: null,
      error: e.message,
    };
  
    ws.send(JSON.stringify(payload));

    return;
  }

  switch (clientMsg.type) {
    case MESSAGE_ENUM.START_FETCH:
      let payload: ResponsePayload;

      try {
        const data = await fetch(clientMsg.url, {
          method: clientMsg.body ? 'post' : 'get',
          body: clientMsg.body ? JSON.stringify(clientMsg.body) : undefined,
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json' 
          },
        }).then((res: Response) => res.json());

        if (data) {
          payload = {
            type: MESSAGE_ENUM.SUCCESS_FETCH,
            url: clientMsg.url,
            body: data,
            error: null,
          };
        } else {
          throw new Error('Fetch succeed with empty data');
        }
      } catch (error) {
        payload = {
          type: MESSAGE_ENUM.FAILED_FETCH,
          url: clientMsg.url,
          body: null,
          error: error.message,
        };
      }

      ws.send(JSON.stringify(payload));
      break;
    default:
      console.log("Unknown message type:", clientMsg.type);
      break;
  }
}