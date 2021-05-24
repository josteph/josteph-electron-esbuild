import { PORT } from '@shared/constants';
import ReconnectingWebSocket from 'reconnecting-websocket';

// Create a broadcast channel to notify about state changes
const broadcastChannel = new BroadcastChannel("WebSocketChannel");
const ws = new ReconnectingWebSocket(`ws://localhost:${PORT}/fetcher`);

const getWSState = () => broadcastChannel.postMessage({ type: "WSState", state: ws.readyState });

const _self: Worker = self as any;

_self.onmessage = function (e) {
  ws.send(JSON.stringify(e.data));
}

ws.onopen = getWSState;
ws.onclose = getWSState;

ws.onmessage = event => {
  const msg = JSON.parse(event.data);
  _self.postMessage(msg);
};