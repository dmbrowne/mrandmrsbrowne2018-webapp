import React from 'react';
import { CircularProgress, Card, CardContent, Typography } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import { withFirebase } from '../store/firebase';
import { withTheme } from '@material-ui/core/styles';

class MediaItem extends React.Component {
	state = {
		media: {},
		cloudinary: {},
		mediaExists: true
	}

	subscribeToCloudinaryRef(storageRefId) {
		this.props.firestore
			.doc(`cloudinaryFiles/${storageRefId}`)
			.onSnapshot(snap => {
				const data = snap.data();
				if (!data) {
					this.setState({ mediaExists: false });
					return;
				}
				this.setState({
					mediaExists: true,
					cloudinary: {
						id: snap.id,
						ref: snap.ref,
						...snap.data(),
					}
				})
			})
	}

	async componentDidMount() {
		const { mediaReference, mediaType, firestore } = this.props;
		if (!mediaReference) return;

		const snapshot = await mediaReference.get();
		if (!snapshot.exists) {
			return this.setState({ mediaExists: false })
		}
		const media = {
			id: snapshot.id,
			ref: snapshot.ref,
			...snapshot.data(),
		}
		if (this.props.onGetMediaSuccess) {
			this.props.onGetMediaSuccess(media)
		}
		this.setState({ media })
		this.subscribeToCloudinaryRef(media.storageReferenceId);
	}

	mediaElement = () => {
		if (this.state.cloudinary.status === 'pending') {
			return <div>Converting...</div>
		}

		return (
			this.props.mediaType === 'video'
				? <video src={this.state.cloudinary.secure_url} />
				: <img src={this.state.cloudinary.secure_url} />
		)
	}

	render() {
		const { media, cloudinary, mediaExists } = this.state;
		if (!mediaExists || !this.props.mediaReference) {
			return (
				<div className="mediaItem">
					<WarningIcon style={{ fontSize: 40, color: '#d50000' }}/>
					<Typography variant="display1" component="p" className="no-content-title" style={{ color: '#950000'}}>Media not found</Typography>
					<Typography component="p">
						This item cannot be found, it may have been deleted -
						press the button below to remove it from your list
					</Typography>
					<style jsx>{`
						.mediaItem :global(.no-content-title) {
							font-size: 1.5rem;
							margin-bottom: 8px;
						}
					`}</style>
				</div>
			)
		}

		return (
			<div className="mediaItem">
				{!Object.keys(media).length || !Object.keys(cloudinary).length
					? <CircularProgress />
					: this.mediaElement()
				}
				<style jsx>{`
					.mediaItem :global(video, img) { max-width: 100%; max-height: 100%; }
				`}</style>
			</div>
		)
	}
}

export default withFirebase(MediaItem);
