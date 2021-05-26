import React from 'react';
import { render } from 'react-dom';
import { MESSAGE_ENUM } from '@shared/constants';
import { postMessageToWSServer, init as initWorker } from '@lib/socket';
import App from './App';

render(<App />, document.getElementById('root'));

initWorker();

setInterval(() => {
  const msg = {
    type: MESSAGE_ENUM.START_FETCH,
    url: `https://jsonplaceholder.typicode.com/todos/${Math.floor(Math.random() * 100) + 1}`,
  };

  postMessageToWSServer(msg);
}, 5000);