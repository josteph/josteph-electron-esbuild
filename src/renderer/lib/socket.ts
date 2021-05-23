import { MESSAGE_ENUM, PORT } from '@shared/constants';
import ReconnectingWebSocket from 'reconnecting-websocket';

export default (() => {
  let ws: ReconnectingWebSocket;

  function init() {
    if (ws instanceof ReconnectingWebSocket) {
      return ws;
    }

    ws = new ReconnectingWebSocket(`ws://localhost:${PORT}/fetcher`);

    ws.addEventListener('message', event => {
      const msg = JSON.parse(event.data);

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
          console.log(`You are connected! Your session id is ${msg.id}`);
          break;
        default:
          console.log("Unknown message type.");
          break;
      }
    });

    return ws;
  }

  function getInstance() {
    return ws;
  }

  return {
    init,
    getInstance,
  };
})();
