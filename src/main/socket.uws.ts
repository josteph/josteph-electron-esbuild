import uWS from 'uWebSockets.js';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { MESSAGE_ENUM, PORT } from '@shared/constants';
// import readJson from './helpers/readJson';

const generateUuid = () => {
  return [4, 2, 2, 2, 6] // or 8-4-4-4-12 in hex
    .map(group => crypto.randomBytes(group).toString('hex'))
    .join('-');
};

const decoder = new TextDecoder('utf-8');

const SOCKETS = [];

const app = uWS.App();

type ResponsePayload = {
  id: string;
  type: string;
  url: string;
  body: null | any;
  error: null | string;
}

app.ws('/fetcher', {
  /* Options */
  compression: uWS.SHARED_COMPRESSOR,
  maxPayloadLength: 16 * 1024 * 1024,
  idleTimeout: 10,
  /* Handlers */
  open: (ws) => {
    ws.id = generateUuid();

    SOCKETS.push(ws);

    const selfMsg = {
      type: MESSAGE_ENUM.SELF_CONNECTED,
      id: ws.id,
    };
  
    ws.send(JSON.stringify(selfMsg));
  },
  message: async (ws, message) => {
    // Decode message from client
    const clientMsg = JSON.parse(decoder.decode(message));

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
              id: ws.id,
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
            id: ws.id,
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
  },
  drain: (ws) => {
    console.log('[Drain] WebSocket backpressure:', ws.getBufferedAmount());
  },
  close: (ws) => {
    SOCKETS.find((socket, index) => {
      if (socket && socket.id === ws.id) {
        SOCKETS.splice(index, 1);
      }
    });
  }
});

app.listen(PORT, (token) => {
  if (token) {
    console.log('Listening to port ' + PORT);
  } else {
    console.log('Failed to listen to port ' + PORT);
  }
});