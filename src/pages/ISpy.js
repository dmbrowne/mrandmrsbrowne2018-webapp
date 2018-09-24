import React from 'react';
import { Link } from 'react-router-dom';
import { withFirebase } from '../store/firebase';

class ISpy extends React.Component {
	state = {
		scenarios: []
	}

	componentDidMount() {
		this.props.firestore
			.collection('games/ispy/scenarios')
			.get()
			.then(snapshot => {
				const scenarios = snapshot.docs.map(doc => ({
					id: doc.id,
					ref: doc.ref,
					...doc.data(),
				}));
				this.setState({ scenarios })
			})
	}

	render() {
		const { match } = this.props;
		return (
			<div>
				<h1>I-Spy</h1>
				{this.state.scenarios.map(scenario =>
					<p key={scenario.id}>
						<Link to={`${match.url}/${scenario.id}`}>{scenario.title}</Link>
					</p>
				)}
			</div>
		)
	}
}

export default withFirebase(ISpy);
