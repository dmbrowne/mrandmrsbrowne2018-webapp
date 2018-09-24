import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import configureFirebase, { createFirestore } from './firebase';
import FirebaseContext from './store/firebase';
import Auth from './store/auth';

const firebase = configureFirebase();
const firestore = createFirestore(firebase);
const firebaseStorage = firebase.storage();


const WrappedApp = () => (
	<BrowserRouter>
		<FirebaseContext.Provider value={{ firebase, firestore, firebaseStorage }}>
			<Auth.Provider>
				<App />
			</Auth.Provider>
		</FirebaseContext.Provider>
	</BrowserRouter>
)


ReactDOM.render(<WrappedApp />, document.getElementById('root'));
registerServiceWorker();
