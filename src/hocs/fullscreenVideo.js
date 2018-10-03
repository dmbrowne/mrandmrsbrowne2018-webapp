import React from 'react';
import fscreen from 'fscreen';
import VideoCamIcon from '@material-ui/icons/Videocam'

export default class FullScreenToggleVideo extends React.Component {
	state = {
		fullscreen: false,
		videoPlaying: false
	}

	videoElement = this.props.videoRef || React.createRef();

	componentDidMount() {
		const { onFullscreenChange, updatePlayState } = this;
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
			const newState = { fullscreen: false };
			if (this.state.videoPlaying && this.props.options.stopOnFullscreenExit) {
				this.videoElement.current.pause();
				this.videoElement.current.currentTime = 0;
				newState.videoPlaying = false;
			}
			this.setState(newState)
		} else {
			this.setState({ fullscreen: true })
		}
	}

	playFullscreenVideo = () => {
		fscreen.requestFullscreen(this.videoElement.current);
		this.videoElement.current.play();
	}

	render() {
		const { Component } = this.props;
		return (
			<Component
				{...this.props}
				videoRef={this.videoElement}
				playFullscreenVideo={this.playFullscreenVideo}
				videoIsFullscreen={this.state.fullscreen}
			/>
		);
	}
}

export function withFullscreenVideo(Component, options = {}) {
	return function WrappedFullscreenVideo(props) {
		return <FullScreenToggleVideo {...props} options={options} Component={Component} />
	}
}