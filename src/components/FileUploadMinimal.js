import React from 'react';
import * as uuidv4 from 'uuid/v4';
import { withTheme } from '@material-ui/core/styles';
import { CircularProgress, IconButton, Divider, Typography } from '@material-ui/core';
import UploadIcon from '@material-ui/icons/CloudUpload';
import CameraIcon from '@material-ui/icons/Camera';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { withFirebase } from '../store/firebase';

class FileUpload extends React.Component {
	state = {
		uploadFile: this.props.value || null,
	}

	convertFileToPreviewImage(file, cb) {
		const reader = new FileReader();
		reader.onload = (e) => cb(e.target.result)
		reader.readAsDataURL(file);
	}

	componentDidMount() {
		const { uploadFile } = this.state;
		if (uploadFile) {
			this.onFileChange({target: {files: [uploadFile]}})
		}
	}

	onFileChange = (e) => {
		const file = e.target.files[0];
		const fileType = file.type.split('/')[0];
		this.setState({ uploadFile: file });

		if (fileType === 'image') {
			this.convertFileToPreviewImage(file, mediaPreview => (
				this.props.onChange(file, fileType, mediaPreview)
			));
		} else if (fileType === 'video') {
			this.props.onChange(file, fileType, URL.createObjectURL(file));
		}
	}

	render() {
		const { uploadFile } = this.state;

		return (
			<div>
				<label className="fileInputLabel">
					{this.props.children}
					<input
						type="file"
						accept="image/*, video/*"
						onChange={this.onFileChange}
					/>
				</label>
				<style jsx>{`
					.fileInputLabel {
						display: block;
						position: relative;
					}
					.fileInputLabel [type=file] {
						cursor: inherit;
						display: block;
						height: 100%;
						width: 100%;
						opacity: 0;
						position: absolute;
						left: 0;
						top: 0;
					}
					`}</style>
			</div>
		)
 }
}

export default withTheme()(withFirebase(FileUpload));
