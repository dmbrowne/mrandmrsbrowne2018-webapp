import React from 'react';
import { Avatar } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { withUsers } from '../store/users';

export default function UserAvatar({ user, ...props }) {
	return user && user.photoURL
		? <Avatar {...props} src={user.photoURL} />
		: <Avatar {...props}><AccountCircle/></Avatar>
}

export const UserAvatarWithFetch = withUsers(
	class UserAvatarWithFetchComponent extends React.Component {
		componentDidMount() {
			const { users, userId } = this.props;
			users.fetchUserIfNonExistent(userId);
		}

		render() {
			const { users, userId } = this.props;
			const user = users.usersById[userId];
			return <UserAvatar user={user} />
		}
	}
);