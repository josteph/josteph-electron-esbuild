import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import Searchbar from '@components/Searchbar';
import HomePage from './Home';
import BlogPage from './Blog';

function Routes() {
  return (
    <HashRouter>
      <Searchbar />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/blog/:slug" component={BlogPage} />
      </Switch>
    </HashRouter>
  );
}

export default Routes;
