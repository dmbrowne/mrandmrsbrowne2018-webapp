import React from 'react';
import { Avatar, CardHeader, IconButton } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { withFirebase } from '../store/firebase';

class FeedCardHeader extends React.Component {
	state = {
		user: {},
	}

	componentDidMount() {
		if (this.props.userId) {
			this.getUser();
		}
	}

	async getUser() {
		const { userId, firestore } = this.props;
		const snapshot = await firestore.doc(`users/${userId}`).get();
		if (snapshot.exists) {
			this.setState({
				user: {
					id: snapshot.id,
					ref: snapshot.ref,
					...snapshot.data(),
				}
			})
		}
	}

	avatar() {
		return this.state.user.photoURL
			? <Avatar src={this.state.user.photoURL} />
			: <Avatar><AccountCircle/></Avatar>
	}

	render() {
		return (
			<CardHeader
				avatar={this.avatar()}
				action={
					<IconButton>
						<MoreVertIcon />
					</IconButton>
				}
				title={this.state.user.displayName}
				subheader={this.props.headline}
			/>
		)
	}
}

export default withFirebase(FeedCardHeader);
