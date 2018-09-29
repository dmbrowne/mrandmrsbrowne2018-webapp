import React from 'react';
import { Divider, Typography, Button, TextField, withTheme } from '@material-ui/core';
import CameraIcon from '@material-ui/icons/Camera';
import ArrowBack from '@material-ui/icons/ArrowBack';
import SendIcon from '@material-ui/icons/Send';
import CancelIcon from '@material-ui/icons/Cancel';
import * as uuidv4 from 'uuid/v4';
import MinimalFileUpload from '../components/FileUploadMinimal';
import { withFirebase } from '../firebase';
import { withAuth } from '../store/auth';


class NewPost extends React.Component {
	state = {
		headline: '',
		caption: '',
		mediaPreview: null,
		file: this.props.location.state && this.props.location.state.file || null,
		fileType: this.props.location.state && this.props.location.state.fileType || null,
	}

	componentWillMount() {
		this.props.appActions.setAppBarNext({
			text: 'Post',
			onClick: () => this.createNewPost(),
		})
	}

	upload = () => {
		const ref = uuidv4().split('-').join('');
		return this.props.firebaseStorage.ref().child(ref).put(this.state.file);
	}

	savePostData(photoOrVideoReference) {
		this.props.firestore.collection('feed').add({
			userId: this.props.auth.user.uid,
			mediaType: this.state.fileType === 'image' ? 'photo' : 'video',
			mediaReference: photoOrVideoReference,
			caption: this.state.caption,
			headline: this.state.headline,
		})
	}

	onUploadSuccess = async (uploadedMediaSnapshot) => {
		const addMedia = this.props.firebaseFunctions.httpsCallable('addMedia');
		const { contentType } = uploadedMediaSnapshot.metadata;
		const storageReferenceId =  uploadedMediaSnapshot.metadata.name;
		const {data: newMedia} = await addMedia({ storageReference: storageReferenceId });
		const collection = contentType.includes('video') ? 'videos' : 'photos';
		const photoOrVideoReference = this.props.firestore.doc(`${collection}/${newMedia.id}`)
		await this.savePostData(photoOrVideoReference);
	}

	createNewPost = async () => {
		const mediaSnapshot = await this.upload();
		this.onUploadSuccess(mediaSnapshot).then(() => this.props.history.push('/'));
	}

	onFileChange = (file, fileType, mediaPreview) => {
		this.setState({ file, fileType, mediaPreview })
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
		const { file, fileType, mediaPreview } = this.state
		const locationState = this.props.location.state;
		return (
			<div className="root">
				<div className="content">
					<div className="head-row">
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
						<div className="headline-input-container">
							<TextField
								onFocus={e => this.setState({headlineFocus: true})}
								onBlur={e => this.setState({headlineFocus: false})}
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
						</div>
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
					.root {
						padding: 16px 24px;
						height: calc(100vh - ${(16 * 2) + 56}px);
						position: relative;
						overflow: auto;
					}
					.media-preview img, video {
						width: 100%;
					}
					.head-row {
						display: flex;
						margin-bottom: 8px;
					}
					.preview-container {
						width: 30%;
						text-align: center;
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
		withAuth(NewPost)
	)
);
