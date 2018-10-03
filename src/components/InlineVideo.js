import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import { isInViewport, debounce } from "../utils";
import { withFullscreenVideo } from '../hocs/fullscreenVideo'

class InlineVideo extends React.Component {
	state = {
		videoPlaying: false,
		readyToPlay: false,
		fullscreen: false,
	}

	videoElement = this.props.videoRef;
	fullscreenButton = React.createRef();

	setPlayVideoState = () => this.setState({ videoPlaying: true });
	setPauseVideoState = () => this.setState({ videoPlaying: false });

	componentDidMount() {
		setTimeout(this.playOrStopIfInViewport, 1000);
		const video = this.videoElement.current;
		video.addEventListener('loadedmetadata', () => {
			this.props.onMetaLoaded && this.props.onMetaLoaded({ duration: video.duration });
		});
		video.addEventListener('canplay', () => {
			this.setState({ readyToPlay: true });
		});
		window.addEventListener('scroll', debounce(this.playOrStopIfInViewport, 500));
		window.addEventListener('focus', this.setPlayVideoState);
		window.addEventListener('blur', this.setPauseVideoState);
  }

	componentDidUpdate(prevProps, prevState) {
		if (prevState.videoPlaying !== this.state.videoPlaying) {
			const videoAction = this.state.videoPlaying ? 'play' : 'pause';
			this.videoElement.current[videoAction]();
		}
		if (prevProps.videoIsFullscreen !== this.props.videoIsFullscreen) {
			this.setState({ fullscreen: this.props.videoIsFullscreen })
		}
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", debounce);
		window.removeEventListener('focus', this.setPlayVideoState);
		window.removeEventListener('blur', this.setPauseVideoState);
	}

	playOrStopIfInViewport = () => {
		if (this.videoElement.current) {
			const isInView = isInViewport(this.videoElement.current);
			this.setState({ videoPlaying: isInView });
		}
	}

	toggleVideoVolume = () => {
		this.videoElement.current.muted = !this.videoElement.current.muted;
		this.forceUpdate();
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
			<div className="inline-video">
				{!this.state.readyToPlay && <CircularProgress className="loading" size={20} />}
				<video
					ref={this.videoElement}
					src={src}
					onClick={this.toggleVideoVolume}
					playsInline loop muted
				/>
				<footer>
					{this.videoElement.current && this.videoElement.current.muted
						? <VolumeOffIcon className="volume-button" style={{ fontSize: 18 }} />
						: <VolumeUpIcon className="volume-button" style={{ fontSize: 18 }} />
					}
					{this.props.allowFullscreen &&
						<IconButton
							ref={this.fullscreenButton}
							className="fullscreen-button"
							onClick={this.viewFullScreen}
						>
							<FullscreenIcon />
						</IconButton>
					}
				</footer>
				<style jsx>{`
					.inline-video {
						position: relative;
					}
					video {
						width: 100%;
					}
					.inline-video :global(.loading) {
						position: absolute;
						top: calc(50% - 10px);
						left: calc(50% - 10px);
					}
					footer {
						position: absolute;
						right: 5px;
						bottom: 10px;
						text-align: center;
					}
					footer :global(.volume-button) {
						pointer-events: none;
					}
					footer :global(.fullscreen-button) {
						background: rgba(0,0,0,0.2);
						border-radius: 50%;
						margin: 8px 0;
						width: 30px;
						height: 30px;
						display: flex;
						align-items: center;
						justify-content: center;
						border: 1px solid #fff;
					}
					footer :global(svg) {
						color: #fff;
					}
				`}</style>
			</div>
		)
	}
}

export default withFullscreenVideo(InlineVideo);
