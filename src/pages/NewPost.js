import React from 'react';
import { Typography, Button, TextField, withTheme } from '@material-ui/core';
import CameraIcon from '@material-ui/icons/Camera';
import * as uuidv4 from 'uuid/v4';
import MinimalFileUpload from '../components/FileUploadMinimal';
import { withFirebase } from '../firebase';
import { withAuth } from '../store/auth';
import { withMedia } from '../store/media';
import InlineVideo from '../components/InlineVideo';
import { withNetwork } from '../store/network';
import moment from 'moment';


class NewPost extends React.Component {
	state = {
		headline: '',
		caption: '',
		time: moment(),
		files: (this.props.location.state && this.props.location.state.files) || null,
	}

	componentWillMount() {
		this.showNextButton();
	}

	showNextButton(show = true) {
		this.props.appActions.setAppBarNext(
			show ? {
				text: 'Post',
				onClick: () => this.create(),
			}
			: null
		)
	}

	createFeedPost(mediaDocumentReference) {
		let date = this.state.time;
		date = date.year(2018).month(9).date(13)
		this.props.firestore.collection('feed').add({
			userId: this.props.auth.user.uid,
			// mediaType: this.state.mediaType === 'image' ? 'image' : 'video',
			mediaReference: mediaDocumentReference,
			multiple: Array.isArray(mediaDocumentReference) && mediaDocumentReference.length > 1,
			caption: this.state.caption,
			headline: this.state.headline,
			takenAt: date.toDate(),
		})
	}

	createPhotoOrVideoDocument(mediaDocumentReference, storageReferencePath) {
		return mediaDocumentReference.set({
			userId: this.props.auth.user.uid,
			storageReference: storageReferencePath,
			cloudinaryPublicId: null,
			complete: false,
		});
	}

	create = () => {
		if (this.props.network.online) {
			this.createNewPost().then(success => {
				if (success) {
					this.props.media.showUploadStatus();
					this.props.history.replace({
						pathname: '/',
						state: { 
							refresh: true,
						}
					});
				}
			});
		} else {
			this.props.network.showOfflineSnackMessage(
				'You can\'t post new content whilst offline, try again once online'
			)
		}
	}

	createNewPost() {
		if (this.state.createPostInProgress) {
			return Promise.resolve(false);
		}

		return new Promise((resolve, reject) => {
			this.setState({
				createPostInProgress: true,
			}, () => {
				if (this.state.createPostInProgress) {
					const mediaReferences = this.state.files.map(file => {
						const storageReference = uuidv4().split('-').join('');
						const collection = file.mediaType.includes('video') ? 'videos' : 'photos';
						const mediaDocumentReference = this.props.firestore.collection(collection).doc();
						this.props.media.uploadFile({
							ref: storageReference,
							headline: this.state.headline,
							caption: this.state.caption,
							mediaPreview: file.mediaPreview,
							isVideo: file.mediaType.includes('video'),
							mediaDocumentReference,
						}, file.file);
						return { mediaDocumentReference, storageReference };
					})
					Promise.all([
						...mediaReferences.map(({ mediaDocumentReference, storageReference }) => (
							this.createPhotoOrVideoDocument(mediaDocumentReference, storageReference)
						)),
						this.createFeedPost(
							mediaReferences.map(({ mediaDocumentReference }) => mediaDocumentReference),
						)
					])
					.then(() => resolve(true))
					.catch(e => reject(e));
				}
			})
		})
	}

	onFileChange = (idx, file, mediaType, mediaPreview) => {
		if (file) {
			this.setState(state => {
				const files = [...state.files];
				files[idx] = {
					file,
					mediaType,
					mediaPreview,
				};
				return {files}
			});
		}
	}

	onHeadlineChange = (e) => {
		const value = e.target.value;
		if (value.length >= 80) {
			return;
		}
		this.setState({ headline: value });
	}

	onCancel = (e) => {
		if (window.confirm('Are you sure want to discard writing a new post?')) {
			this.props.history.push('/')
		}
	}

	render() {
		const { file, mediaType, mediaPreview } = this.state

		return (
			<div className="root">
				<div className="content">
					<TextField
						onFocus={e => this.setState({ headlineFocus: true })}
						onBlur={e => this.setState({ headlineFocus: false })}
						placeholder="headline"
						helperText={
							this.state.headlineFocus
								? `80 Characters - ${80 - this.state.headline.length} remaining`
								: "optional"
						}
						fullWidth
						value={this.state.headline}
						onChange={this.onHeadlineChange}
						margin="dense"
						multiline
					/>
					<TextField
						style={{marginBottom: 24}}
						label="Caption this"
						placeholder="caption"
						helperText="optional"
						fullWidth
						value={this.state.caption}
						onChange={e => this.setState({ caption: e.target.value })}
						margin="dense"
						multiline
					/>
					<input
						style={{ margin: '8px 0 16px'}}
						type="time"
						value={moment(this.state.time).format('HH:mm')}
						onChange={e => this.setState({time: moment(e.target.value, 'HH:mm')})}
					/>
					{this.state.files.map((file, idx) => (
						<div key={file.file.name} className="preview-container">
							{!!file.mediaPreview &&
								<div className="media-preview">
									{file.mediaType === 'video' &&
										<InlineVideo videoSrc={file.mediaPreview} />
									}
									{file.mediaType === 'image' && <img alt="new post preview" src={file.mediaPreview} />}
								</div>
							}
							<MinimalFileUpload value={file.file} onChange={(...args) => this.onFileChange(idx, ...args)}>
								<Button variant="text" color="primary" size="small">
									<Typography color="inherit">Retake</Typography>{' '}
									<CameraIcon style={{ fontSize: 16 }}/>
								</Button>
							</MinimalFileUpload>
						</div>
					))}
				</div>
				<style jsx>{`
					.root {
						padding: 16px 24px;
						height: calc(100vh - ${(16 * 2) + 56}px);
						position: relative;
						overflow: auto;
					}
					.preview-container {
						text-align: center;
					}
					.media-preview img, video {
						width: 100%;
					}
					.head-row {
						display: flex;
						margin-bottom: 8px;
					}
					.headline-input-container {
						padding-left: 16px;
						flex-grow: 1;
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

export default withTheme()(
	withFirebase(
		withAuth(
			withMedia(
				withNetwork(NewPost)
			)
		)
	)
);
