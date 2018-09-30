import React from 'react';
import fscreen from 'fscreen';
import { CircularProgress, Toolbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

export default class FullScreenImage extends React.Component {
	fullScreenRef = React.createRef();

	componentDidMount() {
		fscreen.requestFullscreen(this.fullScreenRef.current);
	}

	render() {
		const { mediaDocument } = this.props;

		return (
			<div className="fullscreen" ref={this.fullScreenRef}>
				<Toolbar style={{ color: '#fff', position: 'fixed', top: 0, right: 0 }}>
					<IconButton color="inherit" onClick={() => fscreen.exitFullscreen()}>
						<CloseIcon />
					</IconButton>
				</Toolbar>
				<img src={mediaDocument.cloudinary.secure_url} />
				<style jsx>{`
					.fullscreen {
						display: flex;
						flex-direction: column;
						justify-content: center;
					}
					.fullscreen :global(img) {
						max-width: 100%;
						max-height: 100%;
					}
					`}</style>
			</div>
		);
	}
}
