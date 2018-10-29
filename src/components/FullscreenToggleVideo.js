import React from 'react';
import VideoCamIcon from '@material-ui/icons/Videocam'
import { withFullscreenVideo } from '../hocs/fullscreenVideo'


export default class FullScreenToggleVideo extends React.Component {
	state = {
		fullscreen: false,
	}

	// componentDidUpdate(prevProps) {
	// 	if (prevProps.videoIsFullscreen !== this.props.videoIsFullscreen) {
	// 		this.setState({ fullscreen: this.props.videoIsFullscreen })
	// 	}
	// }

	// viewFullScreen = () => {
	// 	this.setState({ fullscreen: true }, () => {
	// 		this.props.playFullscreenVideo()
	// 	});
	// }

	render() {
		return (
			<div className="fullscreen-applicable-video">
				{/* keeping this here for legacy reasons */}
				{!this.props.imgThumbSrc && (
					<video
						ref={this.props.videoRef}
						src={this.props.videoSrc}
						onClick={this.props.onViewFullScreen}
						muted
						disabled
					/>
				)}
				{this.props.imgThumbSrc &&
					<img src={this.props.imgThumbSrc} onClick={this.props.onViewFullScreen} alt="video thumbnail" />
				}
				<footer>
					<VideoCamIcon style={{ color: '#fff' }}/>
				</footer>
				<style jsx>{`
					.fullscreen-applicable-video {
						position: relative;
						font-size: 0;
					}
					.fullscreen-applicable-video footer {
						position: absolute;
						right: 3px;
						bottom: 5px;
						width: 30px;
						height: 30px;
						z-index: 2;
					}
					video {
						position: absolute;
						z-index: 0;
					}
					img {
						position: relative;
						z-index: 1;
					}
				`}</style>
			</div>
		);
	}
}

// export default withFullscreenVideo(FullScreenToggleVideo, { stopOnFullscreenExit: true });
