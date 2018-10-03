// @flow
import * as React from 'react';
import { withFirebase } from '../firebase';

const Context = React.createContext({
	items: [],
	fetching: false,
	getItems: () => {},
	loadMore: () => {},
	subscribe: () => {},
	unsubscribe: () => {},
	onDelete: () => {},
});

type State = {
	feedItemIds: [],
	feedItems: {},
	fetching: boolean,
	loadingMore: boolean,
}

class FeedContextProvider extends React.Component<any, State> {
	feedUnsubscribe = null;

	state = {
		feedItemIds: [],
		feedItems: {},
		fetching: false,
		loadingMore: false,
	}

	updateFeedItemListState(snapshot, merge, mergeState) {
		const feedItemIds = snapshot.docs.map(doc => doc.id);
		const docs = snapshot.docs.reduce((accum, doc) => ({
			ids: [
				...accum.ids,
				doc.id,
			],
			items: {
				...accum.items,
				[doc.id]: {
					id: doc.id,
					ref: doc.ref,
					...doc.data(),
				}
			}
		}), { ids: [], items: {} });

		this.setState(state => ({
			...mergeState,
			feedItems: {...merge ? state.feedItems : {}, ...docs.items},
			feedItemIds: [...merge ? state.feedItemIds : [], ...docs.ids],
		}));
	}

	getFeedItems = () => {
		return this.props.firestore
			.collection('feed')
			.orderBy('createdAt', 'desc')
			.limit(10)
			.get()
			.then(snapshot => {
				this.setLoadMoreRef(snapshot);
				this.updateFeedItemListState(snapshot, false);
			})
	}

	setLoadMoreRef(snapshot) {
		const lastItem = snapshot.docs[snapshot.docs.length - 1];
		this.loadMoreRef = lastItem && this.props.firestore
			.collection('feed')
			.orderBy('createdAt', 'desc')
			.startAfter(lastItem)
			.limit(10);
	}
	
	loadMore = () => {
		if (this.loadMoreRef && !this.state.loadingMore) {
			this.setState({ loadingMore: true });
			return this.loadMoreRef.get().then(snapshot => {
				this.setLoadMoreRef(snapshot);
				this.updateFeedItemListState(snapshot, true, { loadingMore: false});
			})
		}
		return Promise.resolve();
	}

	onDocumentChange(changedDocument) {
		const updatedDoc = {
			id: changedDocument.id,
			ref: changedDocument.ref,
			...changedDocument.data(),
		};
		this.setState({
			feedItems: {
				...this.state.feedItems,
				[changedDocument.id]: updatedDoc,
			}
		});
	}

	onDocumentRemove(deletedDocument) {
		const newFeedItems = { ...this.state.feedItems }
		delete newFeedItems[deletedDocument.id];
		const newFeedItemIds = [...this.state.feedItemIds]
		newFeedItemIds.splice(newFeedItemIds.indexOf(deletedDocument.id), 1);
		this.setState ({
			feedItems: newFeedItems,
			feedItemIds: newFeedItemIds,
		});
	}

	subscribeToFeedItems = () => {
		return this.feedUnsubscribe = this.props.firestore.collection('feed').onSnapshot(snapshot => {
			snapshot.docChanges().forEach((change) => {
				if (change.type === "modified") {
					this.onDocumentChange(change.doc);
				}
				if (change.type === "removed") {
					this.onDocumentRemove(change.doc);
				}
			});
		})
	}

	unsubscribeFeedItems = () => {
		if (this.feedUnsubscribe) {
			this.feedUnsubscribe();
		}
	}

	onDelete(feedItem) {
		feedItem.ref.delete();
	}

	render() {
		const { Component } = this.props;
		return (
			<Context.Provider value={{
				feed: {
					items: this.state.feedItemIds.map(id => this.state.feedItems[id]),
					fetching: this.state.fetching,
					getItems: this.getFeedItems,
					loadMore: this.loadMore,
					subscribe: this.subscribeToFeedItems,
					unsubscribe: this.unsubscribeFeedItems,
					onDelete: this.onDelete,
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
