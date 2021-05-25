import { PORT } from '@shared/constants';
import ReconnectingWebSocket from 'reconnecting-websocket';

const _self: Worker = self as any;

const ws = new ReconnectingWebSocket(`ws://localhost:${PORT}/fetcher`);

_self.onmessage = function (e) {
  ws.send(JSON.stringify(e.data));
}

const getWSState = () => _self.postMessage({ type: "WSState", state: ws.readyState });

ws.onopen = getWSState;
ws.onclose = getWSState;

ws.onmessage = event => {
  const msg = JSON.parse(event.data);
  _self.postMessage(msg);
};