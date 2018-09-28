// @flow
import * as React from 'react';
import { withFirebase } from '../firebase';

const Context = React.createContext({
	items: [],
	fetching: false,
	getItems: () => {},
	subscribe: () => {},
	unsubscribe: () => {},
});

class FeedContextProvider extends React.Component {
	feedUnsubscribe = null;

	state = {
		feedItems: [],
		fetching: false
	}

	getFeedItems = () => {
		return this.props.firestore.collection('feed').get().then(snapshot => {
			const feedItems = snapshot.docs.map(doc => ({
				id: doc.id,
				ref: doc.ref,
				...doc.data(),
			}))
			this.setState({ feedItems })
		})
	}

	subscribeToFeedItems = () => {
		return this.feedUnsubscribe = this.props.firestore.collection('feed').onSnapshot(snapshot => {
			const feedItems = snapshot.docs.map(doc => ({
				id: doc.id,
				ref: doc.ref,
				...doc.data(),
			}))
			this.setState({ feedItems })
		})
	}

	unsubscribeFeedItems = () => {
		if (this.feedUnsubscribe) {
			this.feedUnsubscribe();
		}
	}

	render() {
		const { Component } = this.props;
		return (
			<Context.Provider value={{
				feed: {
					items: this.state.feedItems,
					fetching: this.state.fetching,
					getItems: this.getFeedItems,
					subscribe: this.subscribeToFeedItems,
					unsubscribe: this.unsubscribeFeedItems,
				}
			}}>
				{this.props.children}
			</Context.Provider>
		)
	}
}
export const FeedProvider = withFirebase(FeedContextProvider);

export function withFeed(Component) {
	return function ComponentWrappedWithFirestore(props) {
		return (
			<Context.Consumer>
				{context => <Component {...props} feed={context.feed}/>}
			</Context.Consumer>
		)
	}
}
