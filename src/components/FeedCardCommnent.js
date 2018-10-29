import React from 'react';
import { withUsers } from '../store/users';
import UserAvatar from './UserAvatar';
import { compose } from '../utils';
import {
	ListItem,
	ListItemText,
	Avatar,
	Typography,
	IconButton, Menu, MenuItem, ListItemSecondaryAction, ClickAwayListener,
} from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import moment from 'moment';
import { withAuth } from '../store/auth';
import { withComments } from '../store/comments';

class FeedCardComment extends React.Component {
	state = {
		anchorEl: null,
	}

	componentDidMount() {
		const { users, userId } = this.props;
		users.fetchUserIfNonExistent(userId);
	}

	handleOptionsClick = event => {
		this.setState({ anchorEl: event.currentTarget });
	};

	handleOptionsClose = () => {
		this.setState({ anchorEl: null });
	};

	onDeleteComment = () => {
		if (window.confirm('Delete your comment?')) {
			this.props.onDeleteComment(this.props.id)
		}
		this.handleOptionsClose();
	}

	render() {
		const { users, auth } = this.props;
		const {ref, ...user} = users.usersById[this.props.userId] || {};
		const commentOwnedByAuthenticatedUser = this.props.userId === auth.user.uid;
		return (
			<ListItem style={{ alignItems: 'flex-start' }}>
				<Avatar style={{ width: 24, height: 24 }}>
					<UserAvatar user={user} />
				</Avatar>
				<ListItemText
					disableTypography
					primary={
						<Typography variant="caption" style={{ color: 'rgba(0, 0, 0, 0.87)' }}>
							{user.displayName}
							<Typography variant="caption" style={{ display: 'inline', marginLeft: 16 }}>
								{moment.unix(this.props.createdAt.seconds).fromNow()}
							</Typography>
						</Typography>
					}
					secondary={
						<Typography variant="caption">
							{this.props.comment}
						</Typography>
					}
				/>
				{commentOwnedByAuthenticatedUser &&
					<ListItemSecondaryAction>
						<IconButton onClick={this.handleOptionsClick}>
							<MoreVertIcon style={{ width: '0.7em', height: '0.7em' }}/>
						</IconButton>
						<ClickAwayListener onClickAway={this.handleOptionsClose}>
							<Menu
								className="comment-menu"
								anchorEl={this.state.anchorEl}
								open={!!this.state.anchorEl}
								onClose={this.handleOptionsClose}
							>
								<MenuItem style={{ padding: 8, fontSize: 12 }} onClick={this.onDeleteComment}>Delete comment</MenuItem>
							</Menu>
						</ClickAwayListener>
					</ListItemSecondaryAction>
				}
				<style jsx>{`
					:global(.comment-menu ul) { padding: 0 }
				`}</style>
			</ListItem>
		)
	}
}

export default compose(
	withUsers,
	withAuth,
	withComments,
)(FeedCardComment);
