import * as React from 'react';
import { CircularProgress, Typography, IconButton, Button } from '@material-ui/core';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import DeleteForever from '@material-ui/icons/DeleteForever';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Slider from 'react-slick';
import fscreen from 'fscreen';
import FileUpload from '../components/FileUpload';
import ScenarioMediaItem from '../components/ScenarioMediaItem';
import FullScreenMedia from '../components/FullScreenMedia';
import MediaItem from '../components/MediaItem';
import { withGames } from '../store/games';
import { withFirebase } from '../firebase';
import { withAuth } from '../store/auth';
import NewPostButton from '../components/AddNewPostButton';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

class ISpyScenario extends React.Component {
	state = {
		scenario: null,
		media: null,
		scenarioMedia: null,
		activeSlideIdx: 0,
	}

	fullScreenRef = React.createRef();
	scenarioFirestoreRef = this.props.firestore.doc(
		`games/ispy/scenarios/${this.props.match.params.scenarioId}`
	);

	constructor(props) {
		super(props);
		this.onFullscreenChange = this.onFullscreenChange.bind(this)
	}

	onFullscreenChange(e) {
		if (fscreen.fullscreenElement !== null) {
		   console.log('Entered fullscreen mode');
		 } else {
		   console.log('Exited fullscreen mode');
			 this.setState({ fullscreenMedia: null })
		 }
	}

	componentDidMount() {
		this.subscribeToUserMediaForActiveScenario();
		fscreen.addEventListener('fullscreenchange', this.onFullscreenChange);
		this.scenarioFirestoreRef.get().then(snapshot => {
			const scenario = {
				id: snapshot.id,
				ref: snapshot.ref,
				...snapshot.data(),
			};
			this.setState({ scenario });
		});
	}

	componentWillUnmount() {
		fscreen.removeEventListener('fullscreenchange', this.onFullscreenChange);
	}

	subscribeToUserMediaForActiveScenario() {
		const { scenarioId } = this.props.match.params;
		this.scenarioFirestoreRef
			.collection('media')
			.onSnapshot(snap => {
				const scenarioMedia = snap.docs.map(doc => ({
					id: doc.id,
					ref: doc.ref,
					...doc.data(),
				}));
				this.setState({ scenarioMedia });
			})
	}

	createGameScenarioMedia(mediaType, photoOrVideoReference) {
		const scenarioMediaRef = this.scenarioFirestoreRef.collection('media');
		return scenarioMediaRef.doc(photoOrVideoReference.id).set({
			userId: this.props.auth.user.uid,
			mediaType,
			mediaReference: photoOrVideoReference,
		});
	}

	addNewFeedPost(mediaType, photoOrVideoReference) {
		return this.props.firestore.collection('feed').add({
			userId: this.props.auth.user.uid,
			mediaType,
			mediaReference: photoOrVideoReference,
			gameReference: this.props.firestore.doc('games/ispy'),
			scenarioReference: this.scenarioFirestoreRef,
		})
	}

	onUploadSuccess = async (uploadedMediaSnapshot) => {
		const addMessage = this.props.firebase.functions().httpsCallable('addMedia');
		const { contentType } = uploadedMediaSnapshot.metadata;
		const storageReferenceId =  uploadedMediaSnapshot.metadata.name;
		const {data: newMedia} = await addMessage({ storageReference: storageReferenceId });
		if (!contentType.includes('video') && !contentType.includes('image')) {
			return;
		}

		const collection = contentType.includes('video') ? 'videos' : 'photos';
		const ref = this.props.firestore.collection(collection).doc(newMedia.id);
		const mediaType = contentType.includes('video') ? 'video' : 'image';
		await this.createGameScenarioMedia(mediaType, ref);
		await this.addNewFeedPost(mediaType, ref);
	}

	onRemoveMediaFromScenario = (mediaDocument) => {
		mediaDocument = mediaDocument || this.state.activeMediaDocument;
		return this.scenarioFirestoreRef.collection(`media`).doc(mediaDocument.id).delete();
	}

