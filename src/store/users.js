import * as React from 'react';
import { withFirebase } from '../firebase';

const Context = React.createContext({
  usersById: {},
  fetching: false,
  getUser: () => {},
  fetchUserIfNonExistent: () => {}
});

class UsersProviderComponent extends React.Component {
	state = {
		usersById: {},
		fetchingUsers: {},
	}

	fetchUserIfNonExistent = (userId) => {
		console.log('fetching')
		if (!this.state.usersById[userId]) {
			this.fetchUserById(userId);
		}
	}

	fetchUserById = (userId) => new Promise((resolve, reject) => {
		this.setState(currentState => ({
			fetchingUsers: {
				...currentState.fetchingUsers,
				[userId]: true,
			}
		}))

		return this.props.firestore.doc(`users/${userId}`).get()
		.then(snapshot => {
			const { id, ref } = snapshot;
			if (!snapshot.exists) {
				resolve(null);
				return;
			}

			const user = { id, ref, ...snapshot.data() };
			this.setState({
				usersById: {
					...this.state.usersById,
					[snapshot.id]: user,
				}
			}, () => resolve(user))
		})
		.catch(reject)
	})

	render() {
		return (
			<Context.Provider value={{
				usersById: this.state.usersById,
				fetchingUsers: this.state.fetchingUsers,
				fetchUserById: this.fetchUserById,
				fetchUserIfNonExistent: this.fetchUserIfNonExistent,
			}}>
				{this.props.children}
			</Context.Provider>
		)
	}
}
export const UsersProvider = withFirebase(UsersProviderComponent);


export function withUsers(Component) {
	return function ComponentWrappedWithFirestore(props) {
		return (
			<Context.Consumer>
				{context => <Component {...props} users={context} />}
			</Context.Consumer>
		)
	}
}
