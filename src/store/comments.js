import React from 'react';
import { withFirebase } from '../firebase';
import moment from 'moment';

const CommentsContext = React.createContext({
	allComments: {},
	orderedCommentsByPost: {},
	fetchCommentsForPost: () => {},
	addComment: () => {},
	removeComment: () => {},
});

class CommentsContextProvider extends React.Component {
	state = {
		allComments: {},
		orderedCommentsByPost: {}
	}

	fetchCommentsForPost = (feedPostId, limit) => {
		const ref = this.props.firestore
			.collection(`feedPostComments/${feedPostId}/comments`)
			.orderBy('createdAt', 'desc');

		if (limit) {
			ref.limit(limit)
		}

		ref.onSnapshot(snapshot => {
			if (snapshot.empty) return;
			const commentsData = snapshot.docs.reduce((accum, doc) => {
				const { id, ref } = doc;
				return {
					orderById: [...accum.orderById, id],
					comments: {
						...accum.comments,
						[id]: { id, ref, ...doc.data() }
					}
				}
			}, { orderById: [], comments: {} });

			this.setState(state => ({
				allComments: {
					...state.allComments,
					...commentsData.comments,
				},
				orderedCommentsByPost: {
					...state.orderedCommentsByPost,
					[feedPostId]: commentsData.orderById,
				}
			}))
		})
	}

	addComment = (feedPostId, userId, comment) => {
		const ref = this.props.firestore.collection(`feedPostComments/${feedPostId}/comments`);
		const { id } = ref.doc();
		const { allComments, orderedCommentsByPost } = this.state;

		const createNewCommentThenable = ref.doc(id).set({
			userId,
			comment
		})
		.catch(e => {
			this.setState({
				allComments: {...allComments},
				orderedCommentsByPost: {...orderedCommentsByPost},
			});
			throw new Error(e);
		});

		const updatedComments = {
			...allComments,
			[id]: {
				id, ref, userId, comment, createdAt: {
					seconds: moment().unix(),
				}
			}
		};

		const updatedCommentsOrderedByPost = {
			...orderedCommentsByPost,
			[feedPostId]: [
				id,
				...orderedCommentsByPost[feedPostId] || [],
			]
		};

		this.setState({
			allComments: updatedComments,
			orderedCommentsByPost: updatedCommentsOrderedByPost,
		});

		return createNewCommentThenable;
	}

	removeComment = (feedPostId, commentId) => {
		const ref = this.props.firestore.doc(`feedPostComments/${feedPostId}/comments/${commentId}`);
		const updatedComments = {...this.state.allComments};
		const updatedOrderedComments = [...this.state.orderedCommentsByPost[feedPostId]];
		delete updatedComments[commentId];
		updatedOrderedComments.splice(updatedOrderedComments.indexOf(commentId), 1);
		const previousCommentsState = {
			allComments: this.state.allComments,
			orderedCommentsByPost: this.state.orderedCommentsByPost,
		};
		this.setState({
			allComments: updatedComments,
			orderedCommentsByPost: {
				...this.state.orderedCommentsByPost,
				[feedPostId]: updatedOrderedComments,
			},
		})
		return ref.delete().catch(e => {
			this.setState({ ...previousCommentsState });
		});
	}

	render() {
		return (
			<CommentsContext.Provider value={{
				allComments: this.state.allComments,
				orderedCommentsByPost: this.state.orderedCommentsByPost,
				addComment: this.addComment,
				removeComment: this.removeComment,
				fetchCommentsForPost: this.fetchCommentsForPost,
			}}>
				{this.props.children}
			</CommentsContext.Provider>
		)
	}
}
export const CommentsProvider = withFirebase(CommentsContextProvider);

export function withComments(Component) {
	return function FirestoreCommentsWrappedComponent(props) {
		return (
			<CommentsContext.Consumer>
				{context => <Component {...props} comments={context} />}
			</CommentsContext.Consumer>
		)
	}
}