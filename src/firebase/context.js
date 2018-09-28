import React from 'react';

const Context = React.createContext({
	firestore: {},
	firebase: {},
	firebaseStorage: {},
	firebaseFunctions: {},
})

export function withFirebase(Component) {
	return function ComponentWrappedWithFirebase(props) {
		return (
			<Context.Consumer>
				{({ firebase, firestore, firebaseStorage, firebaseFunctions }) =>
					<Component
						{...props}
						firebase={firebase}
						firestore={firestore}
						firebaseStorage={firebaseStorage}
						firebaseFunctions={firebaseFunctions}
					/>
				}
			</Context.Consumer>
		)
	}
}

export default Context
