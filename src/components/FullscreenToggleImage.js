import React from 'react';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import { IconButton, Fade } from '@material-ui/core';

export default class FullScreenToggleImage extends React.Component {
  viewFullScreenImage = (force) => {
		if (this.props.disableImageClick && !force) {
			return;
		}
		this.props.onViewFullScreen();
	}

	render() {
		return (
			<div>
				<Fade in={true} timeout={500} mountOnEnter unmountOnExit>
					<img
						alt="media"
						src={this.props.thumbSrc}
						onClick={() => this.viewFullScreenImage()}
					/>
				</Fade>
				{this.props.allowFullscreen && this.props.disableImageClick &&
					<IconButton className="fullscreen-button" onClick={() => this.viewFullScreenImage(true)}>
						<FullscreenIcon />
					</IconButton>
				}
				<style jsx>{`
					div {
						position: relative;
						font-size: 0;
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
