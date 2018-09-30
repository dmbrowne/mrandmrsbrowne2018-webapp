import * as React from 'react';
import { CircularProgress, Typography, IconButton, Button, TextField } from '@material-ui/core';
import CameraIcon from '@material-ui/icons/Camera';
import CancelIcon from '@material-ui/icons/Cancel';
import * as uuidv4 from 'uuid/v4';
import MediaItem from '../components/MediaItem';
import { withGames } from '../store/games';
import { withMedia } from '../store/media';
import { withFirebase } from '../firebase';
import { withAuth } from '../store/auth';
import MinimalFileUpload from '../components/FileUploadMinimal';

class ISpyScenario extends React.Component {
	state = {
		scenario: null,
		caption: '',
		mediaPreview: null,
		file: this.props.location.state && this.props.location.state.file || null,
		mediaType: this.props.location.state && this.props.location.state.mediaType || null,
	}

	scenarioFirestoreRef = this.props.firestore.doc(
		`games/ispy/scenarios/${this.props.match.params.scenarioId}`
	);

	componentWillMount() {
		this.props.appActions.setAppBarNext({
			text: 'Post',
			onClick: () => this.create(),
		})
	}

	componentDidMount() {
		const { scenarioId } = this.props.match.params;
		const scenario = this.getScenario()
		if (!scenario) {
			this.props.games.fetchScenario('ispy', scenarioId);
		}
		this.props.games.fetchScenarioMediaByOtherUsers('ispy', scenarioId, this.props.auth.user.uid);
	}

	create() {
		const storageReference = uuidv4().split('-').join('');
		const collection = this.state.mediaType.includes('video') ? 'videos' : 'photos';
		const mediaDocumentReference = this.props.firestore.collection(collection).doc();
		this.props.media.uploadFile(storageReference, this.state.file);
		return Promise.all([
			this.createPhotoOrVideoDocument(mediaDocumentReference, storageReference),
			this.createGameScenarioMedia(mediaDocumentReference),
			this.addNewFeedPost(mediaDocumentReference),
		])
		.then(() => this.props.history.goBack());
	}

	createPhotoOrVideoDocument(mediaDocumentReference, storageReferencePath) {
		return mediaDocumentReference.set({
			userId: this.props.auth.user.uid,
			storageReference: storageReferencePath,
			cloudinaryPublicId: null,
			complete: false,
		});
	}

	getScenario() {
		const { scenarioId } = this.props.match.params;
		const { games } = this.props;
		return games.scenariosById[scenarioId];
	}

	createGameScenarioMedia(photoOrVideoReference) {
		const scenarioMediaRef = this.scenarioFirestoreRef.collection('media');
		return scenarioMediaRef.doc(photoOrVideoReference.id).set({
			userId: this.props.auth.user.uid,
			mediaType: this.state.mediaType,
			mediaReference: photoOrVideoReference,
		});
	}

	addNewFeedPost(photoOrVideoReference) {
		return this.props.firestore.collection('feed').add({
			userId: this.props.auth.user.uid,
			caption: this.state.caption,
			mediaType: this.state.mediaType,
			mediaReference: photoOrVideoReference,
			gameReference: this.props.firestore.doc('games/ispy'),
			scenarioReference: this.scenarioFirestoreRef,
		})
	}

	onFileChange = (file, mediaType, mediaPreview) => {
		this.setState({ file, mediaType, mediaPreview })
	}

	render() {
		const scenario = this.getScenario();
		const { mediaPreview, mediaType, file } = this.state;

		if (!scenario) {
			return <CircularProgress />
		}

		return (
			<div className="add-scenario-media-root">
				<header>
					<Typography variant="title">{scenario.title}</Typography>
				</header>
				<div className="content">
					<div className="preview-container">
						{!!mediaPreview &&
							<div className="media-preview">
								{mediaType === 'video' && <video autoPlay loop src={mediaPreview} />}
								{mediaType === 'image' && <img src={mediaPreview} />}
							</div>
						}
						<MinimalFileUpload value={file} onChange={this.onFileChange}>
							<Button variant="text" color="primary" size="small">
								<Typography color="inherit">Retake</Typography>{' '}
								<CameraIcon style={{ fontSize: 16 }}/>
							</Button>
						</MinimalFileUpload>
					</div>
					<TextField
						label="Add a caption"
						placeholder="caption"
						helperText="optional"
						fullWidth
						value={this.state.caption}
						onChange={e => this.setState({ caption: e.target.value })}
						margin="normal"
						multiline
					/>
				</div>
				<style jsx>{`
					.add-scenario-media-root {
						position: relative;
					}
					.media-preview img, video {
						width: 100%;
					}
					.preview-container {
						text-align: center;
					}
					.controls {
						position: absolute;
						bottom: 0;
						left: 0;
						width: calc(100% - 32px);
						display: flex;
						justify-content: space-between;
						padding: 8px 16px;
					}
				`}</style>
			</div>
		)
	}
}

export default withGames(withAuth(withMedia(withFirebase(ISpyScenario))));
