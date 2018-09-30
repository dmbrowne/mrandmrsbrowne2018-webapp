import * as React from 'react';
import { withFirebase } from '../firebase';

const Context = React.createContext({
  documents: {},
  uploads: {},
  subscribeToMediaItem: () => {},
  uploadFile: () => {},
});

class MediaProviderComponent extends React.Component {
	state = {
		documents: {},
		uploads: {},
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

	updateUploadState(ref, progressPercent) {
		this.setState(state => ({
			uploads: {
				...state.uploads,
				[ref]: progressPercent
			}
		}))
	}

	uploadFile = (ref, file) => {
		this.updateUploadState(ref, 0);
		const uploadTask = this.props.firebaseStorage.ref().child(ref).put(file);
		uploadTask.on('state_changed',
			(snapshot) => {
			  const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			  switch (snapshot.state) {
			    case 'paused':
						return this.updateUploadState(ref, 'paused');
			    case 'running':
						if (progressPercent === 100) return;
			      return this.updateUploadState(ref, progressPercent);
			  }
			},
			(error) =>  this.updateUploadState(ref, 'error'),
			() => {
				const newState = {...this.state};
				delete newState[ref];
				this.setState(newState);
			}
		);
	}

	render() {
		return (
			<Context.Provider value={{
				documents: this.state.documents,
				subscribeToMediaItem: this.subscribeToMediaItem,
				uploads: this.state.uploads,
				uploadFile: this.uploadFile,
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
