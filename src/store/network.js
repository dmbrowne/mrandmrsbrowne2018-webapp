import React from 'react';
import {Button, Zoom, Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import AddToHomeScreenModal from '../components/AddToHomeScreenModal';
import PWAInstallSuccess from '../components/PWAInstallSuccess';
import PWAConfirmDismiss from '../components/PWAConfirmDismiss';

const NetworkContext = React.createContext({
	online: false,
	showOfflineSnackMessage: () => {},
});

export class NetworkProvider extends React.Component {
	state = {
		online: navigator.onLine,
		showPWAInstallMessage: false,
		installSuccessModal: false,
		showDismissConfirmation: false,
		neverShowPWAPromptAgain: false,
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
			const hidePWANotification = localStorage.getItem('hidePWANotification');
			if (hidePWANotification === 'true') {
				return;
			}
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

	dismissAddToHomeScreenNotification = () => {
		this.setState({
			showPWAInstallMessage: false,
			showDismissConfirmation: false,
		});
	}

	confirmDismiss = () => {
		this.setState({ showDismissConfirmation: true })
		if (this.state.preventFutureNotifications) {
			localStorage.setItem('hidePWANotification', 'true');
		}
	}

	showOfflineSnackMessage = (msg) => {
		this.setState({ offlineSnackMessage: msg });
	}

	render() {
		return (
			<NetworkContext.Provider value={{
				online: this.state.online,
				showOfflineSnackMessage: this.showOfflineSnackMessage,
			}}>
				<div id="network-provider">
					{this.props.children}
					<PWAInstallSuccess
						open={this.state.installSuccessModal}
						onClose={() => this.setState({ installSuccessModal: false })}
					/>
					<PWAConfirmDismiss
						open={this.state.showDismissConfirmation}
						preventFutureNotifications={this.state.neverShowPWAPromptAgain}
						onClose={() => this.setState({ showDismissConfirmation: false })}
						onChangeNotificationPrevent={() => this.setState({
							neverShowPWAPromptAgain: !this.state.neverShowPWAPromptAgain 
						})}
						onDismiss={this.dismissAddToHomeScreenNotification}
					/>
					<AddToHomeScreenModal
						open={this.state.showPWAInstallMessage}
						onClose={this.confirmDismiss}
						onDismiss={this.confirmDismiss}
						onAddToHomescreen={this.onAddToHomescreen}
					/>
					<Snackbar
						anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
						open={!!this.state.offlineSnackMessage}
						autoHideDuration={4000}
						onClose={() => this.setState({offlineSnackMessage: null})}
						message={this.state.offlineSnackMessage}
						action={
							<Button
								color="secondary"
								onClick={() => this.setState({ offlineSnackMessage: null })}
							>
								Dismiss
							</Button>
						}
					/>
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
