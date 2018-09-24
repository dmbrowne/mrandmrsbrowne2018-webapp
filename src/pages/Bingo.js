import React from 'react';
import { withFirebase } from '../store/firebase';
import { withAuth } from '../store/auth';

class SpeechBingo extends React.Component {
	state = {
		fetchingQuoteCard: false,
		quoteCard: [],
	}

	getUserQuoteCard() {
		const { firestore, auth } = this.props;
		const { user:{uid} } = auth;

		return this.props.firestore
			.doc(`games/bingo/cards/${uid}`)
			.get()
			.then(snap => new Promise((resolve) => {
				this.setState({
					quoteCard: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
				}, resolve);
			}));
	}

	subscribeToQuoteCard() {
		const { firestore, auth } = this.props;
		const { user:{uid} } = auth;

		this.props.firestore.doc(`games/bingo/cards/${uid}`).onSnapshot(snap => {
			this.setState({
				quoteCard: snap.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() })),
			});
		});
	}

	componentDidMount() {
		this.getUserQuoteCard()
			.then(() => {
				this.subscribeToQuoteCard()
			});
	}

	onClickQuote(quote) {
		const toggledValue = !quote.checked;

	}

	render() {

	}
}

export default
