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
	
	getVideoThumbSrc(mediaDocument) {
		const cloudinaryUrl = 'https://res.cloudinary.com/liquidation/video/upload/';
		const { cloudinaryPublicId } = mediaDocument;
		const cropParameter = this.props.squareThumb ? 'ar_1:1,c_crop' : 'ar_5:4,c_crop';
		return cloudinaryUrl + cropParameter + `/${cloudinaryPublicId}`;
	}
	
	getImgThumbSrc(mediaDocument) {
		const cloudinaryUrl = 'https://res.cloudinary.com/liquidation/image/upload/';
		const { cloudinaryPublicId } = mediaDocument;
		const cropParameter = this.props.squareThumb ? 'ar_1:1,c_crop' : 'ar_16:10,c_fill';
		return cloudinaryUrl + cropParameter + `/${cloudinaryPublicId}`;
	}

  mediaElement = mediaDocument => {
		const Video = this.props.videoProps && this.props.videoProps.autoPlayOnScroll
			? InlineVideo
			: FullScreenToggleVideo;

    return this.props.mediaType === "video"
			? <Video
				{...this.props.videoProps}
				thumbSrc={this.getVideoThumbSrc(mediaDocument)}
				videoSrc={mediaDocument.cloudinary.secure_url} />
    	: <FullScreenToggleImage
				{...this.props.imgProps}
				thumbSrc={this.getImgThumbSrc(mediaDocument)}
				imgSrc={mediaDocument.cloudinary.secure_url} />;
  };

  render() {
    const { documents } = this.props.media;
		const mediaDocument = documents[this.props.mediaReference.id];

    if (!mediaDocument || !mediaDocument.cloudinary) {
      return (
				<div className="circular-loader">
					<CircularProgress size={20} />
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
