import React from 'react';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Zoom from '@material-ui/core/Zoom';
import Modal from '@material-ui/core/Modal';
import DAndYLogo from '../icons/y-d_logo-wedding-theme.svg';
import { Typography, Button } from '@material-ui/core';

const NetworkContext = React.createContext({
	online: false,
});

export class NetworkProvider extends React.Component {
	state = {
		online: false,
		showPWAInstallMessage: false,
		installSuccessModal: false,
	}

	deferredPrompt = null;

	constructor(props) {
		super(props);
		window.addEventListener('online', (e) => {
			this.setState({ online: true })
		});
		
		window.addEventListener('offline', (e) => {
			this.setState({ online: false })
		}, false);

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			this.deferredPrompt = e;
			this.setState({ showPWAInstallMessage: true });
		});

		window.addEventListener('appinstalled', (evt) => {
			this.setState({ installSuccessModal: true })
		});
	}

	onAddToHomescreen = () => {
		this.deferredPrompt.prompt();
		this.deferredPrompt.userChoice.then((choiceResult) => {
			this.setState({ showPWAInstallMessage: false });
			this.deferredPrompt = null;
		});
	}

	onDismissCustomAddToHomescreen = () => {
		if (window.confirm('If you dismiss this prompt, it will not be shown again')) {
			this.setState({ showPWAInstallMessage: false });
		}
	}

	render() {
		return (
			<NetworkContext.Provider value={{online: this.state.online}}>
				<div id="network-provider">
					{this.props.children}
					<Dialog
						open={this.state.installSuccessModal}
						onClose={() => this.setState({ installSuccessModal: false })}
					>
						<DialogTitle>Successfully Installed!</DialogTitle>
						<DialogContent>
							<DialogContentText>
								The app has been installed on your device, please close this page and run the app straight from your phone
            	</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => this.setState({ installSuccessModal: false })} color="primary" autoFocus>
								close
            	</Button>
						</DialogActions>
					</Dialog>
					<Modal
						open={this.state.showPWAInstallMessage}
						onClose={this.onDismissCustomAddToHomescreen}
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
										<Button
											color="primary"
											variant="text"
											size="small"
											onClick={this.onDismissCustomAddToHomescreen}
										>
											Dismiss
										</Button>
										<Button color="primary" variant="contained" onClick={this.onAddToHomescreen}>Add to homescreen</Button>
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
			</NetworkContext.Provider>
		)
	}
}

export function withNetwork(Component) {
	return function NetworkWrappedComponent(props) {
		return (
				<NetworkContext.Consumer>
					{context => <Component {...props} network={context} />}
				</NetworkContext.Consumer>
		)
	}
}