	onDeleteMedia = () => {
		const mediaDocument = this.state.activeMediaDocument;
		const deleteDocument = mediaDocument.mediaType === 'video'
			? this.deleteVideoDocument
			: this.deletePhotoDocument
		this.onRemoveMediaFromScenario(mediaDocument);
		this.deleteStorage(mediaDocument);
		deleteDocument.call(this, mediaDocument);
	}

	deleteStorage(mediaDocument) {
		return this.props.firebaseStorage
		.ref()
		.child(mediaDocument.storageReferenceId)
		.delete()
	}

	deletePhotoDocument(mediaDocument) {
		const photoCollectionRef = this.props.firestore.collection('photos');
		return photoCollectionRef.doc(mediaDocument.storageReferenceId).delete()
	}

	deleteVideoDocument(mediaDocument) {
		const videoCollectionRef = this.props.firestore.collection('videos');
		return videoCollectionRef.doc(mediaDocument.storageReferenceId).delete()
	}

	viewFullScreen(mediaDocument) {
		fscreen.requestFullscreen(this.fullScreenRef.current);
		this.setState({ fullscreenMedia: mediaDocument })
	}

	onAddFile = (file, fileType) => {
		this.props.history.push({
			pathname: `${this.props.match.url}/add-media`,
			state: {
				file,
				fileType,
				hideNavigationTabs: true,
			}
		})
	}

	render() {
		const { scenarioMedia, scenario } = this.state;

		if (!scenario) {
			return <CircularProgress />
		}

		return (
			<div className="ispyScenario">
				<header>
					<Typography variant="title">{scenario.title}</Typography>
					{scenario.description && <Typography>{scenario.description}</Typography>}
				</header>
				<div className="relative-container">
					<div className="top">
						<Typography variant="body2">Add up to a total of 3 photos or videos</Typography>
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								justifyContent: 'space-around',
								overflow: 'hidden',
							}}
						>
							<GridList cellHeight={250} style={{transform: 'translateZ(0)', flexWrap: 'noWrap'}} cols={1.5}>
								<FileUpload onUploadSuccess={this.onUploadSuccess} />
								{scenarioMedia && scenarioMedia.map((media, idx) =>
									<GridListTile
										key={media.id}
										className="mediaItemContainer"
										onClick={e => this.viewFullScreen(media)}
									>
										<ScenarioMediaItem
											mediaReference={media.mediaReference}
											mediaType={media.mediaType}
										/>
									</GridListTile>
								)}
							</GridList>
						</div>
					</div>
					<div className="body">
						<div className="content-scroll">
							<div className="content"></div>
						</div>
					</div>
				</div>
				<div id="fullscreen" ref={this.fullScreenRef}>
					{this.state.fullscreenMedia &&
						<FullScreenMedia
							mediaReference={this.state.fullscreenMedia.ref}
							mediaType={this.state.fullscreenMedia.mediaType}
						/>
					}
				</div>
				<div className="add-scenario-media">
					<NewPostButton onFileChange={this.onAddFile} />
				</div>
				<style jsx>{`
					.add-scenario-media {
						position: fixed;
						bottom: 72px;
						right: 24px;
						z-index: 100;
					}
				`}</style>
				<style jsx>{`
					video, img { max-width: 100%; max-height: 100%; }
					.ispyScenario {
						display: flex;
						flex-direction: column;
						height: calc(100vh - 112px);
					}
					.relative-container {
						position: relative;
						overflow: hidden;
						height: 100%;
						flex-grow: 1;
					}
					.top {
						position: absolute;
				    top: 0;
				    left: 0;
				    width: 100%;
						z-index: 1;
					}
					.body {
						height:100%;
						overflow: auto;
					}
					.content-scroll {
						padding-top: 250px;
						height: 100%;
					}
					.content {
						position: relative;
						z-index: 2;
						background: #fff;
						min-height: 100%;
					}
					.ispyScenario :global(.mediaItemContainer img),
					.ispyScenario :global(.mediaItemContainer video) {
						height: 100%;
					}
					.action {
						margin-bottom: 24px;
					}
				`}</style>
			</div>
		)
	}
}

export default withAuth(withFirebase(ISpyScenario));
