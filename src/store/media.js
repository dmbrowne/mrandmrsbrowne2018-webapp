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

	updateUploadState({ref, mediaPreview, headline, caption, isVideo}, progressPercent) {
		this.setState(state => ({
			uploads: {
				...state.uploads,
				[ref]: {
					mediaPreview,
					headline,
					caption,
					isVideo,
					progressPercent,
				}
			}
		}))
	}

	uploadFile = ({ref, ...uploadStatusArgs}, file, meta, track = true) => {
		// this.updateUploadState(ref, 0);
		const args = meta ? [file, meta] : [file];
		const uploadItemInfo = { ref, ...uploadStatusArgs };

		const uploadTask = this.props.firebaseStorage.ref().child(ref).put(...args);

		if (track) {
			uploadTask.on('state_changed', (snapshot) => {
				const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				switch (snapshot.state) {
					case 'paused':
						return this.updateUploadState(uploadItemInfo, 'paused');
					case 'running': {
						const uploadState = this.state.uploads[ref];
						if (uploadState && uploadState.progressPercent === 100) return;
						return this.updateUploadState(uploadItemInfo, progressPercent);
					}
				}
			}, (error) =>  this.updateUploadState(uploadItemInfo, 'error'));

			uploadTask.then(() => {
				const newState = {...this.state};
				delete newState[ref];
				this.setState(newState);
			});
		}

		return uploadTask;
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
