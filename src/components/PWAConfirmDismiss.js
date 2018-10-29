// @flow
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { Button, Checkbox, FormControlLabel } from '@material-ui/core';

type Props = {
	open: boolean,
	preventFutureNotifications: boolean,
	onClose: () => any,
	onChangeNotificationPrevent: () => any,
	onDismiss: () => any,
}

export default function PWAConfirmDismiss(props: Props) {
	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogTitle>Are you sure you don't want to install the app?</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Install the app to your phone has benefits over running it in your browser, it's
					reccommended to install the app.
        </DialogContentText>
				<FormControlLabel
					control={
						<Checkbox
							checked={props.preventFutureNotifications}
							onChange={props.onChangeNotificationPrevent}
							value="dismiss-future-notifications"
						/>
					}
					label="Do not show again"
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.onClose} color="primary" autoFocus>
					Cancel
        </Button>
				<Button onClick={props.onDismiss} color="primary">
					Dismiss
        </Button>
			</DialogActions>
		</Dialog>
	)
}