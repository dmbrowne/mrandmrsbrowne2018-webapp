import React from 'react';
import { CardHeader, IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import UserAvatar from './UserAvatar';
import { withUsers } from '../store/users';

class FeedCardHeader extends React.Component {
	state = {
		anchorEl: null,
	};

  componentDidMount() {
		const { users, userId } = this.props;
		users.fetchUserIfNonExistent(userId);
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

	menuClick = () => {
		this.props.onDelete();
		this.handleClose();
	}

  render() {
		const { users, userId, headline, className, onDelete } = this.props;
		const user = users.usersById[userId];
    return (
      <CardHeader
        {...className ? { className } : {}}
				avatar={<UserAvatar user={user} />}
        action={onDelete && (
					<div>
						<IconButton onClick={this.handleClick}>
							<MoreVertIcon />
						</IconButton>
						<Menu
							id="simple-menu"
							anchorEl={this.state.anchorEl}
							open={!!this.state.anchorEl}
							onClose={this.handleClose}
						>
							<MenuItem onClick={this.menuClick}>Delete</MenuItem>
						</Menu>
					</div>
        )}
				title={headline}
        subheader={(user && user.displayName) || ''}
      />
    );
  }
}

export default withUsers(FeedCardHeader);
