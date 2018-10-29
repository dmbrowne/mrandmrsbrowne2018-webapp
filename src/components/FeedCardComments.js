import React from 'react';
import { Typography, List, Button } from '@material-ui/core';
import { withComments } from '../store/comments';
import { withUsers } from '../store/users';
import { withAuth } from '../store/auth';
import { compose } from '../utils';
import FeedCardCommnent from './FeedCardCommnent';
import AddNewComment from './AddNewComment';
import withRouter from 'react-router/withRouter';

class FeedCardComments extends React.Component {
	componentDidMount() {
		const { feedPostId, comments } = this.props;
		comments.fetchCommentsForPost(feedPostId, 4);
	}
	
	addNewCommnent = ({comment}) => {
		return this.props.comments.addComment(
			this.props.feedPostId,
			this.props.auth.user.uid,
			comment,
		)
	}

	deleteComment = (commentId) => {
		return this.props.comments.removeComment(
			this.props.feedPostId,
			commentId,
		)
	}

	viewAllComments = () => {
		this.props.history.push(`/feed/${this.props.feedPostId}/comments`);
	}

	render() {
		const {
			comments: { allComments, orderedCommentsByPost },
		} = this.props;
		const postCommnentIds = orderedCommentsByPost[this.props.feedPostId];
		return (
			<footer className="comments">
				{!!postCommnentIds && !!postCommnentIds.length &&
					<div style={{
						padding: '0 16px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}>
						<Typography variant="body2">{postCommnentIds.length} comments</Typography>
						{postCommnentIds.length > 3 &&
							<Button variant="text" size="small" onClick={this.viewAllComments}>View all</Button>
						}
					</div>
				}
				{!!postCommnentIds && !!postCommnentIds.length &&
					<List>
						{postCommnentIds.slice(0, 3).reverse().map(commentId => {
							const {ref, ...comment} = allComments[commentId];
							return (
								<FeedCardCommnent
									key={commentId}
									reference={ref}
									onDeleteComment={this.deleteComment}
									{...comment}
								/>
							)
						})}
					</List>
				}
				<AddNewComment onSubmit={this.addNewCommnent} />
			</footer>
		)
	}
}

export default compose(
	withAuth,
	withUsers,
	withComments,
	withRouter,
)(FeedCardComments);
