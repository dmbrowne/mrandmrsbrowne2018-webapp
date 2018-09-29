import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MediaItem from './MediaItem';

export default class FullScreenMedia extends React.Component {
	state = {
		dialogOpen: false,
		modalType: 'remove',
	}

	removeContent() {
		return 'This will remove the above item from your scenario entry, but keep it visible in the everyone\'s feed';
	}

	deleteContent() {
		return 'This will delete the image from your scenario entry and delete it everywhere else!';
	}

	removeConfirmation = () => {
		if (window.confirm(this.removeContent())) {
			this.props.onRemove(this.props.mediaReference);
			this.setState({ dialogOpen: false })
		}
	}

	deleteConfirmation = () => {
		if (window.confirm(this.deleteContent())) {
			this.props.onDelete(this.props.mediaReference);
			this.setState({ dialogOpen: false })
		}
	}

	render() {
		return (
			<div className="fullscreen-media">
				<div className="fullscreen-content">
					<MediaItem
						mediaReference={this.props.mediaReference}
						mediaType={this.props.mediaType}
					/>
					<nav className="actions">
						{/* <div className="action">
							<Button
								size="small"
								style={{ color: '#fff' }}
								onClick={this.removeConfirmation}
							>
								Remove
							</Button>
							<Typography variant="caption"></Typography>
						</div> */}
						<div className="action">
							<Button
								size="small"
								style={{ color: '#fff' }}
								onClick={this.deleteConfirmation}
							>
								Delete
							</Button>
							<Typography variant="caption"></Typography>
						</div>
					</nav>
				</div>
				<style jsx>{`
					.fullscreen-media {
						text-align: center;
						position: relative;
						height: 100%;
						display: flex;
						flex-direction: column;
						justify-content: center;
					}
					.fullscreen-media :global(img),
					.fullscreen-media :global(video) {
						max-width: 100%;
					}
					.actions {
						position: absolute;
						width: 100%;
						bottom: 0;
						left: 0;
						display: flex;
						justify-content: space-between;
					}
				`}</style>
			</div>
		)
	}
}
