import React from 'react';
import fscreen from 'fscreen';
import VideoCamIcon from '@material-ui/icons/Videocam'

export default class FullScreenToggleVideo extends React.Component {
	state = {
		fullscreen: false,
		videoPlaying: false
	}

	videoElement = React.createRef();
  fullScreenRef = React.createRef();

	componentDidMount() {
		const { onFullscreenChange, updatePlayState } = this;
		const { mediaReference } = this.props;
		fscreen.addEventListener('fullscreenchange', onFullscreenChange);
		this.videoElement.current.addEventListener('play', updatePlayState.bind(this, true));
		this.videoElement.current.addEventListener('pause', updatePlayState.bind(this, false));
  }

	componentWillUnmount() {
		fscreen.removeEventListener("fullscreenchange", this.onFullscreenChange);
		this.videoElement.current.removeEventListener('play', this.updatePlayState);
		this.videoElement.current.addEventListener('pause', this.updatePlayState);
	}

	updatePlayState = (playing) => {
		this.setState({ videoPlaying: playing });
	}

	onFullscreenChange = (e) => {
		if (fscreen.fullscreenElement === null) {
			const newState = { fullscreen: null };
			if (this.state.videoPlaying) {
				this.videoElement.current.pause();
				this.videoElement.current.currentTime = 0;
				newState.videoPlaying = false;
			}
			this.setState(newState)
		}
	}

	playFullscreenVideo = () => {
		fscreen.requestFullscreen(this.videoElement.current);
		this.videoElement.current.play();
	}

	render() {
		return (
			<div className="fullscreen-applicable-video">
				<video
					ref={this.videoElement}
					src={this.props.mediaDocument.cloudinary.secure_url}
					onClick={this.playFullscreenVideo}
					loop muted
				/>
				<footer>
					<VideoCamIcon style={{ fontSize: '1.5em', color: '#fff' }}/>
				</footer>
				<style jsx>{`
					.fullscreen-applicable-video {
						position: relative;
					}
					.fullscreen-applicable-video footer {
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
				`}</style>
			</div>
    );
	}
}
