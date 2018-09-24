import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Account from './pages/Account';
import IndexPage from './pages/';

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/me" component={Account} />
        <Route exact path="/signin" component={SignIn} />
        <Route path="/" component={IndexPage} />
      </Switch>
    );
  }
}

export default App;
