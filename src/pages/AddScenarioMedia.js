import * as React from 'react';
import { CircularProgress, Typography, IconButton, Button, TextField } from '@material-ui/core';
import CameraIcon from '@material-ui/icons/Camera';
import ArrowBack from '@material-ui/icons/ArrowBack';
import SendIcon from '@material-ui/icons/Send';
import CancelIcon from '@material-ui/icons/Cancel';
import * as uuidv4 from 'uuid/v4';
import ScenarioMediaItem from '../components/ScenarioMediaItem';
import MediaItem from '../components/MediaItem';
import { withGames } from '../store/games';
import { withFirebase } from '../firebase';
import { withAuth } from '../store/auth';
import MinimalFileUpload from '../components/FileUploadMinimal';

class ISpyScenario extends React.Component {
	state = {
		scenario: null,
		caption: '',
		mediaPreview: null,
		file: this.props.location.state && this.props.location.state.file || null,
		fileType: this.props.location.state && this.props.location.state.fileType || null,
	}

	scenarioFirestoreRef = this.props.firestore.doc(
		`games/ispy/scenarios/${this.props.match.params.scenarioId}`
	);

	componentDidMount() {
		const scenario = this.getScenario()
		if (!scenario) {
			this.props.games.fetchScenario('ispy', this.props.match.params.scenarioId);
		}
	}

	async create() {
		const uploadedMedia = await this.upload();
		const newMedia = await this.createNewMediaFromStorageReference(uploadedMedia);
		const mediaType = uploadedMedia.metadata.contentType.includes('video')
			? 'video'
			: 'image';
		const mediaReference = mediaType === 'video'
			? this.props.firestore.doc(`videos/${newMedia.id}`)
			: this.props.firestore.doc(`photos/${newMedia.id}`)
		await this.createGameScenarioMedia(mediaType, mediaReference);
		await this.addNewFeedPost(mediaType, mediaReference);
	}

	upload = () => {
		const ref = uuidv4().split('-').join('');
		return this.props.firebaseStorage.ref().child(ref).put(this.state.file);
	}

	getScenario() {
		const { scenarioId } = this.props.match.params;
		const { games } = this.props;
		return games.scenariosById[scenarioId];
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
			caption: this.state.caption,
			mediaType,
			mediaReference: photoOrVideoReference,
			gameReference: this.props.firestore.doc('games/ispy'),
			scenarioReference: this.scenarioFirestoreRef,
		})
	}

	async createNewMediaFromStorageReference(uploadedMediaSnapshot) {
		const addMedia = this.props.firebaseFunctions.httpsCallable('addMedia');
		const { contentType } = uploadedMediaSnapshot.metadata;
		const storageReferenceId =  uploadedMediaSnapshot.metadata.name;
		const {data: newMedia} = await addMedia({ storageReference: storageReferenceId });
		return newMedia;
	}

	onFileChange = (file, fileType, mediaPreview) => {
		this.setState({ file, fileType, mediaPreview })
	}

	render() {
		const scenario = this.getScenario();
		const { mediaPreview, fileType, file } = this.state;

		if (!scenario) {
			return <CircularProgress />
		}

		return (
			<div className="add-scenario-media-root">
				<div className="controls">
					<Button
						variant="text"
						onClick={this.onCancel}
					>
						<CancelIcon />
						Cancel
					</Button>
					<Button variant="text" color="primary" onClick={this.createNewPost}>
						Post
						<SendIcon />
					</Button>
				</div>
				<header>
					<Typography variant="title">{scenario.title}</Typography>
				</header>
				<div className="content">
					<div className="preview-container">
						{!!mediaPreview &&
							<div className="media-preview">
								{fileType === 'video' && <video autoPlay loop src={mediaPreview} />}
								{fileType === 'image' && <img src={mediaPreview} />}
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
						label="Caption this"
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
						padding-top: 56px;
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

export default withGames(withAuth(withFirebase(ISpyScenario)));
