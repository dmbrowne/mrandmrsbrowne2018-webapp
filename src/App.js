import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import SignIn from './pages/SignIn';
import ConfigureISpy from './pages/ConfigureISpy';
import Admin from './pages/Admin';
import TermsOfService from './pages/ToS';
import PrivacyPolicy from "./pages/PrivacyPolicy";
import IndexPage from './pages/';

function isRunningStandalone() {
  return (window.matchMedia('(display-mode: standalone)').matches);
}

function isRunningOnMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)
  );
}

class App extends Component {
  render() {
    return
      <Switch>
        <Route exact path="/admin" component={Admin} />
        <Route exact path="/games/configure/ispy" component={ConfigureISpy} />
        <Route exact path="/signin" component={SignIn} />
        <Route exact path="/terms" component={TermsOfService} />
        <Route exact path="/privacy" component={PrivacyPolicy} />
        <Route path="/" component={IndexPage} />
      </Switch>;
  }
}

export default App;
