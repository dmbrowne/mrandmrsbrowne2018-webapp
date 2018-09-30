import React from 'react';
import { Avatar, CardHeader, IconButton } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';

export default function UserAvatar({ user, ...props }) {
	return user && user.photoURL
		? <Avatar {...props} src={user.photoURL} />
		: <Avatar {...props}><AccountCircle/></Avatar>
}
