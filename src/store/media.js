import * as React from 'react';
import { withFirebase } from '../firebase';
import { withNetwork } from './network';

const Context = React.createContext({
  documents: {},
  uploads: {},
  subscribeToMediaItem: () => {},
	uploadFile: () => {},
	uploadQueueOrder: [],
	uploadQueue: {},
});

class MediaProviderComponent extends React.Component {
	state = {
		documents: {},
		uploads: {},
		uploadQueueOrder: [],
		uploadQueue: {},
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

	componentDidUpdate(prevProps) {
		if (!prevProps.network.online && this.props.network.online) {
			this.state.uploadQueueOrder.forEach(uploadRef => {
				const uploadData = this.state.uploadQueue[uploadRef];
				this.upload(uploadData);
			})
		}
	}

	attemptUpload = (...args) => {
		const [{ref}] = args
		const { uploadQueueOrder } = this.state;
		
		if (!this.props.network.online) {
			this.setState({
				uploadQueueOrder: uploadQueueOrder.includes(ref)
				? uploadQueueOrder
				: [...uploadQueueOrder, ref],
				uploadQueue: {
					...this.state.uploadQueue,
					[ref]: args
				}
			})
		} else {
			return this.upload(...args);
		}
	}
	
	upload = ({ ref, ...uploadStatusArgs }, file, meta, track = true) => {
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
					default:
						break;
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
				uploadFile: this.attemptUpload,
				queuedUploads: this.state.uploadQueueOrder.map(ref => this.state.queuedUploads[ref]),
			}}>
				{this.props.children}
			</Context.Provider>
		)
	}
}
export const MediaProvider = withNetwork(withFirebase(MediaProviderComponent));


export function withMedia(Component) {
	return function ComponentWrappedWithFirestore(props) {
		return (
			<Context.Consumer>
				{context => <Component {...props} media={context} />}
			</Context.Consumer>
		)
	}
}
