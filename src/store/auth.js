import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withFirebase } from './firebase';
const defaultState = {
	user: null,
}

const Context = React.createContext({ ...defaultState })
export default Context;

class AuthContext extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			...defaultState,
			fetchingUser: true,
		}

		this.props.firebase.auth().onAuthStateChanged(user => {
			if (user) {
				this.setState({ user, fetchingUser: false })
			} else {
				this.setState({ user: null, fetchingUser: false })
			}
		})
	}

	render() {
		const { Component, LoadingComponent } = this.props;

		if (LoadingComponent && this.state.fetchingUser) {
			return <LoadingComponent />
		}

		return (
			<Component {...this.props} auth={this.state} />
		)
	}
}

export function withAuth(Component, LoadingComponent) {
	return function ComponentWrappedWithFirestore(props) {
		const AuthComponent = withFirebase(AuthContext);
		
		return (
			<Context.Consumer>
				{context => <AuthComponent {...props} Component={Component} LoadingComponent={LoadingComponent} />}
			</Context.Consumer>
		)
	}
}
