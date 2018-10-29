import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { withMedia } from '../store/media';
import InlineVideo from './InlineVideo';
import FullScreenToggleVideo from './FullscreenToggleVideo';
import FullScreenToggleImage from './FullscreenToggleImage';
import { getAspectRatioHeight, compose } from '../utils';
import { withRouter } from 'react-router-dom';

const CircularLoader = () => (
	<div className="circular-loader">
		<CircularProgress size={20} />
		<style jsx>{`
			.circular-loader {
				display: flex;
				height: 100%;
				width: 100%;
				min-height: 90px;
				min-width: 90px;
				align-items: center;
				justify-content: center;
			}
		`}</style>
	</div>
);

class MediaItem extends React.Component {
	state = {
		exactHeight: null,
	};

	mediaItem = React.createRef();

  componentDidMount() {
		setTimeout(() => 
			this.setMediaItemContainerHeight()
		, 500)
		const { mediaReference } = this.props;
		this.props.media.subscribeToMediaItem(mediaReference);
	}

	setMediaItemContainerHeight() {
		if (this.mediaItem.current) {
			const width = this.mediaItem.current.offsetWidth;
			const height = this.minHeight(width);
			this.setState({ exactHeight: height });
		}
	}

	getMediaType() {
		return this.props.mediaReference.path.includes('video')
			? 'video'
			: 'image';
	}
	
	getVideoImgThumbSrc(mediaDocument) {
		const cloudinaryUrl = 'https://res.cloudinary.com/liquidation/video/upload/';
		const { cloudinaryPublicId } = mediaDocument;
		const cropParameter = 'ar_1:1,c_crop,f_jpg';
		const customStitchedThumbUrl =  cloudinaryUrl + cropParameter + `/${cloudinaryPublicId}`;

		const eagerThumb = mediaDocument.cloudinary.eager && mediaDocument.cloudinary.eager[1];
		return (eagerThumb && eagerThumb.secure_url) || customStitchedThumbUrl;
	}
	
	getVideoThumbSrc(mediaDocument) {
		const cloudinaryUrl = 'https://res.cloudinary.com/liquidation/video/upload/';
		const { cloudinaryPublicId } = mediaDocument;
		const cropParameter = 'ar_5:4,c_crop';
		const customStitchedThumbUrl =  cloudinaryUrl + cropParameter + `/${cloudinaryPublicId}.mp4`;

		const eagerThumb = mediaDocument.cloudinary.eager && mediaDocument.cloudinary.eager[0];
		return (eagerThumb && eagerThumb.secure_url) || customStitchedThumbUrl;
	}
	
	getImgThumbSrc(mediaDocument) {
		const cloudinaryUrl = 'https://res.cloudinary.com/liquidation/image/upload/';
		const { cloudinaryPublicId } = mediaDocument;
		const cropParameter = this.props.squareThumb ? 'ar_1:1,c_crop' : 'ar_16:10,c_fill';
		const customStitchedThumbUrl = cloudinaryUrl + cropParameter + `/${cloudinaryPublicId}.jpg`;

		const eagerThumb = mediaDocument.cloudinary.eager && mediaDocument.cloudinary.eager[
			this.props.squareThumb ? 1 : 0
		];
		return (eagerThumb && eagerThumb.secure_url) || customStitchedThumbUrl;
	}

	minHeight(width) {
		const videoAspectRatio = {
			width: 5, height: 4,
		}
		const imgAspectRatio = this.props.squareThumb
			? { width: 1, height: 1, }
			: { width: 16, height: 10 };

		return getAspectRatioHeight(
		this.getMediaType() === 'video'
				? videoAspectRatio
				: imgAspectRatio,
			width
		);
	} 

	onViewFullScreen(mediaDocument) {
		const mediaType = this.getMediaType();
		this.props.history.push({
			pathname: `/media/${mediaType}/${mediaDocument.id}`,
			state: {
				hideNavigationTabs: true,
			}
		})
	}
		
  mediaElement = mediaDocument => {
		const Video = this.props.videoProps && this.props.videoProps.autoPlayOnScroll
			? InlineVideo
			: FullScreenToggleVideo;
		
		return this.getMediaType() === 'video'
			? <Video
				{...this.props.videoProps}
				onViewFullScreen={() => this.onViewFullScreen(mediaDocument)}
				imgThumbSrc={this.getVideoImgThumbSrc(mediaDocument)}
				thumbSrc={this.getVideoThumbSrc(mediaDocument)}
				videoSrc={mediaDocument.cloudinary.secure_url} />
    	: <FullScreenToggleImage
				{...this.props.imgProps}
				onViewFullScreen={() => this.onViewFullScreen(mediaDocument)}
				thumbSrc={this.getImgThumbSrc(mediaDocument)} />;
  };

  render() {
		const { loaderImg, media: {documents}, noMinHeight } = this.props;
		const mediaDocument = documents[this.props.mediaReference.id];

		return (
			<div ref={this.mediaItem} className="media-item-root" style={{height: this.state.exactHeight}}>
				{!this.props.loaderImg && (!mediaDocument || !mediaDocument.cloudinary) &&
					<CircularLoader />
				}
				{mediaDocument && mediaDocument.cloudinary && (
					mediaDocument.cloudinary.status === "pending"
						? mediaDocument.cloudinary.secure_url
							? this.mediaElement(mediaDocument)
							: <div className="converting-status">
									<CircularLoader />
									Converting...
								</div>
						: this.mediaElement(mediaDocument)
				)}
				<style jsx>{`
					.media-item-root {
						background: ${loaderImg ? `url(${loaderImg}) no-repeat center/cover` : 'none'};
						height: ${noMinHeight ? '0' : this.minHeight()}px;
						transition: height 300ms
					}
					.converting-status {
						text-align: center;
						padding: 32px;
					}
				`}</style>
			</div>
		)
  }
}

export default compose(withRouter, withMedia)(MediaItem);
