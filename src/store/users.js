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

	userFetch = {};

	componentDidMount() {
		this.props.firebaseAuth.onAuthStateChanged(user => {
			if (user) {
				this.props.firestore.doc(`users/${user.uid}`).get().then(doc => {
					this.setState({
						usersById: {
							...this.state.usersById,
							[user.uid]: {
								id: doc.id,
								ref: doc.ref,
								...doc.data(),
							}
						}
					})
				})
			}
		})
	}

	fetchUserIfNonExistent = (userId) => {
		if (!this.state.usersById[userId]) {
			this.fetchUserById(userId);
		}
	}

	fetchUserById = (userId) => {
		if (this.userFetch[userId]) {
			return;
		}

		this.userFetch[userId] = this.props.firestore
			.doc(`users/${userId}`)
			.onSnapshot(snapshot => {
				const { id, ref } = snapshot;
				if (!snapshot.exists) {
					return;
				}
				
				const user = { id, ref, ...snapshot.data() };
				this.setState(currentState => ({
					usersById: {
						...currentState.usersById,
						[snapshot.id]: user,
					},
				}))
				this.userFetch[userId]();
				this.userFetch[userId] = null;
			})
	}

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
