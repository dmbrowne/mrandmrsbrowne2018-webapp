import React from 'react';
import { Button, Zoom } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

export default class AddNewPostButton extends React.Component {
	state = {
		in: true,
		scrollUp: true,
	}

	componentWillUnmount () {
		this.setState({ in: false })
	}
	onFileChange = (e) => {
		const file = e.target.files[0];
		const fileType = file.type.split('/')[0];
		this.props.onFileChange(file, fileType);
	}

	render() {
		return (
			<Zoom in={this.state.in}>
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
