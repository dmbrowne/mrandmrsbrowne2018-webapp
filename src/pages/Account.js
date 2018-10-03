import React from 'react';
import * as uuidv4 from 'uuid/v4';
import { withAuth } from '../store/auth';
import { withMedia } from '../store/media';
import { withFirebase } from '../firebase';
import {
	Button,
	Avatar,
	CircularProgress,
	TextField,
	AppBar,
	Toolbar,
	Typography,
	IconButton,
} from '@material-ui/core';
import CameraIcon from '@material-ui/icons/Camera';
import FileUploadMinimal from '../components/FileUploadMinimal';
import { palette } from '../style';

class UploadItemHeadline extends React.PureComponent {
	render() {
		return (
			<Typography variant="body2" component="header">{this.props.headline}</Typography>
		);
	}
}

class UploadItemCaption extends React.PureComponent {
	render() {
		return (
			<Typography variant="caption" component="p">{this.props.caption}</Typography>
		);
	}
}

class UploadItemMediaPreview extends React.PureComponent {
	render() {
		return (
			this.props.isVideo
				? <video src={this.props.src} muted disabled />
				: <img src={this.props.src} />
		);
	}
}

class Account extends React.Component {
	state = {
		displayName: '',
		mediaPreview: null,
		uploadProgress: 0,
	}

	nameUpdate = null

	signOut = () => {
		this.props.firebase.auth().signOut().then(() =>
		this.props.history.push('/signin')
		);
	}

	updateDisplayName = (e) => {
		const displayName = e.target.value;
		this.setState({ displayName }, () => this.updateName())
	}

	updateUserPhoto(photoURL) {
		const { auth: { user }, firestore } = this.props;
		const { displayName } = this.state;
		return Promise.all([
			firestore.doc(`users/${user.uid}`).update({ photoURL }),
			user.updateProfile({ photoURL }),
		])
	}

	updateName() {
		clearTimeout(this.nameUpdate)
    this.nameUpdate = setTimeout(() => {
			const { auth: { user }, firestore } = this.props;
			const { displayName } = this.state;
			firestore.doc(`users/${user.uid}`).update({ displayName }),
			user.updateProfile({ displayName })
		}, 500)
	}

	onInputBlur = () => {
		this.forceUpdate(() => this.setState({ displayName: '' }));
	}

	onFileChange = (file, mediaType, mediaPreview) => {
		this.setState({ mediaPreview })
		const uniqueId = uuidv4().split('-').join('');
		const storageReference = `userPhoto-id_${this.props.auth.user.uid}-${uniqueId}`;
		const uploadTask = this.props.media.uploadFile({ref: storageReference}, file, {
			customMetadata: { 'thumbnail': 'true' }
		}, false)

		uploadTask.on('state_changed', (snapshot) => {
			const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			switch (snapshot.state) {
				case 'running':
					return this.setState({ uploadProgress });
			}
		});

		uploadTask
			.then(snapshot =>  snapshot.ref.getDownloadURL())
			.then((downloadURL) => this.updateUserPhoto(downloadURL))
			.then(() => this.setState({ mediaPreview: null, uploadProgress: 0 }));
	}

	render() {
		const { auth: { user } } = this.props;
		return (
			<div className="account">
				<div className="avatar-container">
					<img className="avatar" src={this.state.mediaPreview || user.photoURL} />
					{this.state.mediaPreview
						? <CircularProgress
							size={204}
							thickness={2}
							className="progress"
							color="secondary"
							variant="static"
							value={this.state.uploadProgress}
							/>
						: <FileUploadMinimal className="file-upload" onChange={this.onFileChange}>
							<Button variant="fab" color="primary" mini>
								<CameraIcon style={{ fontSize: 16 }} />
							</Button>
						</FileUploadMinimal>
					}
				</div>
				<div className="name-input-control">
					<TextField
						required
						value={this.state.displayName || user.displayName}
						onChange={this.updateDisplayName}
						onBlur={this.onInputBlur}
						inputProps={{
							className: 'name-input'
						}}
						fullWidth
					/>
				</div>
				{this.props.media.uploads &&
					<section>
						<Typography variant="subheading" component="header">Uploads in progress</Typography>
						{Object.entries(this.props.media.uploads).map(([storageReference, uploadState]) => (
							<article className="upload-item" key={storageReference}>
								<figure className="upload-item-preview">
									<UploadItemMediaPreview
										src={uploadState.mediaPreview}
										isVideo={uploadState.isVideo}
									/>
								</figure>
								<main className="upload-item-info">
									<UploadItemHeadline headline={uploadState.headline} />
									<UploadItemCaption caption={uploadState.caption} />
								</main>
								<CircularProgress
									size={30}
									thickness={1}
									variant="static"
									color="secondary"
									value={uploadState.progressPercent}
								/>
							</article>
						))}
					</section>
				}
        <Button
					className="signout-btn"
					variant="raised"
					color="secondary"
					size="large"
					onClick={this.signOut}
				>
          Sign Out
        </Button>
				<style jsx>{`
					.account {
						text-align: center;
						padding: 64px 24px 24px;
					}
					.avatar {
						max-width: 100%;
						border-radius: 50%;
					}
					.avatar-container {
						position: relative;
						display: flex;
						width: 200px;
						height: 200px;
						margin: 16px auto 32px;
					}
					.avatar-container :global(.file-upload) {
						position: absolute;
						bottom: 10px;
						right: 5px;
					}
					.avatar-container :global(.progress) {
						position: absolute;
						top: calc(50% - 100px);
						left: calc(50% - 100px);
					}
					.name-input-control {
						margin: 16px 0;
					}
					.account :global(.signout-btn) {
						margin-top: 32px;
					}
					.account :global(.name-input) {
						text-align: center;
					}
					.account :global(a) {
						color: #fff;
						text-decoration: none;
					}
					.account :global(.toolbar-link) {
						display: flex;
						align-items: center;
					}
					.upload-item {
						display: flex;
						text-align: center;
					}
					.upload-item-preview {
						width: 50px;
						margin: 0 16px 0 0;
					}
					.upload-item-info {
						flex-grow: 1;
					}
				`}</style>
			</div>
		);
	}
}

export default withFirebase(
	withAuth(withMedia(Account))
);
