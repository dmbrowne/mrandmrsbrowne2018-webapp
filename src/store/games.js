import * as React from 'react';
import { withFirebase } from '../firebase';

const Context = React.createContext({
	gamesById: {},
	scenariosById: {},
	scenariosByGame: {},
	otherUserMedia: {},
	getGame: () => {},
	getGameScenarios: () => {},
	fetchScenario: () => {},
	fetchScenarioMediaByOtherUsers: () => {},
});

class GamesProviderComponent extends React.Component {
	state = {
		games: {},
		scenariosById: {},
		scenariosByGame: {},
		otherUserMedia: {},
	}

	getGame = (gameUuid) => {
		this.props.firestore.doc(`games/${gameUuid}`).get().then(snapshot => {
			if (snapshot.exists) {
				this.setState(state => ({
					games: {
						...state.games,
						[gameUuid]: {
							id: snapshot.id,
							ref: snapshot.ref,
							...snapshot.data(),
						},
					},
				}));
			}
		})
	}

	getGameScenarios = (gameUuid) => {
		this.props.firestore
			.collection(`games/${gameUuid}/scenarios`)
			.get()
			.then(snapshot => {
				const scenarios = snapshot.docs.map(doc => ({
					id: doc.id,
					ref: doc.ref,
					...doc.data(),
				}));
				const scenariosById = scenarios.reduce((accum, scene) => ({
					...accum,
					[scene.id]: scene,
				}), {})

				this.setState(state => ({
					scenariosById,
					scenariosByGame: {
						...state.scenariosByGame,
						[gameUuid]: scenarios.map(scene => scene.id),
					},
				}));
			});
	}

	fetchScenario = (gameUuid, scenarioId) => {
		this.props.firestore
			.doc(`games/${gameUuid}/scenarios/${scenarioId}`).get().then(snapshot => {
				if (snapshot.exists) {
					this.setState(state => {
						const scenarios = state.scenariosByGame[gameUuid] || [];
						return {
							scenariosById: {
								...state.scenariosById,
								[scenarioId]: {
									id: snapshot.id,
									ref: snapshot.ref,
									...snapshot.data(),
								}
							},
							scenariosByGame: {
								...state.scenariosByGame,
								[gameUuid]: scenarios.includes(snapshot.id)
									? scenarios
									: [...scenarios, snapshot.id],
							},
						}
					});
				}
			})
	}

	fetchScenarioMediaByOtherUsers(gameId, scenarioId, excludingUserId, after) {
		let ref = this.props.firestore
			.doc(`games/${gameId}`)
			.doc(`scenarios/${scenarioId}`)
			.collection('media')
			.where('userId', '!=', excludingUserId)
			.orderBy('createdAt', 'desc')

		if (after) {
			ref = ref.startAfter(after);
		}

		ref.limit(10);

		ref.get().then(snapshot => {
			const medias = snapshot.docs.map(snap => ({ ...snap, ...snap.data() }));
			this.setState({
				otherUserMedia: {
					[scenarioId]: [
						...this.state.otherUserMedia[scenarioId] || [],
						...medias,
					],
				}
			})
		})
	}

	render() {
		const { Component } = this.props;
		return (
			<Context.Provider value={{
				gamesById: this.state.games,
				scenariosById: this.state.scenariosById,
				scenariosByGame: this.state.scenariosByGame,
				otherUserMedia: this.state.otherUserMedia,
				getGame: this.getGame,
				getGameScenarios: this.getGameScenarios,
				fetchScenario: this.fetchScenario,
				fetchScenarioMediaByOtherUsers: this.fetchScenarioMediaByOtherUsers,
			}}>
				{this.props.children}
			</Context.Provider>
		)
	}
}
export const GamesProvider = withFirebase(GamesProviderComponent);

export function withGames(Component) {
	return function ComponentWrappedWithFirestore(props) {
		return (
			<Context.Consumer>
				{context => <Component {...props} games={context} />}
			</Context.Consumer>
		)
	}
}
