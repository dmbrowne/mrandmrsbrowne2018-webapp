import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { withMedia } from '../store/media';
import InlineVideo from './InlineVideo';
import FullScreenToggleVideo from './FullscreenToggleVideo';
import FullScreenToggleImage from './FullscreenToggleImage';

class MediaItem extends React.Component {
  componentDidMount() {
		const { mediaReference } = this.props;
		this.props.media.subscribeToMediaItem(mediaReference);
  }

  mediaElement = mediaDocument => {
		const Video = this.props.autoPlayOnScroll ? InlineVideo : FullScreenToggleVideo;
    return this.props.mediaType === "video"
			? <Video mediaDocument={mediaDocument} />
    	: <FullScreenToggleImage mediaDocument={mediaDocument} />;
  };

  render() {
    const { documents } = this.props.media;
		const mediaDocument = documents[this.props.mediaReference.id];

    if (!mediaDocument || !mediaDocument.cloudinary) {
      return (
				<div className="circular-loader">
					<CircularProgress />
					<style jsx>{`
						.circular-loader {
							display: flex;
							height: 100%;
							width: 100%;
							align-items: center;
							justify-content: center;
						}
					`}</style>
				</div>
			);
    }

		return mediaDocument.cloudinary.status === "pending"
			? <div>Converting...</div>
			: this.mediaElement(mediaDocument);
  }
}

export default withMedia(MediaItem);
