import React from 'react';
import { CircularProgress, Card, CardContent, Typography } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import { withFirebase } from '../firebase';
import { withMedia } from '../store/media';
import { withTheme } from '@material-ui/core/styles';

class MediaItem extends React.Component {
	componentDidMount() {
		const { mediaReference } = this.props;
		this.props.media.subscribeToMediaItem(mediaReference);
	}

	mediaElement = (mediaDocument) => {
		return this.props.mediaType === 'video'
			? <video src={mediaDocument.cloudinary.secure_url} />
			: <img src={mediaDocument.cloudinary.secure_url} />
	}

	render() {
		const { documents } = this.props.media;
		const mediaDocument = documents[this.props.mediaReference.id];

		if (!mediaDocument || !mediaDocument.cloudinary) {
      return <CircularProgress />;
    }
		return (
			mediaDocument.cloudinary.status === 'pending'
				? <div>Converting...</div>
				: this.mediaElement(mediaDocument)
		)
	}
}

export default withMedia(MediaItem);
