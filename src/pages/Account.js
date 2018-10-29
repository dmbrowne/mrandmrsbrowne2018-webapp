import React from 'react';
import * as uuidv4 from 'uuid/v4';
import { withAuth } from '../store/auth';
import { withMedia } from '../store/media';
import { withFirebase } from '../firebase';
import {
	Avatar,
	Button,
	CircularProgress,
	TextField,
	Typography,
	List,
	ListItem,
	ListSubheader,
	ListItemAvatar,
	ListItemText,
	ListItemSecondaryAction,
	Card,
	CardContent,
	Paper,
	IconButton,
} from '@material-ui/core';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import CameraIcon from '@material-ui/icons/Camera';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import FileUploadMinimal from '../components/FileUploadMinimal';
import SunnyBeach from '../icons/SunnyBeach';
import ErrorIcon from '@material-ui/icons/Error';
import { withStyles } from '@material-ui/core/styles';
import { palette } from '../style';

const styles = theme => ({
	error: {
		color: '#fff',
		padding: 16,
		backgroundColor: theme.palette.error.dark,
		display: 'flex',
		alignItems: 'center',
	},
})

class UploadItemMediaPreview extends React.PureComponent {
	render() {
		return (
			this.props.isVideo
				? <video src={this.props.src} muted disabled />
				: <img src={this.props.src} alt="upload in progress preview" />
		);
	}
}

class Account extends React.Component {
	state = {
		displayName: this.props.auth.user.displayName || '',
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
		const displayName = e.target.value || '';
		this.setState({ displayName })
	}

	updateUserPhoto(photoURL) {
		const { auth: { user }, firestore } = this.props;
		return Promise.all([
			firestore.doc(`users/${user.uid}`).update({ photoURL }),
			user.updateProfile({ photoURL }),
		])
	}

	updateName = () => {
		const { auth: { user }, firestore } = this.props;
		const { displayName } = this.state;
		Promise.all([
			firestore.doc(`users/${user.uid}`).update({ displayName }),
			user.updateProfile({ displayName }),
		])
		.then(() => this.forceUpdate())
	}

	cancelDisplayNameChange = () => {
		this.setState({
			displayName: this.props.auth.user.displayName || ''
		});
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
				default:
					break;
			}
		});

		uploadTask
			.then(snapshot =>  snapshot.ref.getDownloadURL())
			.then((downloadURL) => this.updateUserPhoto(downloadURL))
			.then(() => this.setState({ mediaPreview: null, uploadProgress: 0 }));
	}

	render() {
		const { 
			classes,
			auth: { user },
			media: { uploads, removeUploadFromQueue },
		} = this.props;

		return (
			<div className="account">
				{!this.props.auth.user.displayName &&
					<div style={{margin: '24px 16px'}}>
						<Paper classes={{root: classes.error}}>
							<ErrorIcon/>
							<span style={{marginLeft: 8}}>Please enter your name before continuing</span>
						</Paper>
					</div>
				}
				<Card style={{ margin: '24px 16px' }}>
					<ListSubheader>Your Profile</ListSubheader>
					<CardContent style={{paddingTop: 0}}>
						<div
							className="avatar-container"
							style={{
								background: `url(${this.state.mediaPreview || user.photoURL}) no-repeat center/cover`,
							}}
						>
							<img className="avatar" src={this.state.mediaPreview || user.photoURL} alt="user avatar" />
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
								value={this.state.displayName || user.displayName || ''}
								onChange={this.updateDisplayName}
								onBlur={this.onInputBlur}
								inputProps={{className: 'name-input'}}
								fullWidth
								variant="outlined"
							/>
							{!!this.state.displayName && (this.state.displayName !== user.displayName) &&
								<div style={{textAlign: 'center'}}>
									<IconButton onClick={this.updateName}><CheckIcon/></IconButton>
									<IconButton onClick={this.cancelDisplayNameChange}><CloseIcon/></IconButton>
								</div>
							}
						</div>
					</CardContent>
				</Card>
				{this.props.auth.user.displayName &&
					<Card style={{ margin: '24px 16px' }}>
						<List subheader={<ListSubheader>Uploads in Progress</ListSubheader>}>
							{(!uploads || !Object.keys(uploads).length) && 
								<li className="no-uploads">
									<div>
										<SunnyBeach />
										<Typography>All good, there are no uploads in progress.</Typography>
									</div>
								</li>
							}
							{uploads && Object.entries(uploads).map(([ storageReference, uploadState ]) => (
								<ListItem key={storageReference}>
									<ListItemAvatar>
										<Avatar>
											<UploadItemMediaPreview
												src={uploadState.mediaPreview}
												isVideo={uploadState.isVideo}
											/>
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										disableTypography
										primary={(
											<Typography noWrap variant="subheading">{uploadState.headline}</Typography>
										)}
										secondary={(
											<Typography noWrap variant="caption">{uploadState.caption || ' '}</Typography>
										)}
									/>
									<ListItemSecondaryAction>
										<div className="upload-state-container">
											{(uploadState.progressPercent < 100) &&
													<React.Fragment>
														<CircularProgress
															size={34}
															thickness={3}
															variant="static"
															color="secondary"
															value={uploadState.progressPercent}
														/>
														<div className="upload-counter">{uploadState.progressPercent}%</div>
													</React.Fragment>
											}
											{uploadState.progressPercent === 100 &&
												this.props.media.documents[uploadState.mediaDocumentReference.id].cloudinary && (
													this.props.media.documents[uploadState.mediaDocumentReference.id].cloudinary.status === 'pending'
														? (
															<React.Fragment>
																<CircularProgress
																	size={34}
																	thickness={3}
																	color="secondary"
																/>
																<div className="upload-counter">converting</div>
															</React.Fragment>
														) : (
															<Button
																size="small"
																onClick={() => removeUploadFromQueue(storageReference)}
																color="primary"
																style={{ width: 30, height: 30, minHeight: 30 }}
															>
																Clear
															</Button>
														)
											)}
										</div>
									</ListItemSecondaryAction>
								</ListItem>
							))}
						</List>
					</Card>
				}
				<footer>
					<Button
						className="signout-btn"
						variant="raised"
						color="secondary"
						size="small"
						onClick={this.signOut}
					>
						Sign Out
					</Button>
				</footer>
				<style jsx>{`
					.account {
						overflow: hidden;
					}
					.avatar {
						max-width: 100%;
						opacity: 0;
					}
					.avatar-container {
						position: relative;
						display: flex;
						width: 200px;
						height: 200px;
						margin: auto;
						align-items: center;
						border-radius: 50%;
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
					.no-uploads :global(svg) {
						filter: grayscale(0.9);
						width: 150px;
					}
					.no-uploads {
						text-align: center;
						padding: 16px;
					}
					.upload-item-preview {
						width: 50px;
						margin: 0 16px 0 0;
					}
					footer {
						margin: 24px 16px;
					}
					.upload-state-container {
						position: relative;
					}
					.upload-counter {
						position: absolute;
						height: 30px;
						width: 30px;
						top: 2px;
						left: 2px;
						font-size: 0.8rem;
						display: flex;
						align-items: center;
						justify-content: center;
						color: ${palette.gold}
					}
				`}</style>
			</div>
		);
	}
}

export default withStyles(styles)(
	withFirebase(
		withAuth(withMedia(Account))
	)
);
