import React from 'react';
import { Button, Zoom } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { withNetwork } from '../store/network';


class AddNewPostButton extends React.Component {
	state = {
		scrolldirectionIsUp: true,
	}

	lastScrollTop = window.pageYOffset;

	constructor(props) {
		super(props);
		this.setScrollDirection = this.setScrollDirection.bind(this)
	}

	componentDidMount() {
		window.addEventListener('scroll', this.setScrollDirection);
	}

	componentWillUnmount () {
		window.removeEventListener('scroll', this.setScrollDirection);
	}

	setScrollDirection() {
		if (document.body.getBoundingClientRect().top > this.lastScrollTop) {
			this.setState({ scrolldirectionIsUp: true });
		} else {
			this.setState({ scrolldirectionIsUp: false });
		}

		this.lastScrollTop = document.body.getBoundingClientRect().top;
	}

	onFileChange = (e) => {
		if (!this.props.network.online) {
			return;
		}
		// const file = e.target.files[0];
		const fileIterable = Array.from(e.target.files);
		const files = fileIterable.map(file => {
			const fileType = file.type.split('/')[0];
			return {
				file,
				fileType,
				mediaPreview: null,
			}
		});
		this.props.onFileChange(files);
	}

	showMessageIfOffline = () => {
		if (!this.props.network.online) {
			this.props.network.showOfflineSnackMessage('Sorry, you can\'t add new content while offline');
		}
	}

	render() {
		return (
			<Zoom in={true}>
				<div>
					{!this.props.network.online &&
						<div className="offline-click-handler" onClick={this.showMessageIfOffline} />
					}
					<label className="fileInputLabel">
						<Button
							disabled={!this.props.network.online}
							variant="fab" color="primary" style={{border: `1px solid rgba(255,255,255,0.2)`}}
							elevation={5}
						>
							<AddIcon />
						</Button>
						<input
							type="file"
							multiple
							disabled={!this.props.network.online}
							accept="image/*, video/*"
							onChange={this.onFileChange}
						/>
					</label>
					<style jsx>{`
						.fileInputLabel {
							position: relative;
							display: inline-block;
						}
						.fileInputLabel [type=file] {
							cursor: inherit;
							display: block;
							filter: alpha(opacity=0);
							min-height: 100%;
							min-width: 100%;
							width: 100%;
							opacity: 0;
							position: absolute;
							right: 0;
							text-align: right;
							top: 0;
						}
						.offline-click-handler {
							position: absolute;
							width: 100%;
							height: 100%;
							z-index: 50;
							background: transparent;
						}
					`}</style>
				</div>
			</Zoom>
		)
	}
}

export default withNetwork(AddNewPostButton);
