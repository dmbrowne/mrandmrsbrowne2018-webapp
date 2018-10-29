// @flow
import * as React from 'react';
import { withFirebase } from '../firebase';
import { withAuth } from './auth';
import { compose } from '../utils';

const Context = React.createContext({
	items: [],
	fetching: false,
	feedPageLastScrollPos: 0,
	getItems: () => {},
	loadMore: () => {},
	subscribe: () => {},
	unsubscribe: () => {},
	onDelete: () => {},
	setFeedScrollPos: () => {},
	likePost: () => {},
	unlikePost: () => {},
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
		feedPageLastScrollPos: 0,
	}

	likePost = (postId) => {
		const { auth } = this.props;
		const previousFeedItems = { ...this.state.feedItems};
		const postDocument = this.state.feedItems[postId];
		const { id, likes } = postDocument;
		const key = `likes.${auth.user.uid}`;
		const currentLikesByUser = (likes && likes[auth.user.uid]) || 0;
		const newLikeCount = currentLikesByUser + 1;
		const updatedFeedItems = {...this.state.feedItems};
		updatedFeedItems[id] = {
			...updatedFeedItems[id],
			likes: {
				...updatedFeedItems[id].likes,
				[auth.user.uid]: newLikeCount,
			},
		};
		this.setState({feedItems: updatedFeedItems});
		postDocument.ref.update({
			[key]: newLikeCount,
		})
		.catch(e => {
			this.setState({feedItems: previousFeedItems});
		});
	}

	unlikePost = (postId) => {
		const { auth } = this.props;
		const previousFeedItems = { ...this.state.feedItems };
		const postDocument = this.state.feedItems[postId];
		const { id, likes } = postDocument;
		const updatedFeedItems = { ...this.state.feedItems };
		updatedFeedItems[id] = {
			...updatedFeedItems[id],
			likes: {
				...updatedFeedItems[id].likes,
				[auth.user.uid]: false,
			},
		};
		this.setState({feedItems: updatedFeedItems});
		const key = `likes.${auth.user.uid}`;
		postDocument.ref.update({
			[key]: false,
		})
		.catch(e => {
			this.setState({ feedItems: previousFeedItems });
		});
	}

	updateFeedItemListState(snapshot, merge, mergeState) {
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

		this.setState(state => {
			return {
				...mergeState,
				feedItems: {...merge ? state.feedItems : {}, ...docs.items},
				feedItemIds: [...merge ? state.feedItemIds : [], ...docs.ids],
			}
		});
	}

	getFeedItems = () => {
		return this.props.firestore
			.collection('feed')
			.where('mediaComplete', '==', true)
			.orderBy('createdAt', 'desc')
			// .orderBy('takenAt', 'desc')
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
			.where('mediaComplete', '==', true)
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
		const isANewUpload = !this.state.feedItemIds.includes(updatedDoc.id);
		const readyToBeAdded = isANewUpload && updatedDoc.mediaComplete;

		this.setState({
			feedItems: {
				...this.state.feedItems,
				[changedDocument.id]: updatedDoc,
			},
			feedItemIds: readyToBeAdded
				? [updatedDoc.id, ...this.state.feedItemIds]
				: this.state.feedItemIds
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

	onDelete = (feedItem) => {
		const newFeedItemIds = [...this.state.feedItemIds];
		const idxToRemove = newFeedItemIds.indexOf(feedItem.id);
		newFeedItemIds.splice(idxToRemove, 1);

		const getMedia = Array.isArray(feedItem.mediaReference)
			? Promise.all(feedItem.mediaReference.map(ref => ref.get()))
			: feedItem.mediaReference.get()

		// feedItem.mediaReference.get()
		getMedia
			.then(result => {
				if (Array.isArray(result)) {
					return Promise.all(result.map(snapshot => {
						const data = snapshot.data();
						return this.props.firebaseStorage.ref().child(data.storageReference).delete();
					}))
				} else {
					const data = result.data();
					return this.props.firebaseStorage.ref().child(data.storageReference).delete();
				}
			})
			.then(() => {
				return this.props.firestore.doc(`feed/${feedItem.id}`).delete();
			})
			.catch(e => {
				const oldFeedItemIds = [...this.state.feedItemIds];
				oldFeedItemIds.splice(idxToRemove, 0, feedItem.id);
				this.setState({ feedItemIds: oldFeedItemIds });
			});

		this.setState({ feedItemIds: newFeedItemIds });
	}

	render() {
		return (
			<Context.Provider value={{
				feed: {
					items: this.state.feedItemIds.map(id => this.state.feedItems[id]),
					fetching: this.state.fetching,
					feedPageLastScrollPos: this.state.feedPageLastScrollPos,
					getItems: this.getFeedItems,
					loadMore: this.loadMore,
					subscribe: this.subscribeToFeedItems,
					unsubscribe: this.unsubscribeFeedItems,
					onDelete: this.onDelete,
					setFeedScrollPos: (yPos) => this.setState({ feedPageLastScrollPos: yPos }),
					likePost: this.likePost,
					unlikePost: this.unlikePost,
					loadingMore: this.state.loadingMore,
				}
			}}>
				{this.props.children}
			</Context.Provider>
		)
	}
}

export const FeedProvider = compose(
	withFirebase,
	withAuth,
)(FeedContextProvider);

export function withFeed(Component) {
	return function ComponentWrappedWithFirestore(props) {
		return (
			<Context.Consumer>
				{context => <Component {...props} feed={context.feed}/>}
			</Context.Consumer>
		)
	}
}
