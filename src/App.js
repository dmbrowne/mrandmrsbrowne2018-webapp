import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import SignIn from './pages/SignIn';
import IndexPage from './pages/';
import { palette } from './style';

const theme = createMuiTheme({
  palette: {
    primary: { main: palette.navy }, // Purple and green play nicely together.
    secondary: { main: palette.gold }, // This is just green.A700 as hex.
  },
});

class App extends Component {
  render() {
    return (
			<MuiThemeProvider theme={theme}>
				<Switch>
					<Route exact path="/signin" component={SignIn} />
					<Route path="/" component={IndexPage} />
				</Switch>
			</MuiThemeProvider>
    );
  }
}

export default App;
