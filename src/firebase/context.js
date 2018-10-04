import React from 'react';

const Context = React.createContext({
	firestore: {},
	firebase: {},
	firebaseStorage: {},
	firebaseFunctions: {},
	firebaseAuth: {},
	firebaseUI: {},
})

export function withFirebase(Component) {
	return function ComponentWrappedWithFirebase(props) {
		return (
			<Context.Consumer>
				{({ firebase, firestore, firebaseStorage, firebaseFunctions, firebaseAuth, firebaseUI }) =>
					<Component
						{...props}
						firebase={firebase}
						firestore={firestore}
						firebaseStorage={firebaseStorage}
						firebaseFunctions={firebaseFunctions}
						firebaseAuth={firebaseAuth}
						firebaseUI={firebaseUI}
					/>
				}
			</Context.Consumer>
		)
	}
}

export default Context
