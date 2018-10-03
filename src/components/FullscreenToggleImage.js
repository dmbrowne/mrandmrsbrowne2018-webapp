import React from 'react';
import fscreen from 'fscreen';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullScreenImage from './FullscreenImage';
import { IconButton } from '@material-ui/core';

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

  viewFullScreenImage = (force) => {
		if (this.props.disableDoubleClick && !force) {
			return;
		}
    this.setState({ fullscreen: true });
	}

	render() {
		if (this.state.fullscreen) {
			return <FullScreenImage src={this.props.imgSrc} />
		}

		return (
			<div>
				<img
					// onClick={() => this.viewFullScreenImage()}
					src={this.props.thumbSrc}
				/>
				{this.props.allowFullscreen && this.props.disableDoubleClick &&
					<IconButton className="fullscreen-button" onClick={() => this.viewFullScreenImage(true)} >
						<FullscreenIcon />
					</IconButton>
				}
				<style jsx>{`
					div {
						position: relative;
					}
					div :global(.fullscreen-button) {
						position: absolute;
						color: #fff;
						bottom: 10px;
						right: 5px;
						width: 30px;
						height: 30px;
						border: solid 1px rgba(255,255,255,0.4);
						background: rgba(0,0,0,0.5);
					}
				`}</style>
			</div>
		)
	}
}

FullScreenToggleImage.defaultProps = {
	allowFullscreen: true,
}
