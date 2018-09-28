import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase, { firestore, firebaseStorage, firebaseFunctions } from "./firebase";
import FirebaseContext from './firebase/context';
import withStore from './store';
import { GamesProvider } from './store/games';
import { FeedProvider } from './store/feed';
import { AuthProvider } from './store/auth';
import { MediaProvider } from './store/media';
import { UsersProvider } from './store/users';
import Auth from './store/auth';

const WrappedApp = () => (
	<BrowserRouter>
		<FirebaseContext.Provider value={{ firebase, firestore, firebaseStorage, firebaseFunctions }}>
			<AuthProvider>
				<UsersProvider>
					<GamesProvider>
						<FeedProvider>
							<MediaProvider>
								<App />
							</MediaProvider>
						</FeedProvider>
					</GamesProvider>
				</UsersProvider>
			</AuthProvider>
		</FirebaseContext.Provider>
	</BrowserRouter>
)


ReactDOM.render(<WrappedApp />, document.getElementById('root'));
registerServiceWorker();
