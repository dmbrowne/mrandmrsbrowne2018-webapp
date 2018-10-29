// @flow
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { Typography, Button } from '@material-ui/core';

type Props = {
	open: boolean,
	onClose: () => any,
}

export default function InstallPWASuccess(props: Props) {
	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogTitle>Successfully Installed!</DialogTitle>
			<DialogContent>
				<DialogContentText>
					The app has been installed on your device, please close this page and run the app straight from your phone.
					<Typography variant="caption">
						(If you don't see the app in your apps menu, give it a few seconds to appear)
					</Typography>
        </DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose} color="primary" autoFocus>
					close
        </Button>
			</DialogActions>
		</Dialog>
	)
}