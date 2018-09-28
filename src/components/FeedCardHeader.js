import React from 'react';
import { CardHeader, IconButton } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import UserAvatar from './UserAvatar';
import { withUsers } from '../store/users';

class FeedCardHeader extends React.Component {
  componentDidMount() {
		const { users, userId } = this.props;
		users.fetchUserIfNonExistent(userId);
  }

  render() {
		const { users, userId, headline, className } = this.props;
		const user = users.usersById[userId];
    return (
      <CardHeader
        {...className ? { className } : {}}
				avatar={user && <UserAvatar user={user} />}
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
				title={user && user.displayName}
        subheader={this.props.headline}
      />
    );
  }
}

export default withUsers(FeedCardHeader);
