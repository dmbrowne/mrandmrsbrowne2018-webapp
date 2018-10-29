import React from 'react';
import { withFirebase } from '../firebase';
import { TextField , Button } from '@material-ui/core';

class ConfigureISpy extends React.Component {
	state = {
		scenarios: []
	}

	componentDidMount() {
		this.props.firestore.collection('games/ispy/scenarios').orderBy('order').onSnapshot(snapshot => {
			this.setState({
				scenarios: snapshot.docs.map(doc => ({
					id: doc.id,
					ref: doc.ref,
					...doc.data(),
				})),
			});
		});
	}

	addScenario = () => {
		const lastScenario = this.state.scenarios[this.state.scenarios.length - 1];
		this.props.firestore.collection('games/ispy/scenarios').add({
			order: lastScenario + 1,
			title: '',
			description: '',
		})
	}
	
	render() {
		return (
			<div>
				<h1>Scenarios</h1>
				{this.state.scenarios.map(scenario => {
					return (
						<div>
							<TextField
								label="Order"
								value={scenario.order}
								type="number"
							/>
							<TextField
								label="Title"
								value={scenario.title || ''}
								onChange={e => scenario.ref.update({ title: e.target.value })}
							/>
							<TextField
								label="Description"
								value={scenario.description || ''}
								onChange={e => scenario.ref.update({ description: e.target.value })}
							/>
						</div>
					)
				})}
				<Button onClick={() => this.addScenario()}>Add Scenario</Button>
			</div>
		)
	}
}

export default withFirebase(ConfigureISpy);
