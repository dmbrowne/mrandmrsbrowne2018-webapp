import React from 'react';
import { Button, Zoom } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

export default class AddNewPostButton extends React.Component {
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
		// const scrollTop = window.pageYOffset || document.documentElement.scrollTop

		if (document.body.getBoundingClientRect().top > this.lastScrollTop) {
			this.setState({ scrolldirectionIsUp: true });
		} else {
			this.setState({ scrolldirectionIsUp: false });
		}

		this.lastScrollTop = document.body.getBoundingClientRect().top;
	}

	onFileChange = (e) => {
		const file = e.target.files[0];
		const fileType = file.type.split('/')[0];
		this.props.onFileChange(file, fileType);
	}

	render() {
		return (
			<Zoom in={this.state.scrolldirectionIsUp}>
				<label className="fileInputLabel">
					<Button variant="fab" color="primary" style={{border: `1px solid rgba(255,255,255,0.2)`}} elevation={5}>
						<AddIcon />
					</Button>
					<input type="file" accept="image/*, video/*" onChange={this.onFileChange} />
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
					`}</style>
				</label>
			</Zoom>
		)
	}
}
