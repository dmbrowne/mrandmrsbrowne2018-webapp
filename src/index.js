import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './customFonts.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase, {
	firestore,
	firebaseStorage,
	firebaseFunctions,
	firebaseAuth,
	firebaseUI
} from "./firebase";
import FirebaseContext from './firebase/context';
import { GamesProvider } from './store/games';
import { FeedProvider } from './store/feed';
import { AuthProvider } from './store/auth';
import { MediaProvider } from './store/media';
import { UsersProvider } from './store/users';
import { NetworkProvider } from './store/network';
import { CommentsProvider } from './store/comments';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { palette } from './style';

const theme = createMuiTheme({
	palette: {
		primary: { main: palette.navy }, // Purple and green play nicely together.
		secondary: { main: palette.gold }, // This is just green.A700 as hex.
	},
});


const Router = window.matchMedia('(display-mode: standalone)').matches
? HashRouter
: BrowserRouter;

const WrappedApp = () => (
	<MuiThemeProvider theme={theme}>
	<Router>
		<NetworkProvider>
			<FirebaseContext.Provider value={{
				firebase,
				firestore,
				firebaseStorage,
				firebaseFunctions,
				firebaseAuth,
				firebaseUI,
			}}>
				<AuthProvider>
					<UsersProvider>
						<GamesProvider>
							<FeedProvider>
								<CommentsProvider>
									<MediaProvider>
											<App />
									</MediaProvider>
								</CommentsProvider>
							</FeedProvider>
						</GamesProvider>
					</UsersProvider>
				</AuthProvider>
			</FirebaseContext.Provider>
		</NetworkProvider>
	</Router>
	</MuiThemeProvider>
)


ReactDOM.render(<WrappedApp />, document.getElementById('root'));
registerServiceWorker();
