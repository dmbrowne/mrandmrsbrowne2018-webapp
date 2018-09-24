import React from 'react';

const Context = React.createContext({
	firestore: {},
	firebase: {},
	firebaseStorage: {},
})

export function withFirebase(Component) {
	return function ComponentWrappedWithFirebase(props) {
		return (
			<Context.Consumer>
				{({ firebase, firestore, firebaseStorage }) =>
					<Component
						{...props}
						firebase={firebase}
						firestore={firestore}
						firebaseStorage={firebaseStorage}
					/>
				}
			</Context.Consumer>
		)
	}
}

export default Context
