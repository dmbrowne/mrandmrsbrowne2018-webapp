import React from 'react';
import { Snackbar, SnackbarContent, Button } from '@material-ui/core';
import { withMedia } from '../store/media';
import withRouter from 'react-router-dom/withRouter';

class UploadStatusSnackbox extends React.Component {
	goToProfile = () => {
		this.props.history.push('/me');
		this.props.onClose();
	}

	render() {
		return (
			<Snackbar
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				open={this.props.isOpen}
				onClose={this.props.onClose}
				autoHideDuration={5000}
			>
				<SnackbarContent
					message={
						<span>
							{Object.keys(this.props.media.uploads).length} uploads in progress, you can view uploads in your profile
						</span>
					}
					action={[
						<Button key="profile" color="secondary" size="small" onClick={this.goToProfile}>
							View Profile
            </Button>,
						<Button key="dusmiss" color="secondary" size="small" onClick={this.props.onClose}>
							Dismiss
            </Button>,
					]}
				/>
			</Snackbar>
		)
	}
}

export default withRouter(withMedia(UploadStatusSnackbox))