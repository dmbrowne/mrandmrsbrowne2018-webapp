import React from 'react';
import fscreen from 'fscreen';
import FullScreenImage from './FullscreenImage';

export default class FullScreenToggleImage extends React.Component {
	state = {
		fullscreen: false,
	}

	componentDidMount() {
		fscreen.addEventListener('fullscreenchange', this.onFullscreenChange);
	}

	componentWillUnmount() {
		fscreen.removeEventListener("fullscreenchange", this.onFullscreenChange);
	}

	onFullscreenChange = (e) => {
		if (fscreen.fullscreenElement === null) {
			this.setState({ fullscreen: null })
		}
	}

  viewFullScreenImage = () => {
    this.setState({ fullscreen: true });
	}

	render() {
		if (this.state.fullscreen) {
			return <FullScreenImage mediaDocument={this.props.mediaDocument} />
		}

		return (
			<img
				onClick={this.viewFullScreenImage}
				src={this.props.mediaDocument.cloudinary.secure_url}
			/>
		)
	}
}
