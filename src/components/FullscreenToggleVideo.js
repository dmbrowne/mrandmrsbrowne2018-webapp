import React from 'react';
import VideoCamIcon from '@material-ui/icons/Videocam'
import { withFullscreenVideo } from '../hocs/fullscreenVideo'


class FullScreenToggleVideo extends React.Component {
	state = {
		fullscreen: false,
	}

	componentDidUpdate(prevProps) {
		if (prevProps.videoIsFullscreen !== this.props.videoIsFullscreen) {
			this.setState({ fullscreen: this.props.videoIsFullscreen })
		}
	}

	viewFullScreen = () => {
		this.setState({ fullscreen: true }, () => {
			this.props.playFullscreenVideo()
		});
	}

	render() {
		const src = this.props.thumbSrc
			? this.state.fullscreen ? this.props.videoSrc : this.props.thumbSrc
			: this.props.videoSrc;
	
		return (
			<div className="fullscreen-applicable-video">
				<video
					ref={this.props.videoRef}
					src={src}
					onClick={this.viewFullScreen}
					muted
				/>
				<footer>
					<VideoCamIcon style={{ color: '#fff' }}/>
				</footer>
				<style jsx>{`
					.fullscreen-applicable-video {
						position: relative;
					}
					.fullscreen-applicable-video footer {
						position: absolute;
						right: 3px;
						bottom: 5px;
						width: 30px;
						height: 30px;
				
					}
				`}</style>
			</div>
		);
	}
}

export default withFullscreenVideo(FullScreenToggleVideo, { stopOnFullscreenExit: true });
