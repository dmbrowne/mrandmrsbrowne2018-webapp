import React from 'react';
import { withComments } from '../store/comments';
import FeedCardCommnent from '../components/FeedCardCommnent';
import { List } from '@material-ui/core';

class PostComments extends React.Component {
	componentDidMount() {
		const { postId } = this.props.match.params;
		this.props.comments.fetchCommentsForPost(postId);
	}

	render() {
		const { postId } = this.props.match.params;
		const { allComments, orderedCommentsByPost } = this.props.comments;
		const postCommnentIds = orderedCommentsByPost[postId];
		return (
			<div className="all-comments">
				{!!postCommnentIds && !!postCommnentIds.length &&
					<List>
						{postCommnentIds.map(commentId => {
							const { ref, ...comment } = allComments[commentId];
							return (
								<FeedCardCommnent key={commentId} {...comment} />
							)
						})}
					</List>
				}
			</div>
		)
	}
}

export default withComments(PostComments);