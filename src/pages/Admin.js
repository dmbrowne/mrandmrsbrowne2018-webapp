import React from 'react';
import { withAuth } from '../store/auth';
import { compose } from '../utils';
import { withFirebase } from '../firebase/context';
import { Button } from '@material-ui/core';

class Admin extends React.Component {
	migrate = this.props.firebaseFunctions.httpsCallable('migrateMediaData');

	componentDidMount() {
		if (this.props.auth.user === null) {
			this.props.history.push("/signin");
			return null;
		}
	}

	migrateMedia = () => {
		this.migrate()
		.then((res) => {
			console.log(res);
		})
		.catch(err => {
			console.error(err);
		})
	}

	render() {
		return (
			<div>
				<h1>Admin</h1>
				<Button variant="contained" onClick={this.migrateMedia}>Migrate</Button>
			</div>
		)
	}
}

export default compose(
	withFirebase,
	withAuth,
)(Admin)