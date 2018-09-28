import * as React from 'react';
import { withFirebase } from '../firebase';

const Context = React.createContext({
  documents: {},
  subscribeToMediaItem: () => {}
});

class MediaProviderComponent extends React.Component {
	state = {
		documents: {},
	}

	unsubscribers = {}

	subscribeToMediaItem = (mediaRef) => {
		if (this.unsubscribers[mediaRef.id]) {
			return;
		}
		this.unsubscribers[mediaRef.id] = mediaRef.onSnapshot(snapshot => {
			const { id, ref } = snapshot;
			this.setState({
				documents: {
					...this.state.documents,
					[id]: { id, ref, ...snapshot.data() }
				}
			})
		})
	}

	render() {
		return (
			<Context.Provider value={{
				documents: this.state.documents,
				subscribeToMediaItem: this.subscribeToMediaItem,
			}}>
				{this.props.children}
			</Context.Provider>
		)
	}
}
export const MediaProvider = withFirebase(MediaProviderComponent);


export function withMedia(Component) {
	return function ComponentWrappedWithFirestore(props) {
		return (
			<Context.Consumer>
				{context => <Component {...props} media={context} />}
			</Context.Consumer>
		)
	}
}
