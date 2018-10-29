// @flow
import * as React from 'react';
import Zoom from '@material-ui/core/Zoom';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DAndYLogo from '../icons/y-d_logo-wedding-theme.svg';

type Props = {
	open: boolean,
	onClose: () => any,
	onDismiss: () => any,
	onAddToHomescreen: () => any,
}

export default function AddToHomeScreenModal(props: Props) {
	return (
		<div>
			<Modal
				open={props.open}
				onClose={props.onClose}
			>
				<div className="paper-container">
					<Zoom in={true}>
						<Paper style={{ padding: 16 }}>
							<div className="content">
								<div className="logo"><img src={DAndYLogo} alt="yasmin and daryl logo" /></div>
								<div>
									<Typography variant="title">Mr. & Mrs. Browne 2018</Typography>
									<Typography variant="caption">
										We recommend you add this as an app to your phone first before doing anything else.
									</Typography>
								</div>
							</div>
							<footer>
								<Button color="primary" variant="text" size="small" onClick={props.onDismiss}>
									Dismiss
								</Button>
								<Button color="primary" variant="contained" onClick={props.onAddToHomescreen}>
									Add to homescreen
								</Button>
							</footer>
						</Paper>
					</Zoom>
				</div>
			</Modal>
			<style jsx>{`
				.paper-container {
					position: absolute;
					bottom: 48px;
					right: 8px;
					width: 85%;
					max-width: 600px;
					z-index: 1101;
				}
				.content {
					display: flex;
				}
				.logo {
					width: 72px;
					margin-right: 16px;
				}
				footer {
					margin-top: 16px;
					text-align: right;
					display: flex;
					justify-content: space-between
				}
			`}</style>
		</div>
	)
}