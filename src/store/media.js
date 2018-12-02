import * as React from 'react';
import { withFirebase } from '../firebase';
import { withNetwork } from './network';
import UploadSnackbar from '../components/UploadStatusSnackbox';

const Context = React.createContext({
  mediaItems: {},
  uploads: {},
  subscribeToMediaItem: () => {},
	uploadFile: () => {},
	removeUploadFromQueue: () => {},
	uploadQueueOrder: [],
	uploadQueue: {},
	showUploadSnackbar: false,
});

class MediaProviderComponent extends React.Component {
	state = {
		mediaItems: {},
		uploads: {},
		uploadQueueOrder: [],
		uploadQueue: {},
		showUploadSnackbar: false,
	}

	unsubscribers = {}
	mediaRef = this.props.firestore.collection('media');

	subscribeToMediaItem = (mediaId) => {
		if (this.unsubscribers[mediaId]) {
			return;
		}

		this.unsubscribers[mediaId] = this.mediaRef.doc(mediaId).onSnapshot(snapshot => {
			const { id, ref } = snapshot;
			this.setState(state => ({
				mediaItems: {
					...state.mediaItems,
					[id]: { id, ref, ...snapshot.data() },
				}
			}))
		})
	}

	updateUploadState({ref, mediaPreview, headline, caption, isVideo, mediaDocumentReference}, progressPercent) {
		this.setState(state => ({
			uploads: {
				...state.uploads,
				[ref]: {
					mediaPreview,
					headline,
					caption,
					isVideo,
					progressPercent,
					mediaDocumentReference,
				}
			}
		}))
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.network.online && this.props.network.online) {
			this.state.uploadQueueOrder.forEach(uploadRef => {
				const uploadDataArgs = this.state.uploadQueue[uploadRef];
				this.upload(...uploadDataArgs);
			})
			this.setState({ uploadQueueOrder: [], uploadQueue: {} });
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
		const { mediaDocumentReference } = uploadStatusArgs;
		if (mediaDocumentReference) {
			this.subscribeToMediaItem(mediaDocumentReference);
		}
		const uploadItemInfo = { ref, ...uploadStatusArgs };
		const uploadTask = this.props.firebaseStorage.ref().child(ref).put(...args);

		if (track) {
			uploadTask.on('state_changed', (snapshot) => {
				const progressPercent = Math.ceil(
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100
				);
				switch (snapshot.state) {
					case 'paused':
						return this.updateUploadState(uploadItemInfo, 'paused');
					case 'running': 
						return this.updateUploadState(uploadItemInfo, progressPercent);
					default:
						break;
				}
			}, (error) =>  this.updateUploadState(uploadItemInfo, 'error'));
		}
		
		return uploadTask;
	}
	
	removeUploadFromQueue = (ref) => {
		const newUploadsMap = {...this.state.uploads};
		delete newUploadsMap[ref];
		this.setState({ uploads: newUploadsMap });
	}

	showUploadStatus = () => {
		this.setState({ showUploadSnackbar: true });
	}

	render() {
		return (
			<Context.Provider value={{
				documents: this.state.mediaItems,
				subscribeToMediaItem: this.subscribeToMediaItem,
				uploads: this.state.uploads,
				uploadFile: this.attemptUpload,
				queuedUploads: this.state.uploadQueueOrder.map(ref => this.state.uploadQueue[ref]),
				removeUploadFromQueue: this.removeUploadFromQueue,
				showUploadStatus: this.showUploadStatus,
			}}>
				<div>
					{this.props.children}
					<UploadSnackbar isOpen={this.state.showUploadSnackbar} onClose={() => this.setState({ showUploadSnackbar: false })} />
				</div>
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
