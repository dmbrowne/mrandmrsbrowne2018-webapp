import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import config from './config.json';

export default function () {
	firebase.initializeApp({
		apiKey: config.apiKey,
		authDomain: config.authDomain,
		projectId: config.projectId,
		storageBucket: config.storageBucket,
	});
	return firebase;
}

export function createFirestore(firebaseInst) {
	const firestore = firebaseInst.firestore();
	firestore.settings({ timestampsInSnapshots: true });
	firestore
		.enablePersistence()
		.catch(function(err) {
			if (err.code === 'failed-precondition') {
				console.error('firestore persistence:', 'failed-precondition');
				// Multiple tabs open, persistence can only be enabled
				// in one tab at a a time.
				// ...
			} else if (err.code === 'unimplemented') {
				console.error('firestore persistence:', 'unimplemented');
				// The current browser does not support all of the
				// features required to enable persistence
				// ...
			}
		});
	return firestore;
}
