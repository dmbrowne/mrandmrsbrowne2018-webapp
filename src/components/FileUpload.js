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
		uploadFile: null,
		uploadFileType: null,
		mediaPreview: null,
		uploadInProgress: false,
	}

	convertFileToPreviewImage(file) {
		const reader = new FileReader();
		reader.onload = (e) => this.setState({
			mediaPreview: e.target.result
		});
		reader.readAsDataURL(file);
	}

	convertFileToPreviewVideo(file) {
		const objectUrl = URL.createObjectURL(file);
		this.setState({ mediaPreview: objectUrl });
	}

	onFileChange = (e) => {
		const file = e.target.files[0];
		const fileType = file.type.split('/')[0];

		this.setState({
			uploadFile: file,
			uploadFileType: fileType,
		});

		if (fileType === 'image') {
			this.convertFileToPreviewImage(file)
		} else if (fileType === 'video') {
			this.convertFileToPreviewVideo(file);
		}
	}

	saveMedia = () => {
		const ref = uuidv4().split('-').join('');
		const { onUploadSuccess, firebaseStorage } = this.props;
		this.setState({ uploadInProgress: true });

		firebaseStorage
		.ref()
		.child(ref)
		.put(this.state.uploadFile)
		.then(snapshot => {
			this.setState({
					uploadInProgress: false
			}, () => this.resetFileInput());

			if (onUploadSuccess) {
				onUploadSuccess(snapshot);
			}
			})
			.catch(e => {
				this.setState({ uploadInProgress: false });
				console.error(e);
				alert("There was an error uploading the media, try again later");
			});
	}

	resetFileInput = () => {
		this.setState({
			uploadFile: null,
			uploadFileType: null,
			mediaPreview: null,
		})
	}

	render() {
		const { uploadInProgress, uploadFile, uploadFileType, mediaPreview } = this.state;

		if (uploadInProgress) {
			return <CircularProgress />
		}

		return (
			<div className="root">
				{!uploadFile &&
					<div className="fileInputContainer">
						<label className="fileInputLabel">
							<UploadIcon style={{ fontSize: 32 }}/>
							<Typography variant="caption">Upload a photo or video from your device</Typography>
							<Typography variant="caption" component="p" style={{margin: '8px 0' }}>or</Typography>
							<CameraIcon style={{ fontSize: 24 }}/>
							<Typography variant="caption">Capture a new photo or video</Typography>
							<input
								type="file"
								accept="image/*, video/*"
								onChange={this.onFileChange}
							/>
						</label>
					</div>
				}
				{!!mediaPreview &&
					<div className="preview">
						{uploadFileType === 'video' && <video src={mediaPreview} controls/>}
						{uploadFileType === 'image' && <img src={mediaPreview} />}
						<IconButton onClick={this.resetFileInput}><CloseIcon /></IconButton>
						<IconButton onClick={this.saveMedia}><CheckIcon /></IconButton>
					</div>
				}
				<style jsx>{`
					.root {
						text-align: center;
						width: 100%;
					}
					.fileInputLabel {
						background: ${this.props.theme.palette.grey['100']};
						color: ${this.props.theme.palette.grey['600']};
						box-sizing: border-box;
						padding: 8px 16px;
				    overflow: hidden;
				    position: relative;
						width: 90%;
				    height: 200px;
				    border: dashed 1px ${this.props.theme.palette.grey['600']};;
				    display: flex;
						flex-direction: column;
						justify-content: center;
						align-items: center;
					}
					.fileInputLabel [type=file] {
				    cursor: inherit;
				    display: block;
				    font-size: 999px;
				    filter: alpha(opacity=0);
				    min-height: 100%;
				    min-width: 100%;
				    opacity: 0;
				    position: absolute;
				    right: 0;
				    text-align: right;
				    top: 0;
					}
					.preview {
						width: 100%;
						height: 200px;
						text-align: center;
					}
					video, img { max-width: 100%; max-height: 100%; margin: auto; }
				`}</style>
			</div>
		)
 }
}

export default withTheme()(withFirebase(FileUpload));
