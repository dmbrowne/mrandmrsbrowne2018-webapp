import React from 'react';
import fscreen from 'fscreen';

export default class FullScreenToggleVideo extends React.Component {
	state = {
		fullscreen: false,
		videoPlaying: false
	}

	constructor(props) {
		super(props);
		this.setPlayStateTrue = this.setPlayStateTrue.bind(this);
		this.setPlayStateFalse = this.setPlayStateFalse.bind(this);
	}

	videoElement = this.props.videoRef || React.createRef();

	componentDidMount() {
		const { onFullscreenChange } = this;
		fscreen.addEventListener('fullscreenchange', onFullscreenChange);
		this.videoElement.current.addEventListener('play', this.setPlayStateTrue);
		this.videoElement.current.addEventListener('pause', this.setPlayStateFalse);
	}

	componentWillUnmount() {
		fscreen.removeEventListener("fullscreenchange", this.onFullscreenChange);
		this.videoElement.current.removeEventListener('play', this.setPlayStateTrue);
		this.videoElement.current.removeEventListener('pause', this.setPlayStateFalse);
	}

	setPlayStateTrue() {
		this.setState({ videoPlaying: true });
	}

	setPlayStateFalse() {
		this.setState({ videoPlaying: false });
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