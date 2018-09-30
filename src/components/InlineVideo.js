import React from 'react';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import { isInViewport, throttle } from "../utils";

export default class InlineVideo extends React.Component {
	state = {
		videoPlaying: false,
		readyToPlay: false,
	}

	videoElement = React.createRef();

	componentDidMount() {
		setTimeout(this.playOrStopIfInViewport, 1000);
		window.addEventListener('scroll', throttle(this.playOrStopIfInViewport, 500));

  }

	componentWillUpdate(nextProps, nextState) {
		if (nextState.videoPlaying !== this.state.videoPlaying) {
			const videoAction = nextState.videoPlaying ? 'play' : 'pause';
			this.videoElement.current[videoAction]();
		}
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", throttle);
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


	render() {
		return (
			<div className="inline-video">
				<video
					ref={this.videoElement}
					src={this.props.mediaDocument.cloudinary.secure_url}
					onClick={this.toggleVideoVolume}
					playsInline loop muted
				/>
				<footer>
					{this.videoElement.current && this.videoElement.current.muted
						? <VolumeOffIcon />
						: <VolumeUpIcon />
					}
				</footer>
				<style jsx>{`
					.inline-video {
						position: relative;
					}
					.inline-video footer {
						position: absolute;
						right: 3px;
						bottom: 3%;
						background: rgba(0,0,0,0.2);
						border-radius: 50%;
						width: 40px;
						height: 40px;
						display: flex;
						align-items: center;
						justify-content: center;
						border: 1px solid #fff;
					}
					.inline-video footer :global(svg) {
						color: #fff;
					}
				`}</style>
			</div>
		)
	}
}
