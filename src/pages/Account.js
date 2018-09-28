import React from 'react';
import { Link } from 'react-router-dom';
import { withAuth } from '../store/auth';
import { withFirebase } from '../firebase';
import {
	Button,
	Avatar,
	CircularProgress,
	TextField,
	AppBar,
	Toolbar,
	Typography,
	IconButton
} from '@material-ui/core';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import { debounce } from '../utils';

class Account extends React.Component {
	state = {
		displayName: '',
	}

	nameUpdate = null

	signOut = () => {
		this.props.firebase.auth().signOut().then(() =>
		this.props.history.push('/signin')
		);
	}

	updateDisplayName = (e) => {
		const displayName = e.target.value;
		this.setState({ displayName }, () => this.updateName())
	}

	updateName() {
		clearTimeout(this.nameUpdate)
    this.nameUpdate = setTimeout(() => {
			const { auth: { user }, firestore } = this.props;
			const { displayName } = this.state;
			firestore.doc(`users/${user.uid}`).update({ displayName }),
			user.updateProfile({ displayName })
		}, 500)
	}

	onInputBlur = () => {
		this.forceUpdate(() => this.setState({ displayName: '' }));
	}

	render() {
		const { auth: { user } } = this.props;
		return (
			<div className="account">
				<AppBar position="fixed">
					<Toolbar>
						<Link className="toolbar-link" to="/">
							<IconButton color="inherit">
								<ArrowBackIos />
							</IconButton>
							<Typography variant="title" color="inherit" style={{ flexGrow: 1 }}>The App</Typography>
						</Link>
					</Toolbar>
				</AppBar>
				<div>
					<img className="avatar" src={user.photoURL} />
				</div>
				<div className="name-input-control">
					<TextField
						required
						value={this.state.displayName || user.displayName}
						onChange={this.updateDisplayName}
						onBlur={this.onInputBlur}
						inputProps={{
							className: 'name-input'
						}}
						fullWidth
					/>
				</div>
        <Button
					className="signout-btn"
					variant="raised"
					color="secondary"
					size="large"
					onClick={this.signOut}
				>
          Sign Out
        </Button>
				<style jsx>{`
					.account {
						text-align: center;
						padding: 64px 24px 24px;
					}
					.avatar {
						width: 200px;
						border-radius: 50%;
						margin: 16px 0;
					}
					.name-input-control {
						margin: 16px 0;
					}
					.account :global(.signout-btn) {
						margin-top: 32px;
					}
					.account :global(.name-input) {
						text-align: center;
					}
					.account :global(a) {
						color: #fff;
						text-decoration: none;
					}
					.account :global(.toolbar-link) {
						display: flex;
						align-items: center;
					}
				`}</style>
			</div>
		);
	}
}

export default withFirebase(
	withAuth(Account, () => (
		<div>
			<CircularProgress />
		</div>
	))
);
