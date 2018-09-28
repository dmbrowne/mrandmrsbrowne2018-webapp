import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withFirebase } from '../firebase';
const defaultState = {
	user: null,
}

const Context = React.createContext({ ...defaultState })
export default Context;

class AuthContextProvider extends React.Component {
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
		if (this.state.fetchingUser) {
			return <CircularProgress />
		}

		return (
			<Context.Provider value={this.state}>
				{this.props.children}
			</Context.Provider>
		)
	}
}
export const AuthProvider = withFirebase(AuthContextProvider);

export function withAuth(Component) {
	return function ComponentWrappedWithFirestore(props) {
		return (
			<Context.Consumer>
				{context => <Component {...props} auth={context} />}
			</Context.Consumer>
		)
	}
}
