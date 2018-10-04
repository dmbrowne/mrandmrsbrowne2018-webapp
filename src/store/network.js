import React from 'react';
import Paper from '@material-ui/core/Paper';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DAndYLogo from '../icons/y-d_logo.svg';
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

	onAddToHomescreen() {
		this.deferredPrompt.prompt();
		this.deferredPrompt.userChoice
			.then((choiceResult) => {
				if (choiceResult.outcome === 'accepted') {
					console.log('User accepted the A2HS prompt');
				} else {
					console.log('User dismissed the A2HS prompt');
				}
				this.setState({ showPWAInstallMessage: false });
				this.deferredPrompt = null;
			});
	}

	render() {
		return (
			<NetworkContext.Provider value={{
				online: this.state.online,
			}}>
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
					{this.state.showPWAInstallMessage &&
						<Slide direction="up" in={true}>
							<div className="paper-container">
								<Paper style={{ padding: 16 }} elevation={16}>
									<div className="content">
										<div className="logo"><img src={DAndYLogo} alt="yasmin and daryl logo" /></div>
										<div>
											<Typography variant="title">Mr. & Mrs. Browne 2018</Typography>
											<Typography variant="caption">Save this app for easy access</Typography>
										</div>
									</div>
									<footer>
										<Button color="primary" variant="contained">Add to homescreen</Button>
									</footer>
								</Paper>
							</div>
						</Slide>
					}
					<style jsx>{`
						.paper-container {
							position: fixed;
							bottom: 48px;
							right: 5px;
							width: 85%;
							max-width: 600px;
						}
						.content {
							display: flex;
						}
						.logo {
							width: 72px;
							margin-right: 16px;
						}
						footer {
							margin-top: 8px;
							text-align: right;
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
