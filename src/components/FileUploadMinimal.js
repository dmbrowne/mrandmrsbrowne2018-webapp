import React from 'react';
import { withTheme } from '@material-ui/core/styles';
import { withFirebase } from '../firebase';

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
		if (uploadFile && uploadFile[0]) {
			this.onFileChange({target: {files: [uploadFile[0].file] }})
		}
	}

	onFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) {
			this.props.onChange(null, null, null);
			return;
		}
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
		return (
			<div className={this.props.className || ''}>
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
